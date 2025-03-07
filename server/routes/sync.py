from flask import Blueprint, jsonify, request
from server.extensions import db
from server.model import User, ListeningHistory, AggregatedStats
import requests
from datetime import datetime, timezone, timedelta
from sqlalchemy import func
from server.redis_client import redis_client

sync_bp = Blueprint('sync', __name__)

@sync_bp.route('/listening-history', methods=['POST'])
def sync_listening_history():
    """
    Fetch user recently played tracks from Spotify via their stored access tokens and save data into ListeningHistory table.
    
    Expect payload:
    {
        'user_id': <user_id>
    }
    """
    data = request.get_json()
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required.'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    access_token = user.oauth_token
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    spotify_url = 'https://api.spotify.com/v1/me/player/recently-played'
    response = requests.get(spotify_url, headers=headers)
    if response.status_code != 200:
        return jsonify({
            'error': 'failed to fetch listening history',
            'details': response.json()
        }), response.status_code
        
    history_data = response.json().get('items', [])
    
    for item in history_data:
        track = item.get('track', {})
        played_at_str = item.get('played_at')
        try:
            #& convert played_at to timezone datetime
            played_at = datetime.fromisoformat(played_at_str.replace('Z', '+00:00'))
        except Exception:
            played_at = datetime.now(timezone.utc)
            
        #& fetch genre info for primary artist using redis cache
        genres = None
        if track.get('artists'):
            primary_artist = track['artists'][0]
            artist_id = primary_artist.get('id')
            #~ try to get genre info from redis 1st if avail
            genres = redis_client.get(f'artist_genre:{artist_id}')
            if genres is None:
                #~ cache doesn't have -> fetch from Spotify get artist endpoint
                artist_url = f'https://api.spotify.com/v1/artists/{artist_id}'
                artist_response = requests.get(artist_url, headers=headers)
                if artist_response.status_code == 200:
                    artist_data = artist_response.json()
                    genres_list = artist_data.get('genres', [])
                    if genres_list:
                        genres = ', '.join(genres_list)
                    else:
                        genres = ''
                    #~ cache genre info in redis, expire in 1 day
                    redis_client.setex(f'artist_genre:{artist_id}', timedelta(days=1), genres)
                    
        new_history = ListeningHistory(
            user_id=user.id,
            track_id=track.get('id'),
            track_name=track.get('name'),
            artist=', '.join([artist.get('name') for artist in track.get('artists', [])]),
            artwork_url=track.get('album', {}).get('images', [{}])[0].get('url'),
            duration=(track.get('duration_ms') or 0) // 1000,
            genre=genres,
            played_at=played_at
        )
        db.session.add(new_history)
    
    db.session.commit()
    return jsonify({'message': 'listening history synced successfully'}), 200

@sync_bp.route('/aggregate', methods=['POST'])
def aggregate_listening_history():
    """
    Aggregate listening history for user and updates AggregatedStats table
    
    Expect JSON payload:
    {
        'user_id': <user_id>
    }
    """
    data = request.get_json()
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'user not found'}), 404
    
    #~ aggregate top 10 tracks over all time
    top_tracks_query = (
        db.session.query(
            ListeningHistory.track_id,
            ListeningHistory.track_name,
            ListeningHistory.artist,
            ListeningHistory.artwork_url,
            func.count(ListeningHistory.id).label('play_count')
        )
        .filter(ListeningHistory.user_id == user_id)
        .group_by(ListeningHistory.track_id, ListeningHistory.track_name, ListeningHistory.artist, ListeningHistory.artwork_url)
        .order_by(func.count(ListeningHistory.id).desc())
        .limit(10)
        .all()
    )
    top_tracks = [
        {
            'track_id': row.track_id,
            'track_name': row.track_name,
            'artist': row.artist,
            'artwork_url': row.artwork_url,
            'play_count': row.play_count
        }
        for row in top_tracks_query
    ]
    
    #~ aggregate top artists
    top_artists_query = (
        db.session.query(
            ListeningHistory.artist,
            func.count(ListeningHistory.id).label('play_count')
        )
        .filter(ListeningHistory.user_id == user.id)
        .group_by(ListeningHistory.artist)
        .order_by(func.count(ListeningHistory.id).desc())
        .limit(10)
        .all()
    )
    top_artists = [
        {
            'artist': row.artist,
            'play_count': row.play_count
        }
        for row in top_artists_query
    ]
    
    #~ update/create AggregatedStats record for this user
    agg_stats = AggregatedStats.query.filter_by(user_id=user.id).first()
    if not agg_stats:
        agg_stats = AggregatedStats(user_id=user.id)
        db.session.add(agg_stats)
        
    agg_stats.top_tracks = top_tracks
    agg_stats.top_artists = top_artists
    #todo: further aggregation, e.g. genre_distribution, can be added here
    agg_stats.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    
    return jsonify({'message': 'aggregated stats updated successfully', 'aggregated_stats': {
        'top_tracks': top_tracks,
        'top_artists': top_artists
    }})
