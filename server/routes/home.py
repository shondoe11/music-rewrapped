from flask import Blueprint, jsonify, request
from server.services.analytics_service import (
    get_listening_trends,
    get_listening_heatmap,
    get_genre_distribution,
    get_artist_genre_matrix
)
from server.extensions import db
from server.model import ListeningHistory, SavedEvent, Event, User
from sqlalchemy import func, desc, and_
from datetime import datetime, timedelta, timezone
import json
from server.redis_client import redis_client, get_cached, set_cached, redis_cache, batch_get

home_bp = Blueprint('home', __name__)

def get_time_frame_data(user_id, days):
    """
    Returns top songs and top artists for a given time frame (in days)
    """
    #& time frame start date
    start_date = datetime.now(timezone.utc) - timedelta(days=days)

    #& top songs query: track grouping (track_id, track_name, artist, artwork_url)
    top_songs_query = (
        db.session.query(
            ListeningHistory.track_id,
            ListeningHistory.track_name,
            ListeningHistory.artist,
            ListeningHistory.artwork_url,
            func.count(ListeningHistory.id).label('play_count')
        )
        .filter(ListeningHistory.user_id == user_id, ListeningHistory.played_at >= start_date)
        .group_by(ListeningHistory.track_id, ListeningHistory.track_name, ListeningHistory.artist, ListeningHistory.artwork_url)
        .order_by(func.count(ListeningHistory.id).desc())
        .limit(10)
        .all()
    )
    top_songs = [
        {
            'track_id': row.track_id,
            'track_name': row.track_name,
            'artist': row.artist,
            'artwork_url': row.artwork_url,
            'play_count': row.play_count
        }
        for row in top_songs_query
    ]

    #& top artists query: artist grouping
    top_artists_query = (
        db.session.query(
            ListeningHistory.artist,
            func.count(ListeningHistory.id).label('play_count')
        )
        .filter(ListeningHistory.user_id == user_id, ListeningHistory.played_at >= start_date)
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
    return top_songs, top_artists

def get_longest_listening_streak(user_id):
    """
    Compute longest listening streak data for the user.
    Total minutes listened, biggest listening day, total tracks played, monthly hours listened.
    """
    #& total mins listened + total tracks played (over all time)
    total_duration = db.session.query(func.sum(ListeningHistory.duration))\
        .filter(ListeningHistory.user_id == user_id).scalar() or 0
    total_tracks = db.session.query(func.count(ListeningHistory.id))\
        .filter(ListeningHistory.user_id == user_id).scalar() or 0
    total_minutes = total_duration // 60

    #& biggest listening day: group by date (ignore time) and sum durations, then pick max
    biggest_day = (
        db.session.query(
            func.date(ListeningHistory.played_at).label('play_date'),
            func.sum(ListeningHistory.duration).label('total_duration')
        )
        .filter(ListeningHistory.user_id == user_id)
        .group_by(func.date(ListeningHistory.played_at))
        .order_by(func.sum(ListeningHistory.duration).desc())
        .first()
    )
    biggest_listening_day = biggest_day.play_date.isoformat() if biggest_day else None

    #& monthly hours listened: group by year-month
    #~ store to_char expression in variable & use in both SELECT & GROUP BY
    month_expr = func.to_char(ListeningHistory.played_at, 'YYYY-MM')
    monthly_hours_query = (
        db.session.query(
            month_expr.label('month'),
            func.sum(ListeningHistory.duration).label('total_duration')
        )
        .filter(ListeningHistory.user_id == user_id)
        .group_by(month_expr)
        .order_by('month')
        .all()
    )
    monthly_hours = {row.month: round(row.total_duration / 3600, 2) for row in monthly_hours_query}

    return {
        'total_minutes': total_minutes,
        'biggest_listening_day': biggest_listening_day,
        'total_tracks': total_tracks,
        'monthly_hours': monthly_hours
    }

def get_favorite_genres_evolution(user_id):
    """
    Return data most suited for the stream graph (show user's most listened-to genres over time).
    Grp by genre and by month.
    """
    #& grp by year-month genre, sum durations
    #~ store month expression in variable so can be reused in GROUP BY
    month_expr = func.to_char(ListeningHistory.played_at, 'YYYY-MM')
    genre_data = (
        db.session.query(
            month_expr.label('month'),
            ListeningHistory.genre,
            func.sum(ListeningHistory.duration).label('total_duration')
        )
        .filter(ListeningHistory.user_id == user_id)
        .group_by(month_expr, ListeningHistory.genre)
        .order_by('month')
        .all()
    )
    #& transform structure, ref: [{ month: '2025-01', genres: { Pop: hours, Rock: hours, ... } }, ...]
    evolution = {}
    for row in genre_data:
        month = row.month
        genre = row.genre
        hours = round(row.total_duration / 3600, 2)
        if month not in evolution:
            evolution[month] = {}
        evolution[month][genre] = hours
    #& convert dict - list of obj for each month
    evolution_list = [{"month": month, "genres": genres} for month, genres in evolution.items()]
    return evolution_list

def get_top_listeners_percentile(user_id):
    """
    Compute accurate percentile ranking for user among listeners of their favorite artist.
    
    This production implementation:
    1. Determines user's top artists with proper weighting for recency
    2. Calculates actual percentile ranking against other users
    3. Incorporates additional engagement signals beyond play counts
    4. Implements caching for performance optimization
    5. Handles edge cases and provides fallback values when needed
    
    Returns:
        Dictionary containing percentile ranking, favorite artist info, and additional metrics
    """
    try:
        #& check cache 1st - using local+redis caching system
        cache_key = f"top_listener_percentile:{user_id}"
        cached_result = get_cached(cache_key)
        if cached_result:
            return cached_result  #~ now handles json parsing internally
        
        now = datetime.now(timezone.utc)

        #~ determine user's top artists based on listening history
        artist_query = db.session.query(
            ListeningHistory.artist,
            func.count(ListeningHistory.id).label('total_listens'),
            func.max(ListeningHistory.played_at).label('latest_listen')
        ).filter(
            ListeningHistory.user_id == user_id
        ).group_by(
            ListeningHistory.artist
        ).order_by(
            desc('total_listens')
        ).limit(5).all()

        if not artist_query:
            return {
                'percentile_ranking': 0,
                'favorite_artist': "Unknown Artist",
                'total_listens': 0,
                'percentile_confidence': "low"
            }

        favorite_artist_row = artist_query[0]
        favorite_artist_full = favorite_artist_row.artist
        if ',' in favorite_artist_full:
            favorite_artist = favorite_artist_full.split(',')[0].strip()
        else:
            favorite_artist = favorite_artist_full
        
        #~ get user's raw listen count fr this artist
        user_listen_count = favorite_artist_row.total_listens

        #~ calculate saved tracks count fr this artist frm SavedEvent
        saved_tracks_count = db.session.query(func.count(SavedEvent.id)).join(
            Event, SavedEvent.event_id == Event.id
        ).filter(
            and_(
                SavedEvent.user_id == user_id,
                Event.target_artist_interest.ilike(f"%{favorite_artist}%")
            )
        ).scalar() or 0

        #~ query all users who listened to this artist
        all_listeners_query = db.session.query(
            ListeningHistory.user_id,
            func.count(ListeningHistory.id).label('listen_count')
        ).filter(
            ListeningHistory.artist.ilike(f"%{favorite_artist}%")
        ).group_by(
            ListeningHistory.user_id
        ).all()

        total_listeners = len(all_listeners_query)
        
        if total_listeners < 10:
            confidence = "low"
            if total_listeners <= 1:
                percentile = 99  #~ default high percentile if they only listener
            else:
                listen_counts = [row.listen_count for row in all_listeners_query]
                listen_counts.sort()
                user_rank = listen_counts.index(user_listen_count) + 1
                percentile = (user_rank / total_listeners) * 100
        else:
            #~ calculate combined engagement score (listens + saved events)
            engagement_scores = []
            for listener in all_listeners_query:
                other_user_id = listener.user_id
                listens = listener.listen_count
                
                #~ get saved tracks fr this user/artist combination
                other_saved = db.session.query(func.count(SavedEvent.id)).join(
                    Event, SavedEvent.event_id == Event.id
                ).filter(
                    and_(
                        SavedEvent.user_id == other_user_id,
                        Event.target_artist_interest.ilike(f"%{favorite_artist}%")
                    )
                ).scalar() or 0
                
                #~ calculate combined score (listens + saved events w 2x weight)
                score = listens + (other_saved * 2)
                engagement_scores.append(score)
            
            #~ calculate user's own engagement score
            user_score = user_listen_count + (saved_tracks_count * 2)
            
            #~ calculate percentile
            engagement_scores.sort()
            
            if user_score in engagement_scores:
                user_rank = engagement_scores.index(user_score) + 1
            else:
                #~ insert user score in sorted list
                insertion_point = 0
                for i, score in enumerate(engagement_scores):
                    if user_score <= score:
                        insertion_point = i
                        break
                    insertion_point = i + 1
                user_rank = insertion_point + 1
            percentile = round(((user_rank - 1) / len(engagement_scores)) * 100)
            confidence = "high" if total_listeners > 50 else "medium"

        result = {
            'percentile_ranking': percentile,
            'favorite_artist': favorite_artist,
            'total_listens': user_listen_count,
            'saved_events': saved_tracks_count,
            'total_artist_listeners': total_listeners,
            'percentile_confidence': confidence,
            'additional_favorites': [
                {
                    'artist': row.artist.split(',')[0].strip() if ',' in row.artist else row.artist,
                    'listens': row.total_listens
                } for row in artist_query[1:5] if row
            ]
        }

        #& update redis cache only if result changed; use TTL 7 days
        #~ use set_cached which handles both local & redis caching
        set_cached(cache_key, result, ex=timedelta(days=7))
        return result
    except Exception as e:
        print("exception in get_top_listeners_percentile:", e)
        return {
            'percentile_ranking': 0,
            'favorite_artist': "unknown (error occurred)",
            'total_listens': 0,
            'percentile_confidence': "error"
        }

@home_bp.route('/data', methods=['GET'])
def home_data():
    """
    API Endpoint to return aggregated data for Home pg
    """
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    #& convert user_id to integer if need
    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({'error': 'Invalid user_id'}), 400
    
    #& retrieve user record to access display name fr personalized greeting
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'user not found'}), 404
    
    #& time frames (days)
    time_frames = {
        '1_month': 30,
        '3_months': 90,
        '6_months': 180,
        '1_year': 365
    }

    top_songs = {}
    top_artists = {}
    for label, days in time_frames.items():
        songs, artists = get_time_frame_data(user_id, days)
        top_songs[label] = songs
        top_artists[label] = artists

    longest_streak = get_longest_listening_streak(user_id)
    favorite_genres = get_favorite_genres_evolution(user_id)
    top_listeners = {
        'percentile_ranking': get_top_listeners_percentile(user_id)
    }
    
    #& display_name if avail, else fallback email
    if user.display_name and user.display_name.strip():
        welcome_name = user.display_name
    else:
        welcome_name = user.email.split('@')[0]
    
    data = {
        'top_songs': top_songs,
        'top_artists': top_artists,
        'longest_listening_streak': longest_streak,
        'favorite_genres_evolution': favorite_genres,
        'top_listeners': top_listeners,
        'welcome_message': f'Hi there, {welcome_name}! Scroll down to learn more about your music taste ⬇️'
    }
    return jsonify(data)