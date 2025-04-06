from flask import Blueprint, jsonify, request, redirect, session
import secrets  #& generate random state
import os
import urllib.parse
import base64
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
import requests
import jwt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
load_dotenv()
from server.extensions import db
from server.model import User, UserPreference, ListeningHistory, SavedEvent, Event, AggregatedStats
from werkzeug.security import generate_password_hash, check_password_hash
import re

#& jwt config
JWT_SECRET = os.environ.get('JWT_SECRET', 'default-jwt-secret')
JWT_ALGORITHM = "HS256"

auth_bp = Blueprint('auth', __name__)

SPOTIFY_CLIENT_ID = os.environ.get('SPOTIFY_CLIENT_ID')
SPOTIFY_CLIENT_SECRET = os.environ.get('SPOTIFY_CLIENT_SECRET')
SPOTIFY_REDIRECT_URI = os.environ.get('SPOTIFY_REDIRECT_URI')

SCOPES = 'user-read-recently-played user-top-read playlist-read-private playlist-read-collaborative user-library-read user-follow-read user-read-private user-read-email'

#& sign and validate state parameter
serializer = URLSafeTimedSerializer(os.environ.get('SECRET_KEY', 'default-secret-key'))

@auth_bp.route('/login', methods=['GET'])
def login():
    #& generate secure random state string and sign
    raw_state = secrets.token_urlsafe(16)
    state = serializer.dumps(raw_state)
    session['spotify_oauth_state'] = state  #~ store state for later validation
    #& spotify auth url with req query params
    params = {
        'client_id': SPOTIFY_CLIENT_ID,
        'response_type': 'code',
        'redirect_uri': SPOTIFY_REDIRECT_URI,
        'scope': SCOPES,
        'state': state,
        'show_dialog': True  #! so can open debug & test when user tries login. !!!remove in production.
    }
    query_params = urllib.parse.urlencode(params)
    auth_url = f'https://accounts.spotify.com/authorize?{query_params}'
    #& validate user creds, generate tokens, etc
    return redirect(auth_url)

@auth_bp.route('/callback', methods=['GET'])
def callback():
    #& get auth code and state from query params
    code = request.args.get('code')
    state = request.args.get('state')
    error = request.args.get('error')
    if error:
        return jsonify({'error': error}), 400
    if not code:
        return jsonify({'error': 'missing code param'}), 400

    #& validate the state
    saved_state = session.get('spotify_oauth_state')
    if not saved_state:
        return jsonify({'error': 'state not found in session'}), 400

    try:
        raw_state = serializer.loads(state, max_age=600)
        raw_saved_state = serializer.loads(saved_state, max_age=600)
    except (BadSignature, SignatureExpired):
        return jsonify({'error': 'state mismatch / expired'}), 400

    if raw_state != raw_saved_state:
        return jsonify({'error': 'invalid state'}), 400

    #& exchange auth code for access token
    token_url = 'https://accounts.spotify.com/api/token'
    auth_str = f'{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}'
    b64_auth_str = base64.b64encode(auth_str.encode()).decode()

    headers = {
        'Authorization': f'Basic {b64_auth_str}',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': SPOTIFY_REDIRECT_URI
    }

    response = requests.post(token_url, headers=headers, data=data)
    if response.status_code != 200:
        return jsonify({
            'error': 'retrieve access token failed',
            'details': response.json()
        }), response.status_code

    token_info = response.json()

    #& take user profile from spotify
    profile_url = 'https://api.spotify.com/v1/me'
    profile_headers = {
        'Authorization': f"Bearer {token_info.get('access_token')}"
    }
    profile_response = requests.get(profile_url, headers=profile_headers)
    if profile_response.status_code != 200:
        return jsonify({
            'error': 'retrieve user profile failed',
            'details': profile_response.json()
        }), profile_response.status_code

    profile_data = profile_response.json()
    spotify_id = profile_data.get('id')
    email = profile_data.get('email')
    display_name = profile_data.get('display_name')
    images = profile_data.get('images')
    profile_image_url = images[0].get('url') if images and len(images) > 0 else ''
    country = profile_data.get('country')
    followers_data = profile_data.get('followers')
    followers = followers_data.get('total') if followers_data else None

    user = User.query.filter_by(spotify_id=spotify_id).first()
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=token_info.get('expires_in', 3600))
    if user:
        user.oauth_token = token_info.get('access_token')
        user.refresh_token = token_info.get('refresh_token', user.refresh_token)
        user.expires_at = expires_at
        user.display_name = display_name
        user.email = email
        user.profile_image_url = profile_image_url
        user.country = country
        user.followers = followers
    else:
        user = User(
            spotify_id=spotify_id,
            email=email,
            display_name=display_name,
            role='guest',
            oauth_token=token_info.get('access_token'),
            refresh_token=token_info.get('refresh_token'),
            created_at=datetime.now(timezone.utc),
            profile_image_url=profile_image_url,
            country=country,
            followers=followers
        )
        db.session.add(user)
    db.session.commit()
    
    session['user'] = {
        'id': user.id,
        'spotify_id': user.spotify_id,
        'email': user.email,
        'display_name': user.display_name,
        'role': user.role,
        'username': user.username if user.username else None,
        'profile_image_url': user.profile_image_url,
        'country': user.country,
        'followers': user.followers
    }
    
    #&redirect to base url instead of /home path
    client_base_url = os.environ.get('CLIENT_HOME_URL', 'http://localhost:5173/home')
    #~ rmf /home frm endpoint
    if '/home' in client_base_url:
        client_base_url = client_base_url.replace('/home', '')
    if client_base_url.endswith('/'):
        client_base_url = client_base_url[:-1]
    print(f"redirecting to: {client_base_url}")  #? debugging
    return redirect(client_base_url)

@auth_bp.route('/refresh-token', methods=['GET'])
def refresh_token():
    #& user tokens validation and update in db via jwt auth
    #~ extract jwt from auth header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer'):
        return jsonify({'error': 'auth header missing / invalid'}), 401
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
    except Exception as e:
        return jsonify({'error': 'invalid jwt token', 'details': str(e)}), 401

    user = User.query.get(user_id)
    if not user or not user.refresh_token:
        return jsonify({'error': 'user not found / no refresh token available'}), 400

    token_url = 'https://accounts.spotify.com/api/token'
    req_body = {
        'grant_type': 'refresh_token',
        'refresh_token': user.refresh_token,
        'redirect_uri': SPOTIFY_REDIRECT_URI,
        'client_id': SPOTIFY_CLIENT_ID,
        'client_secret': SPOTIFY_CLIENT_SECRET
    }
    response = requests.post(token_url, data=req_body)
    print("Refresh response:", response.json()) #? debugging
    if response.status_code != 200:
        return jsonify({
            'error': 'failed to refresh token',
            'details': response.json()
        }), response.status_code

    new_token_info = response.json()
    user.oauth_token = new_token_info.get('access_token')
    user.expires_at = datetime.now(timezone.utc) + timedelta(seconds=new_token_info.get('expires_in', 3600))
    db.session.commit()

    #~ generate new jwt to update expiration
    new_jwt_payload = {
        'user_id': user.id,
        'exp': datetime.now(timezone.utc) + timedelta(days=1)
    }
    new_jwt_token = jwt.encode(new_jwt_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return jsonify({
        'message': 'token refreshed successfully',
        'new_token_info': new_token_info,
        'jwt': new_jwt_token
    })

@auth_bp.route('/user', methods=['GET'])
def get_current_user():
    if 'user' in session:
        return jsonify({'user': session['user']})
    else:
        return jsonify({'error': 'not authenticated'}), 401
    
#& Re-Wrapped registration
@auth_bp.route('/rewrapped/register', methods=['POST', 'OPTIONS'])
def rewrapped_register():
    #~ handle preflight OPTIONS req
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    #~ get data frm req
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role_choice = data.get('role')  #~ 'regular' / 'promoter'
    store_history = data.get('store_listening_history', None)  #~ now must be provided and truthy

    #~ form validation check
    if not username:
        return jsonify({'error': 'Username is required'}), 400
    if not password:
        return jsonify({'error': 'Password is required'}), 400
    if not role_choice:
        return jsonify({'error': 'Role is required'}), 400
    if store_history is None or store_history is False:
        return jsonify({'error': 'Consent to store listening history is required'}), 400

    #~ pw validation check
    if len(password) < 8 or not re.search(r'[A-Z]', password) or not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return jsonify({'error': 'Password must be at least 8 characters long, contain at least one uppercase letter and one special character'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

    #~ get current user frm sesh
    user_info = session.get('user')
    if user_info and user_info.get('id'):
        user_id = user_info.get('id')
        user = User.query.get(user_id)
        if user.username:
            return jsonify({'error': 'You are already logged in / you already have an account tied to this Spotify ID!'}), 400
        #~ update existing guest user with registration info
        user.username = username
        user.set_password(password)
        user.role = role_choice
        user.store_listening_history = store_history
        db.session.commit()
        #~ update session data with the new user info
        session['user'] = {
            'id': user.id,
            'spotify_id': user.spotify_id,
            'email': user.email,
            'display_name': user.display_name,
            'role': user.role,
            'username': user.username,
            'profile_image_url': user.profile_image_url,
            'country': user.country,
            'followers': user.followers
        }
        return jsonify({'message': 'Registration successful, user upgraded', 'user': session['user']}), 200
    else:
        #~ oauth user sesh case handling
        new_user = User(
            username=username,
            role=role_choice,
            store_listening_history=store_history,
            email="",  #~ optional; require email if needed
            spotify_id="",  #~ may be blank for non-oauth user
            display_name=username
        )
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        #~ update session data with the new user info
        session['user'] = {
            'id': new_user.id,
            'spotify_id': new_user.spotify_id,
            'email': new_user.email,
            'display_name': new_user.display_name,
            'role': new_user.role,
            'username': new_user.username,
            'profile_image_url': new_user.profile_image_url,
            'country': new_user.country,
            'followers': new_user.followers
        }
        return jsonify({'message': 'Registration successful, new user created', 'user': session['user']}), 201

#& Re-Wrapped login
@auth_bp.route('/rewrapped/login', methods=['POST'])
def rewrapped_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Invalid input'}), 400

    #& check if session already contain registered user
    user_info = session.get('user')
    if user_info and user_info.get('username'):
        return jsonify({'error': 'You are already logged in / you already have an account tied to this Spotify ID!'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401

    #& set session user info with relevant details
    session['user'] = {
        'id': user.id,
        'spotify_id': user.spotify_id,
        'email': user.email,
        'display_name': user.display_name,  #~ always use Spotify display name
        'role': user.role,
        'username': user.username
    }
    #& maybe generate JWT token / set up sesh
    return jsonify({'message': 'Login successful', 'user': {
        'id': user.id,
        'username': user.username,
        'role': user.role
    }}), 200

#& profile: change pw
@auth_bp.route('/change-password', methods=['POST', 'OPTIONS'])
def change_password():
    if request.method == 'OPTIONS':
        return jsonify({}), 200  #~ respond preflight req use HTTP 200
    data = request.get_json()
    user_id = data.get('user_id')
    currentPassword = data.get('currentPassword')
    newPassword = data.get('newPassword')
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if not user.check_password(currentPassword):
        return jsonify({'error': 'Current password is incorrect'}), 400

    import re
    if len(newPassword) < 8 or not re.search(r'[A-Z]', newPassword) or not re.search(r'[!@#$%^&*(),.?":{}|<>]', newPassword):
        return jsonify({'error': 'Password must be at least 8 characters long, contain at least one uppercase letter and one special character'}), 400

    user.set_password(newPassword)
    db.session.commit()
    return jsonify({'message': 'Password changed successfully'}), 200

#& fetch preferences
@auth_bp.route('/user/preferences', methods=['GET'])
def get_preferences():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({'error': 'Invalid user_id'}), 400
    user_pref = UserPreference.query.filter_by(user_id=user_id).first()
    if not user_pref or not user_pref.preferences:
        return jsonify({'preferences': {}}), 200
    return jsonify({'preferences': user_pref.preferences}), 200

#& create/update preferences
@auth_bp.route('/user/preferences', methods=['POST', 'OPTIONS'])
def set_preferences():
    if request.method == 'OPTIONS':
        return jsonify({}), 200  #~ respond preflight req use HTTP 200
    data = request.get_json()
    user_id = data.get('user_id')
    favoriteArtists = data.get('favoriteArtists')
    favoriteGenres = data.get('favoriteGenres')
    favoriteVenues = data.get('favoriteVenues')
    
    user_pref = UserPreference.query.filter_by(user_id=user_id).first()
    if not user_pref:
        user_pref = UserPreference(user_id=user_id, preferences={})
        db.session.add(user_pref)
    user_pref.preferences = {
        'favoriteArtists': favoriteArtists,
        'favoriteGenres': favoriteGenres,
        'favoriteVenues': favoriteVenues
    }
    db.session.commit()
    return jsonify({'message': 'Preferences saved successfully'}), 200

#& del acc
@auth_bp.route('/delete-account', methods=['POST'])
def delete_account():
    """
    Deletes user's listening history and resets account to guest status.
    
    Request body:
    {
        "user_id": user_id,
        "password": current_password
    }
    """
    data = request.get_json()
    user_id = data.get('user_id')
    password = data.get('password')
    
    if not user_id or not password:
        return jsonify({'error': 'Missing required fields'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    #~ verify pw
    if not user.check_password(password):
        return jsonify({'error': 'Incorrect password'}), 401
    
    try:
        #~ 1. delete listening history
        ListeningHistory.query.filter_by(user_id=user_id).delete()
        
        #~ 2. delete aggregated stats
        AggregatedStats.query.filter_by(user_id=user_id).delete()
        
        #~ 3. delete saved events
        SavedEvent.query.filter_by(user_id=user_id).delete()
        
        #~ 4. delete user prefs
        UserPreference.query.filter_by(user_id=user_id).delete()
        
        #~ 5. handle events created by user (if promoter)
        if user.role == 'promoter':
            Event.query.filter_by(promoter_id=user_id).delete()
        
        #~ 6. reset user to guest status but keep Spotify connection
        user.role = 'guest'
        user.username = None
        user.password_hash = None
        user.store_listening_history = False
        
        #~ 7. commit all changes
        db.session.commit()
        
        #~ 8. update session
        if 'user' in session:
            session['user'] = {
                'id': user.id,
                'spotify_id': user.spotify_id,
                'email': user.email,
                'display_name': user.display_name,
                'role': 'guest',
                'username': None,
                'profile_image_url': user.profile_image_url,
                'country': user.country,
                'followers': user.followers
            }
        
        return jsonify({
            'message': 'Account reset successfully. Your listening history has been deleted, and your account has been reset to guest status.'
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error during account deletion: {str(e)}")
        return jsonify({'error': 'An error occurred during account deletion'}), 500

#& clear sesh to log out user frm OAuth session
@auth_bp.route('/logout', methods=['POST'])
def logout_route():
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200