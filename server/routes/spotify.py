from flask import Blueprint, jsonify, request
import requests
from server.model import User

spotify_bp = Blueprint('spotify', __name__)

@spotify_bp.route('/')
def index():
    return jsonify({'message': 'Welcome to the Spotify API endpoints.'})

@spotify_bp.route('/recently-played', methods=['GET'])
def recently_played():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'user not found'}), 404

    try:
        limit = min(int(request.args.get('limit', 50)), 50)
    except ValueError:
        limit = 50

    headers = {'Authorization': f'Bearer {user.oauth_token}'}
    params = {
        'limit': limit
    }
    
    spotify_url = 'https://api.spotify.com/v1/me/player/recently-played'
    response = requests.get(spotify_url, headers=headers, params=params)
    
    if response.status_code != 200:
        return jsonify({
            'error': 'failed to fetch recently played tracks from spotify',
            'details': response.json()
        }), response.status_code

    data = response.json()
    tracks = []
    
    for item in data.get('items', []):
        track = item.get('track', {})
        played_at = item.get('played_at')
        
        artists_data = []
        for artist in track.get('artists', []):
            artist_info = {
                'name': artist.get('name'),
                'spotify_url': artist.get('external_urls', {}).get('spotify')
            }
            artists_data.append(artist_info)
            
        track_info = {
            'track_name': track.get('name'),
            'artists': artists_data,
            'artwork_url': track.get('album', {}).get('images', [{}])[0].get('url'),
            'spotify_url': track.get('external_urls', {}).get('spotify'),
            'played_at': played_at
        }
        tracks.append(track_info)

    return jsonify({'tracks': tracks})

@spotify_bp.route('/top-tracks', methods=['GET'])
def get_top_tracks():
    #& fetch user top tracks directly from spotify
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'user not found'}), 404

    time_frame = request.args.get('time_frame', 'short_term')
    mapping = {
        'short_term': 'short_term',
        'medium_term': 'medium_term',
        'long_term': 'long_term'
    }
    time_range = mapping.get(time_frame, 'short_term')

    try:
        limit = int(request.args.get('limit', 10))
    except ValueError:
        limit = 10

    headers = {'Authorization': f'Bearer {user.oauth_token}'}
    params = {
        'limit': limit,
        'time_range': time_range
    }
    spotify_url = 'https://api.spotify.com/v1/me/top/tracks'
    response = requests.get(spotify_url, headers=headers, params=params)
    if response.status_code != 200:
        return jsonify({
            'error': 'failed to fetch top tracks from spotify',
            'details': response.json()
        }), response.status_code

    data = response.json()
    tracks = []
    for item in data.get('items', []):
        track_url = item.get('external_urls', {}).get('spotify')
        artists_data = []
        for artist in item.get('artists', []):
            artist_info = {
                'name': artist.get('name'),
                'spotify_url': artist.get('external_urls', {}).get('spotify')
            }
            artists_data.append(artist_info)
        track = {
            'track_name': item.get('name'),
            'artists': artists_data,
            'artwork_url': item.get('album', {}).get('images', [{}])[0].get('url'),
            'spotify_url': track_url
        }
        tracks.append(track)

    return jsonify({'tracks': tracks})

@spotify_bp.route('/top-albums', methods=['GET'])
def get_top_albums():
    #& approximate user top albums by grouping top tracks by album; fetch biggest sample for aggregation
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'user not found'}), 404

    time_frame = request.args.get('time_frame', 'short_term')
    mapping = {
        'short_term': 'short_term',
        'medium_term': 'medium_term',
        'long_term': 'long_term'
    }
    time_range = mapping.get(time_frame, 'short_term')
    
    try:
        client_limit = int(request.args.get('limit', 10))
    except ValueError:
        client_limit = 10

    headers = {'Authorization': f'Bearer {user.oauth_token}'}
    params = {
        'limit': 50,  #~ use higher limit to get most tracks for aggregation
        'time_range': time_range
    }
    spotify_url = 'https://api.spotify.com/v1/me/top/tracks'
    response = requests.get(spotify_url, headers=headers, params=params)
    if response.status_code != 200:
        return jsonify({
            'error': 'failed to fetch top tracks from spotify for album aggregation',
            'details': response.json()
        }), response.status_code

    data = response.json()
    items = data.get('items', [])
    album_dict = {}
    for item in items:
        album = item.get('album', {})
        album_id = album.get('id')
        if not album_id:
            continue
        if album_id not in album_dict:
            album_dict[album_id] = {
                'album_name': album.get('name'),
                'album_image_url': album.get('images', [{}])[0].get('url'),
                'spotify_url': album.get('external_urls', {}).get('spotify'),
                'album_artists': ', '.join(artist.get('name') for artist in album.get('artists', [])),
                'count': 0
            }
        album_dict[album_id]['count'] += 1

    albums = list(album_dict.values())
    albums.sort(key=lambda x: x['count'], reverse=True)
    albums = albums[:client_limit]
    return jsonify({'albums': albums})

@spotify_bp.route('/top-artists', methods=['GET'])
def get_top_artists():
    #& fetch user top artists directly from spotify
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'user not found'}), 404

    time_frame = request.args.get('time_frame', 'short_term')
    mapping = {
        'short_term': 'short_term',
        'medium_term': 'medium_term',
        'long_term': 'long_term'
    }
    time_range = mapping.get(time_frame, 'short_term')

    try:
        limit = int(request.args.get('limit', 10))
    except ValueError:
        limit = 10

    headers = {'Authorization': f'Bearer {user.oauth_token}'}
    params = {
        'limit': limit,
        'time_range': time_range
    }
    spotify_url = 'https://api.spotify.com/v1/me/top/artists'
    response = requests.get(spotify_url, headers=headers, params=params)
    if response.status_code != 200:
        return jsonify({
            'error': 'failed to fetch top artists from spotify',
            'details': response.json()
        }), response.status_code

    data = response.json()
    artists = []
    for item in data.get('items', []):
        artist_url = item.get('external_urls', {}).get('spotify')
        images = item.get('images', [])
        image_url = images[0].get('url') if images else None
        artist = {
            'artist_name': item.get('name'),
            'artist_image_url': image_url,
            'spotify_url': artist_url,
            'genres': item.get('genres', [])
        }
        artists.append(artist)

    return jsonify({'artists': artists})