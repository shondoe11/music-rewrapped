from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta, timezone
from server.extensions import db
from server.model import ListeningHistory
from sqlalchemy import func

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
    
    #& top artists query: artist group (add fallback for artist artwork not available OR return just name and play_count)
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
    # Store the to_char expression in a variable and use it in both SELECT and GROUP BY
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
    # Store the month expression in a variable so it can be reused in GROUP BY
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
    To compute percentile ranking for user among listeners of favorite artist.
    Intend to compare the user's metrics against all users.
    """
    #& dummy percentile first
    return 87 #todo replace with real logic later

@home_bp.route('/data', methods=['GET'])
def home_data():
    """
    API Endpoint to return real aggregated data for Home pg
    """
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    #& convert user_id to integer if need
    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({'error': 'Invalid user_id'}), 400
    
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
    
    data = {
        'top_songs': top_songs,
        'top_artists': top_artists,
        'longest_listening_streak': favorite_genres,
        'top_listeners': top_listeners,
        'welcome_message': 'Hi there! Scroll down to learn more about your music taste ⬇️'
    }
    return jsonify(data)