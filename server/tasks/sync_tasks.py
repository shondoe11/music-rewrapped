from celery import shared_task
import requests
from datetime import datetime, timezone, timedelta
from sqlalchemy import func
from server.extensions import db
from server.model import User, ListeningHistory, AggregatedStats
from server.redis_client import redis_client
from server.tasks.auth_tasks import refresh_user_token

@shared_task
def fetch_listening_history(user_id):
    """
    Celery task: fetch + save user recently played tracks,
    caching artist genre info in Redis.
    """
    user = User.query.get(user_id)
    if not user:
        return {'error': 'user not found'}
    
    #& check if the access token has expired
    if user.expires_at:
        #~ make sure user.expires_at is timezone-aware if not assume UTC
        if user.expires_at.tzinfo is None:
            user_expires_at = user.expires_at.replace(tzinfo=timezone.utc)
        else:
            user_expires_at = user.expires_at

        current_time = datetime.now(timezone.utc)
        if current_time > user_expires_at:
            #~ refresh token via helper task
            refresh_result = refresh_user_token(user_id)
            if 'error' in refresh_result:
                return {'error': 'token refresh failed', 'details': refresh_result}
            #~ reload user from db to update token info
            db.session.refresh(user)
    
    access_token = user.oauth_token
    headers = {'Authorization': f'Bearer {access_token}'}
    
    spotify_url = 'https://api.spotify.com/v1/me/player/recently-played'
    response = requests.get(spotify_url, headers=headers)
    if response.status_code != 200:
        return {'error': 'failed to fetch listening history', 'details': response.json()}
    
    history_data = response.json().get('items', [])
    
    for item in history_data:
        track = item.get('track', {})
        played_at_str = item.get('played_at')
        try:
            #& convert played_at to timezone datetime
            played_at = datetime.fromisoformat(played_at_str.replace('Z', '+00:00'))
        except Exception:
            played_at = datetime.now(timezone.utc)
            
        #& fetch genre info for primary artist using Redis cache
        genres = None
        if track.get('artists'):
            primary_artist = track['artists'][0]
            artist_id = primary_artist.get('id')
            #~ try to get genre info from redis 1st if available
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
    return {'message': 'listening history synced successfully'}

@shared_task
def aggregate_listening_history_task(user_id):
    """
    Celery task: aggregate user listening history and update AggregatedStats.
    """
    user = User.query.get(user_id)
    if not user:
        return {'error': 'user not found'}
    
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
    
    agg_stats = AggregatedStats.query.filter_by(user_id=user.id).first()
    if not agg_stats:
        agg_stats = AggregatedStats(user_id=user.id)
        db.session.add(agg_stats)
    
    agg_stats.top_tracks = top_tracks
    agg_stats.top_artists = top_artists
    #todo: further aggregation, e.g. genre_distribution, can be added here
    agg_stats.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    
    return {'message': 'aggregated stats updated successfully', 'aggregated_stats': {
        'top_tracks': top_tracks,
        'top_artists': top_artists
    }}
    

@shared_task
def sync_all_users():
    """
    celery task: loop thru active users and trigger bg tasks fr sync listen history and aggregating stats
    """
    #& fr now, loop all users, later maybe filter via 'active' flag if user base grow
    users = User.query.all()
    for user in users:
        fetch_listening_history.delay(user.id) 
        aggregate_listening_history_task.delay(user.id)
    
    db.session.commit()
    
    return {'message': 'all users syncing tasks triggered'}

@shared_task
def fetch_recent_played_all_users():
    """
    Focused task that only fetches recently played tracks for all users
    who have opted into tracking. Runs more frequently than the full sync.
    """
    #~ get only users who have opted to storing listening history
    users = User.query.filter_by(store_listening_history=True).all()
    
    for user in users:
        fetch_listening_history.delay(user.id)
    
    return {'message': f'Recently played fetch triggered for {len(users)} users'}