from sqlalchemy import func, extract
from datetime import datetime, timedelta, timezone
from server.extensions import db
from server.model import ListeningHistory, User
import requests
from collections import defaultdict
import itertools
import colorsys

def get_listening_trends(user_id, time_frame='daily', days=30):
    """
    Aggregate listening history data into time series format.
    
    Args:
        user_id: User ID
        time_frame: 'daily', 'weekly', or 'monthly'
        days: Number of days to look back
    
    Returns:
        List of data points for charting
    """
    #~ calculate date range
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)
    
    #~ base query filtering by user & date range
    base_query = db.session.query(
        ListeningHistory.played_at,
        ListeningHistory.duration
    ).filter(
        ListeningHistory.user_id == user_id,
        ListeningHistory.played_at >= start_date,
        ListeningHistory.played_at <= end_date
    )
    
    #~ format according to time frame
    if time_frame == 'daily':
        #~ grp by day
        query = db.session.query(
            func.date(ListeningHistory.played_at).label('day'),
            func.count(ListeningHistory.id).label('track_count'),
            func.sum(ListeningHistory.duration).label('total_seconds')
        ).filter(
            ListeningHistory.user_id == user_id,
            ListeningHistory.played_at >= start_date,
            ListeningHistory.played_at <= end_date
        ).group_by(
            func.date(ListeningHistory.played_at)
        ).order_by('day')
        
        results = query.all()
        data_points = []
        
        #& generate continuous date range & fill missing dates
        current_date = start_date.date()
        end_date_only = end_date.date()
        date_mapping = {row.day: (row.track_count, row.total_seconds) for row in results}
        
        while current_date <= end_date_only:
            date_str = current_date.isoformat()
            if current_date in date_mapping:
                track_count, total_seconds = date_mapping[current_date]
            else:
                track_count, total_seconds = 0, 0
                
            data_points.append({
                'date': date_str,
                'trackCount': track_count,
                'minutes': round(total_seconds / 60, 1)
            })
            current_date += timedelta(days=1)
            
        return data_points
    
    elif time_frame == 'weekly':
        #~ First get all listening history data within the date range
        raw_data = db.session.query(
            ListeningHistory.played_at,
            ListeningHistory.id,
            ListeningHistory.duration
        ).filter(
            ListeningHistory.user_id == user_id,
            ListeningHistory.played_at >= start_date,
            ListeningHistory.played_at <= end_date
        ).all()
        
        #~ Group by week in Python (more portable across databases)
        weekly_data = {}
        for item in raw_data:
            played_at = item.played_at
            #~ Get ISO calendar week (year, week number, weekday)
            year, week, _ = played_at.isocalendar()
            #~ Use the first day of the week as the key
            week_start = played_at - timedelta(days=played_at.weekday())
            week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
            
            key = week_start.isoformat()
            
            if key not in weekly_data:
                weekly_data[key] = {'count': 0, 'seconds': 0}
                
            weekly_data[key]['count'] += 1
            weekly_data[key]['seconds'] += item.duration
        
        #~ Convert to the format expected by the frontend
        data_points = []
        for date_str, data in sorted(weekly_data.items()):
            data_points.append({
                'date': date_str,
                'trackCount': data['count'],
                'minutes': round(data['seconds'] / 60, 1)
            })
        
        return data_points
    
    elif time_frame == 'monthly':
        #~ First get all listening history data within the date range
        raw_data = db.session.query(
            ListeningHistory.played_at,
            ListeningHistory.id,
            ListeningHistory.duration
        ).filter(
            ListeningHistory.user_id == user_id,
            ListeningHistory.played_at >= start_date - timedelta(days=60),  #~ fetch a bit more fr complete months
            ListeningHistory.played_at <= end_date
        ).all()
        
        #~ Group by month in Python (more portable across databases)
        monthly_data = {}
        for item in raw_data:
            played_at = item.played_at
            #~ First day of the month
            month_start = played_at.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            key = month_start.isoformat()
            
            if key not in monthly_data:
                monthly_data[key] = {'count': 0, 'seconds': 0}
                
            monthly_data[key]['count'] += 1
            monthly_data[key]['seconds'] += item.duration
        
        #~ Convert to the format expected by the frontend
        data_points = []
        for date_str, data in sorted(monthly_data.items()):
            data_points.append({
                'date': date_str,
                'trackCount': data['count'],
                'minutes': round(data['seconds'] / 60, 1)
            })
        
        return data_points
    
    return []

def get_listening_heatmap(user_id, days=90):
    """
    Generate data for a heatmap showing listening activity by day of week and hour.
    
    Args:
        user_id: User ID
        days: Number of days to include
    
    Returns:
        A 2D array suitable for a heatmap visualization
    """
    #~ calculate date range
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)
    
    #~ query fr day of week (0=Monday, 6=Sunday) & hour
    query = db.session.query(
        extract('dow', ListeningHistory.played_at).label('day_of_week'),
        extract('hour', ListeningHistory.played_at).label('hour'),
        func.count(ListeningHistory.id).label('count')
    ).filter(
        ListeningHistory.user_id == user_id,
        ListeningHistory.played_at >= start_date,
        ListeningHistory.played_at <= end_date
    ).group_by(
        'day_of_week',
        'hour'
    ).order_by(
        'day_of_week',
        'hour'
    )
    
    results = query.all()
    
    #~ init 2D array w zeros
    heatmap_data = []
    for day in range(7):  #~ 7d
        day_data = []
        for hour in range(24):  #~ 24h
            day_data.append(0)
        heatmap_data.append(day_data)
    
    #~ fill w actual data
    for row in results:
        day = int(row.day_of_week)
        hour = int(row.hour)
        count = row.count
        heatmap_data[day][hour] = count
    
    return {
        'data': heatmap_data,
        'maxValue': max([max(day_data) for day_data in heatmap_data])
    }
    
def get_genre_distribution(user_id, time_range='medium_term'):
    """
    Process listening history to get genre distribution data.
    
    Args:
        user_id: User ID
        time_range: 'short_term', 'medium_term', or 'long_term'
        
    Returns:
        List of genre objects with listening minutes and track counts
    """
    #& fetch user frm database
    user = User.query.get(user_id)
    if not user or not user.oauth_token:
        raise Exception('User not found or not authenticated')
    
    #todo refresh token if need (implement token refresh logic here)
    
    #& call spotify api fr top artists w genres
    headers = {'Authorization': f'Bearer {user.oauth_token}'}
    response = requests.get(
        f'https://api.spotify.com/v1/me/top/artists?limit=50&time_range={time_range}', 
        headers=headers
    )
    
    if response.status_code != 200:
        #~ handle token refresh if need
        raise Exception(f'Failed to fetch data from Spotify: {response.json()}')
    
    artists_data = response.json().get('items', [])
    
    #& process genres frm artists
    genre_stats = defaultdict(lambda: {'minutes': 0, 'trackCount': 0})
    artist_to_genres = {}  #~ mapping artist name to their genres
    
    #& first pass: collect genres fr each artist
    for artist in artists_data:
        artist_name = artist.get('name')
        artist_genres = artist.get('genres', [])
        
        if artist_name and artist_genres:
            artist_to_genres[artist_name] = artist_genres
    
    #& second pass: query listening history fr these artists & distribute stats across genres
    for artist_name, genres in artist_to_genres.items():
        if not genres:
            continue
            
        #& get listening history fr this artist
        artist_history = ListeningHistory.query.filter(
            ListeningHistory.user_id == user_id,
            ListeningHistory.artist.ilike(f'%{artist_name}%')  #~ case-insensitive partial match
        ).all()
        
        if not artist_history:
            continue
            
        minutes_listened = sum(h.duration for h in artist_history) / 60  #~ convert secs to mins
        track_count = len(artist_history)
        
        #& distribute listening time across genres
        per_genre_minutes = minutes_listened / len(genres)
        per_genre_tracks = track_count / len(genres)
        
        for genre in genres:
            genre_stats[genre]['minutes'] += per_genre_minutes
            genre_stats[genre]['trackCount'] += per_genre_tracks
    
    #& convert format needed by visualization
    genre_data = []
    for genre, stats in genre_stats.items():
        genre_data.append({
            'genre': genre,
            'minutes': round(stats['minutes'], 2),
            'trackCount': round(stats['trackCount'], 1)
        })
    
    #& sort by minutes in descending order
    genre_data.sort(key=lambda x: x['minutes'], reverse=True)
    
    #& limit top genres (adjust limit as needed)
    return genre_data[:20]  #~ return top 20 genres

def get_artist_genre_matrix(user_id, time_range='medium_term', limit=10):
    """
    Generate matrix data for chord diagram visualization.
    
    Args:
        user_id: User ID
        time_range: 'short_term', 'medium_term', or 'long_term'
        limit: Maximum number of artists to include
        
    Returns:
        Dictionary with matrix data, names, and colors
    """
    #& fetch user frm database
    user = User.query.get(user_id)
    if not user or not user.oauth_token:
        raise Exception('User not found or not authenticated')
    
    #& call spotify api fr top artists
    headers = {'Authorization': f'Bearer {user.oauth_token}'}
    response = requests.get(
        f'https://api.spotify.com/v1/me/top/artists?limit={limit}&time_range={time_range}', 
        headers=headers
    )
    
    if response.status_code != 200:
        raise Exception(f'Failed to fetch data from Spotify: {response.json()}')
    
    artists_data = response.json().get('items', [])
    
    #& extract artists & their genres
    artists = []
    genres = set()
    artist_genres = {}
    
    for artist in artists_data:
        name = artist.get('name')
        artist_genre_list = artist.get('genres', [])
        
        if name and artist_genre_list:
            artists.append(name)
            artist_genres[name] = artist_genre_list
            genres.update(artist_genre_list)
    
    #& limit most common genres if too many
    if len(genres) > 15:
        #~ count genre occurrences
        genre_counts = defaultdict(int)
        for artist_genre_list in artist_genres.values():
            for genre in artist_genre_list:
                genre_counts[genre] += 1
        
        #~ keep only top genres
        top_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)[:15]
        genres = {genre for genre, _ in top_genres}
    
    #& convert to lists fr consistent ordering
    artists_list = artists[:limit]  #~ limit number of artists
    genres_list = list(genres)
    
    #& create names list fr all nodes (artists + genres)
    names = artists_list + genres_list
    
    #& generate colors fr nodes
    colors = generate_colors(len(names))
    
    #& create adjacency matrix
    matrix_size = len(names)
    matrix = [[0 for _ in range(matrix_size)] for _ in range(matrix_size)]
    
    #& fill matrix w connection weights
    for i, artist in enumerate(artists_list):
        artist_genre_list = artist_genres.get(artist, [])
        artist_genre_list = [g for g in artist_genre_list if g in genres_list]
        
        if not artist_genre_list:
            continue
            
        #& get listening counts fr this artist
        listen_count = ListeningHistory.query.filter(
            ListeningHistory.user_id == user_id,
            ListeningHistory.artist.ilike(f'%{artist}%')
        ).count()
        
        if listen_count == 0:
            listen_count = 10  #~ default weight if no listening data
        
        #& distribute listening count across genres
        weight_per_genre = listen_count / len(artist_genre_list)
        
        for genre in artist_genre_list:
            j = len(artists_list) + genres_list.index(genre)
            
            #& add directed connections frm artist to genre and vice versa
            matrix[i][j] = weight_per_genre
            matrix[j][i] = weight_per_genre
    
    return {
        'matrix': matrix,
        'names': names,
        'colors': colors
    }

def generate_colors(count):
    """
    Generate an array of distinct colors.
    
    Args:
        count: Number of colors to generate
        
    Returns:
        List of hex color codes
    """
    colors = []
    for i in range(count):
        #& use HSV color space to generate evenly spaced colors
        h = i / count
        s = 0.7  #~ saturation
        v = 0.9  #~ value
        r, g, b = colorsys.hsv_to_rgb(h, s, v)
        
        #& convert to hex
        color = "#{:02x}{:02x}{:02x}".format(
            int(r * 255), int(g * 255), int(b * 255)
        )
        colors.append(color)
    
    return colors