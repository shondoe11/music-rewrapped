from celery import shared_task
import requests
from datetime import datetime, timezone, timedelta
import logging
from sqlalchemy import func
from server.extensions import db
from server.model import ListeningHistory, AggregatedStats, Event, User
from server.redis_client import redis_client, batch_get, set_cached
from server.tasks.auth_tasks import refresh_user_token

@shared_task
def fetch_listening_history(user_id):
    db.engine.dispose()  #~ dispose stale connections
    user = User.query.get(user_id)
    if not user:
        return {'error': 'user not found'}

    #& check access token expiry
    if user.expires_at:
        #~ make sure user.expires_at is timezone-aware if not assume utc
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
            db.session.refresh(user)

    access_token = user.oauth_token
    headers = {'Authorization': f'Bearer {access_token}'}

    spotify_url = 'https://api.spotify.com/v1/me/player/recently-played'
    response = requests.get(spotify_url, headers=headers)
    if response.status_code != 200:
        return {'error': 'failed to fetch listening history', 'details': response.json()}

    history_data = response.json().get('items', [])

    #& begin batch caching of artist genres
    distinct_artist_ids = set()
    for item in history_data:
        track = item.get('track', {})
        if track.get('artists'):
            primary_artist = track['artists'][0]
            artist_id = primary_artist.get('id')
            if artist_id:
                distinct_artist_ids.add(artist_id)
    #~ build keys + perform single mget req using batch_get utility
    cached_keys = [f'artist_genre:{artist_id}' for artist_id in distinct_artist_ids]
    cached_values = batch_get(cached_keys)  #~ use local cache where possible bef Redis
    artist_genre_cache = {}
    for i, key in enumerate(cached_keys):
        #~ store cached value fr this artist id
        artist_id = key.split(':')[1]
        artist_genre_cache[artist_id] = cached_values[i]
    #~ init pipeline to batch writes fr missing keys
    pipeline = redis_client.pipeline()
    #~ end batch caching

    for item in history_data:
        track = item.get('track', {})
        try:
            played_at = datetime.fromisoformat(item.get('played_at').replace('Z', '+00:00'))
        except Exception:
            played_at = datetime.now(timezone.utc)
        
        track_id = track.get('id')
        
        #& check if exact played_at timestamp alrdy exists fr this track
        existing_entry = ListeningHistory.query.filter_by(
            user_id=user.id,
            track_id=track_id,
            played_at=played_at
        ).first()
        
        #~ skip this entry if alrdy exists w same played_at time
        if existing_entry:
            continue

        genres = None
        if track.get('artists'):
            primary_artist = track['artists'][0]
            artist_id = primary_artist.get('id')
            if artist_id:
                genres = artist_genre_cache.get(artist_id)
                if genres is None:
                    artist_url = f'https://api.spotify.com/v1/artists/{artist_id}'
                    artist_response = requests.get(artist_url, headers=headers)
                    if artist_response.status_code == 200:
                        artist_data = artist_response.json()
                        genres_list = artist_data.get('genres', [])
                        try:
                            genres = ', '.join(genres_list)
                        except Exception:
                            genres = ''
                        #~ update local cache + queue setex call via pipeline
                        artist_genre_cache[artist_id] = genres
                        #~ using set_cached to update both local & redis caches
                        set_cached(f'artist_genre:{artist_id}', genres, ex=timedelta(days=1))
        
        new_history = ListeningHistory(
            user_id=user.id,
            track_id=track_id,
            track_name=track.get('name'),
            artist=', '.join([artist.get('name') for artist in track.get('artists', [])]),
            artwork_url=track.get('album', {}).get('images', [{}])[0].get('url'),
            duration=(track.get('duration_ms') or 0) // 1000,
            genre=genres,
            played_at=played_at
        )
        db.session.add(new_history)
    pipeline.execute()
    db.session.commit()
    return {'message': 'listening history synced successfully'}

@shared_task
def aggregate_listening_history_task(user_id):
    db.engine.dispose()  #~ dispose stale connections
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

    #~ aggregate top artists query
    top_artists_query = (
        db.session.query(
            ListeningHistory.artist,
            func.count(ListeningHistory.id).label('play_count')
        )
        .filter(ListeningHistory.user_id == user_id)
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
    agg_stats = AggregatedStats.query.filter_by(user_id=user_id).first()
    if not agg_stats:
        agg_stats = AggregatedStats(user_id=user_id)
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
    db.engine.dispose()
    from server.model import User
    users = User.query.all()
    for user in users:
        fetch_listening_history.delay(user.id)
        aggregate_listening_history_task.delay(user.id)
    db.session.commit()
    return {'message': 'all users syncing tasks triggered'}

@shared_task
def fetch_recent_played_all_users():
    db.engine.dispose()
    from server.model import User
    users = User.query.filter_by(store_listening_history=True).all()
    for user in users:
        fetch_listening_history.delay(user.id)
    return {'message': f'recently played fetch triggered for {len(users)} users'}

@shared_task
def update_event_statuses():
    db.engine.dispose()
    now = datetime.now()
    updated_count = 0
    events = Event.query.all()
    for event in events:
        if not event.event_date:
            continue
        if event.event_date > now:
            new_status = 'Pre-Event'
        else:
            days_since_event = (now - event.event_date).days
            if days_since_event <= 1:
                new_status = 'Active'
            elif days_since_event <= 7:
                new_status = 'Recent'
            else:
                new_status = 'Past'
        if event.status != new_status:
            event.status = new_status
            updated_count += 1
    db.session.commit()
    return f"updated {updated_count} event statuses at {now}"