from flask import Blueprint, jsonify

spotify_bp = Blueprint('spotify', __name__)

@spotify_bp.route('/')
def index():
    return jsonify({'message': 'Welcome to the Spotify API endpoints.'})

@spotify_bp.route('/top-tracks', methods=['GET'])
def get_top_tracks():
    #& placeholder logic first. in final ver, call Spotify API, process data, then return user's top tracks
    sample_top_tracks = {
        'tracks': [
            {'name': 'Song 1', 'artist': 'Artist A'},
            {'name': 'Song 2', 'artist': 'Artist B'}
        ]
    }
    return jsonify(sample_top_tracks)

@spotify_bp.route('recently-played', methods=['GET'])
def recently_played():
    #& placeholder logic first. in final ver, call Spotify API, process data, then return user's recently played tracks
    sample_recent = {
        'recently_played': [
            {'name': 'Song X', 'artist': 'Artist Y', 'played_at': '2025-03-04T10:00:00Z'},
            {'name': 'Song Z', 'artist': 'Artist W', 'played_at': '2025-03-04T09:45:00Z'}
        ]
    }
    return jsonify(sample_recent)