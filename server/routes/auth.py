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
from server.model import User
from werkzeug.security import generate_password_hash, check_password_hash

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
        #& decode both the received state and stored state to compare their raw values
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

    #& validate user creds, generate tokens, store oauth tokens and user info in db
    user = User.query.filter_by(spotify_id=spotify_id).first()
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=token_info.get('expires_in', 3600))
    if user:
        user.oauth_token = token_info.get('access_token')
        user.refresh_token = token_info.get('refresh_token', user.refresh_token)
        user.expires_at = expires_at
        user.display_name = display_name
    else:
        user = User(
            spotify_id=spotify_id,
            email=email,
            display_name=display_name,
            role='guest',
            oauth_token=token_info.get('access_token'),
            refresh_token=token_info.get('refresh_token'),
            created_at=datetime.now(timezone.utc)
        )
        db.session.add(user)
    db.session.commit()

    session['user'] = {
        'id': user.id,
        'spotify_id': user.spotify_id,
        'email': user.email,
        'display_name': user.display_name,
        'role': user.role
    }
    
    client_home_url = os.environ.get('CLIENT_HOME_URL', 'http://localhost:5173/home')
    if client_home_url.endswith('/'):
        client_home_url = client_home_url[:-1]
    print(f"redirecting to: {client_home_url}") #? debugging
    return redirect(client_home_url)

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

    #& generate new jwt to update expiration
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
@auth_bp.route('/rewrapped/register', methods=['POST'])
def rewrapped_register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role_choice = data.get('role')  #~ 'regular' / 'promoter'
    store_history = data.get('store_listening_history', False)

    if not username or not password or role_choice not in ['regular', 'promoter']:
        return jsonify({'error': 'Invalid input'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

    #& user should already be logged in via Oauth (guest) & user id passed query param
    user_id = request.args.get('user_id')
    if user_id:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        #& update existing guest user with registration info
        user.username = username
        user.set_password(password)
        user.role = role_choice
        user.store_listening_history = store_history
        db.session.commit()
        return jsonify({'message': 'Registration successful, user upgraded'}), 200
    else:
        #& more for case handling, create new user record if no Spotify user exist
        new_user = User(
            username=username,
            role=role_choice,
            store_listening_history=store_history,
            email="",  #~ optional; require email if need
            spotify_id="",  #~ may be blank for non-OAuth user
            display_name=username
        )
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'Registration successful, new user created'}), 201
    
#& Re-Wrapped login
@auth_bp.route('/rewrapped/login', methods=['POST'])
def rewrapped_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Invalid input'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401

    #& maybe generate JWT token / set up sesh
    return jsonify({'message': 'Login successful', 'user': {
        'id': user.id,
        'username': user.username,
        'role': user.role
    }}), 200