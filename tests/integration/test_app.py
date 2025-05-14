#!/usr/bin/env python
import pytest
import json
from server.app import app
from server.redis_client import redis_client
from flask.sessions import SecureCookieSessionInterface

#& update test config fr testing environment
app.config['TESTING'] = True            #~ enable testing mode
app.config['SESSION_TYPE'] = 'null'       #~ disable flask session storage to bypass redis-based sessions during tests
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  #~ in-memory sqlite fr testing
#& monkey patch redis_client.ping bypass real redis connectivity in tests
redis_client.ping = lambda: True
#& force use of secure cookie session interface to avoid flask-session issues in tests
app.session_interface = SecureCookieSessionInterface()

#& define dummy request class fr session cookie creation
class DummyRequest:
    cookies = {}

#& helper function set session cookie in test client manually
def set_session_cookie(client, session_data):
    from flask.sessions import SecureCookieSessionInterface
    session_interface = SecureCookieSessionInterface()
    dummy_req = DummyRequest()
    s = session_interface.open_session(app, dummy_req) or {}
    s.update(session_data)
    cookie_value = session_interface.get_signing_serializer(app).dumps(dict(s))
    #~ use app.config 'SESSION_COOKIE_NAME' (default 'session') to avoid deprecated attribute usage
    cookie_name = app.config.get('SESSION_COOKIE_NAME', 'session')
    client.set_cookie('localhost', cookie_name, cookie_value)

#& fixture set up flask test client fr integration tests
@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

#& test fr health-check endpoint
def test_health_endpoint(client):
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    #~ verify health-check endpoint returns 'ok' status
    assert data.get('status') == 'ok'

#& test fr index endpoint; shld return greeting msg
def test_index_endpoint(client):
    response = client.get('/')
    assert response.status_code == 200
    text = response.get_data(as_text=True)
    #~ check index endpoint returns expected greeting msg
    assert 'Hello, Music Re-Wrapped! experience it at https://musicrewrapped.onrender.com' in text

#& test fr auth blueprint; expect either redirect / 404 if not implemented yet
def test_auth_blueprint(client):
    response = client.get('/auth/')
    #~ since no default auth route defined; 301, 302, or 404 is acceptable
    assert response.status_code in (301, 302, 404)

#& test fr sync blueprint; expects redirect / 404
def test_sync_blueprint(client):
    response = client.get('/sync/')
    #~ since no default sync route defined; 301, 302, or 404 is acceptable
    assert response.status_code in (301, 302, 404)

#& test /all events
def test_events_all(client):
    response = client.get('/events/all')
    #~ verify /events/all returns status code 200
    assert response.status_code == 200
    data = response.get_json()
    #~ verify that response contains expected keys from the /all endpoint
    assert 'recommended_events' in data
    assert 'external_events' in data

#& test fr event creation endpoint; expect status code 201 & echo of event data
def test_create_event(client):
    payload = {
        "name": "Test Event",
        "location": "Test Location",
        "date": "2025-04-03T12:00:00"
    }
    response = client.post('/events/', data=json.dumps(payload), content_type='application/json')
    assert response.status_code == 201
    data = response.get_json()
    #~ verify res has msg 'Event created' & event data match payload
    assert data.get('message') == 'Event created'
    assert data.get('event', {}).get('name') == "Test Event"
    assert data.get('event', {}).get('location') == "Test Location"

#& test fr sync listening history endpoint w missing user_id
def test_sync_listening_history_missing_user(client):
    response = client.post('/sync/listening-history', data=json.dumps({}), content_type='application/json')
    assert response.status_code == 400
    data = response.get_json()
    #~ verify error message fr missing user_id
    assert 'error' in data

#& test fr sync listening history endpoint w non-existent user_id
def test_sync_listening_history_invalid_user(client):
    payload = {"user_id": 9999}  #~ assume this user nt exist in test db
    response = client.post('/sync/listening-history', data=json.dumps(payload), content_type='application/json')
    assert response.status_code == 404
    data = response.get_json()
    #~ verify err msg fr user nt found
    assert 'error' in data

#& test fr auth logout endpoint; shld clear session & return success msg
def test_auth_logout(client):
    response = client.post('/auth/logout')
    assert response.status_code == 200
    data = response.get_json()
    #~ verify logout success msg
    assert data.get('message') == 'Logged out successfully'

#& test fr preferences GET endpoint w missing user_id
def test_get_preferences_missing_user(client):
    response = client.get('/auth/user/preferences')
    #~ when user_id missing, expect err (400)
    assert response.status_code == 400

#& test fr preferences POST endpoint w sample data
def test_set_preferences(client):
    payload = {
        "user_id": 1,
        "favoriteArtists": ["Artist A", "Artist B"],
        "favoriteGenres": ["Genre X"],
        "favoriteVenues": ["Venue 1"]
    }
    response = client.post('/auth/user/preferences', data=json.dumps(payload), content_type='application/json')
    #~ since user may nt exist, response can be 200 if preferences successfully saved / 404 if user nt found
    assert response.status_code in (200, 404)

#& test fr spotify recently played endpoint w missing user_id
def test_spotify_recently_played_missing_user(client):
    response = client.get('/spotify/recently-played')
    assert response.status_code == 400
    data = response.get_json()
    #~ verify err fr missing user_id
    assert 'error' in data

#& test fr spotify top tracks endpoint w missing user_id
def test_spotify_top_tracks_missing_user(client):
    response = client.get('/spotify/top-tracks')
    assert response.status_code == 400
    data = response.get_json()
    #~ verify err fr missing user_id
    assert 'error' in data

#& test fr retrieving current user endpoint when nt authenticated
def test_get_current_user_unauthenticated(client):
    response = client.get('/auth/user')
    assert response.status_code == 401
    data = response.get_json()
    #~ verify err msg fr noAuth
    assert 'error' in data

#& test fr retrieving current user endpoint when authenticated using manual cookie injection
def test_get_current_user_authenticated(client):
    #~ manually set session cookie w authenticated user data
    set_session_cookie(client, {
        "user": {
            "id": 1,
            "spotify_id": "dummy_spotify",
            "email": "user@example.com",
            "display_name": "Test User",
            "role": "guest",
            "username": "testuser",
            "profile_image_url": "",
            "country": "US",
            "followers": 0
        }
    })
    response = client.get('/auth/user')
    assert response.status_code == 200
    data = response.get_json()
    #~ verify returned user match session data
    assert 'user' in data
    assert data['user'].get('username') == "testuser"