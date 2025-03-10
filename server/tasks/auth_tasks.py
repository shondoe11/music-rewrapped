import logging
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
    logging.info(f"Starting token refresh for user_id: {user_id}")
    user = User.query.get(user_id)
    if not user or not user.refresh_token:
        logging.error("User not found or missing refresh token.")
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
    try:
        response_data = response.json()
    except Exception as e:
        logging.error("Failed to parse Spotify response as JSON: %s", e)
        return {'error': 'failed to parse response', 'details': str(e)}

    logging.info(f"Spotify response: {response_data}")

    if response.status_code != 200:
        logging.error("Spotify refresh token request failed: %s", response_data)
        return {'error': 'refresh token failed', 'details': response_data}

    new_access_token = response_data.get('access_token')
    expires_in = response_data.get('expires_in', 3600)
    new_expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)

    logging.info(f"New access token: {new_access_token}")
    logging.info(f"New expires_at: {new_expires_at}")

    user.oauth_token = new_access_token
    user.expires_at = new_expires_at

    try:
        db.session.commit()
        logging.info("Database commit successful.")
    except Exception as e:
        logging.error("Database commit failed: %s", e)
        db.session.rollback()
        return {'error': 'database commit failed', 'details': str(e)}

    updated_user = User.query.get(user_id)
    logging.info(f"Updated user record: oauth_token: {updated_user.oauth_token}, expires_at: {updated_user.expires_at}")

    return {'message': 'token refresh success'}