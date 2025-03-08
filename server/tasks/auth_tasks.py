from celery import shared_task
import requests
from datetime import datetime, timezone, timedelta
from server.extensions import db
from server.model import User
import os

SPOTIFY_CLIENT_ID = os.environ.get('SPOTIFY_CLIENT_ID')
SPOTIFY_CLIENT_SECRET = os.environ.get('SPOTIFY_CLIENT_SECRET')
SPOTIFY_REDIRECT_URI = os.environ.get('SPOTIFY_REDIRECT_URI')

@shared_task
def refresh_user_token(user_id):
    user = User.query.get(user_id)
    if not user or not user.refresh_token:
        return {'error': 'user not found / no refresh token available'}
    
    token_url = 'https://accounts.spotify.com/api/token'
    req_body = {
        'grant_type': 'refresh_token',
        'refresh_token': user.refresh_token,
        'redirect_uri': SPOTIFY_REDIRECT_URI,
        'client_id': SPOTIFY_CLIENT_ID,
        'client_secret': SPOTIFY_CLIENT_SECRET
    }
    response = requests.post(token_url, data=req_body)
    if response.status_code != 200:
        return {'error': 'refresh token failed', 'details': response.json()}
    
    new_token_info = response.json()
    user.oauth_token = new_token_info.get('access_token')
    user.expires_at = datetime.now(timezone.utc) + timedelta(seconds=new_token_info.get('expires_in', 3600))
    db.session.commit()
    return {'message': 'token refresh success'}
