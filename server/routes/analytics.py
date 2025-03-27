from flask import Blueprint, jsonify, request
from server.services.analytics_service import (
    get_listening_trends, 
    get_listening_heatmap,
    get_genre_distribution,
    get_artist_genre_matrix
)
from server.routes.home import get_longest_listening_streak, get_top_listeners_percentile
from server.extensions import db
from server.model import ListeningHistory
from sqlalchemy import func

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/user/listening-trends', methods=['GET'])
def listening_trends_endpoint():
    """
    Get listening trends data for visualization.
    Query params:
        user_id: User ID
        time_frame: 'daily', 'weekly', or 'monthly'
        days: Number of days to include (default 30)
    """
    user_id = request.args.get('user_id')
    time_frame = request.args.get('time_frame', 'daily')
    days = request.args.get('days', 30, type=int)
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
        
    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({'error': 'Invalid user_id format'}), 400
    
    if time_frame not in ['daily', 'weekly', 'monthly']:
        return jsonify({'error': 'Invalid time_frame. Must be daily, weekly, or monthly'}), 400
        
    try:
        trends_data = get_listening_trends(user_id, time_frame, days)
        return jsonify(trends_data)
    except Exception as e:
        print(f"Error fetching listening trends: {str(e)}")
        return jsonify({'error': 'Failed to fetch listening trends'}), 500

@analytics_bp.route('/user/listening-heatmap', methods=['GET'])
def listening_heatmap_endpoint():
    """
    Get listening heatmap data showing activity by day of week and hour.
    Query params:
        user_id: User ID
        days: Number of days to include (default 90)
    """
    user_id = request.args.get('user_id')
    days = request.args.get('days', 90, type=int)
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
        
    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({'error': 'Invalid user_id format'}), 400
        
    try:
        heatmap_data = get_listening_heatmap(user_id, days)
        return jsonify(heatmap_data)
    except Exception as e:
        print(f"Error fetching listening heatmap: {str(e)}")
        return jsonify({'error': 'Failed to fetch listening heatmap'}), 500
    
@analytics_bp.route('/user/genre-distribution', methods=['GET'])
def genre_distribution_endpoint():
    """
    Get genre distribution data for visualization.
    Query params:
        user_id: User ID
        time_range: 'short_term', 'medium_term', or 'long_term' (default 'medium_term')
    """
    user_id = request.args.get('user_id')
    time_range = request.args.get('time_range', 'medium_term')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
        
    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({'error': 'Invalid user_id format'}), 400
    
    try:
        genre_data = get_genre_distribution(user_id, time_range)
        return jsonify(genre_data)
    except Exception as e:
        print(f"Error fetching genre distribution: {str(e)}")
        return jsonify({'error': 'Failed to fetch genre distribution'}), 500

@analytics_bp.route('/user/artist-genre-matrix', methods=['GET'])
def artist_genre_matrix_endpoint():
    """
    Get artist-genre matrix data for chord diagram visualization.
    Query params:
        user_id: User ID
        time_range: 'short_term', 'medium_term', or 'long_term' (default 'medium_term')
        limit: Number of artists to include (default 10)
    """
    user_id = request.args.get('user_id')
    time_range = request.args.get('time_range', 'medium_term')
    limit = request.args.get('limit', 10, type=int)
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
        
    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({'error': 'Invalid user_id format'}), 400
    
    try:
        matrix_data = get_artist_genre_matrix(user_id, time_range, limit)
        return jsonify(matrix_data)
    except Exception as e:
        print(f"Error fetching artist-genre matrix: {str(e)}")
        return jsonify({'error': 'Failed to fetch artist-genre matrix'}), 500
    
@analytics_bp.route('/user/listening-streak', methods=['GET'])
def listening_streak_endpoint():
    """
    Get longest listening streak data including total minutes, biggest day,
    total tracks played, and monthly listening hours.
    Query params:
        user_id: User ID
    """
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
        
    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({'error': 'Invalid user_id format'}), 400
        
    try:
        streak_data = get_longest_listening_streak(user_id)
        return jsonify(streak_data)
    except Exception as e:
        print(f"Error fetching listening streak data: {str(e)}")
        return jsonify({'error': 'Failed to fetch listening streak data'}), 500
    
@analytics_bp.route('/user/top-listeners-percentile', methods=['GET'])
def top_listeners_percentile_endpoint():
    """
    Get percentile ranking for user among listeners of favorite artist.
    Query params:
        user_id: User ID
    """
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
        
    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({'error': 'Invalid user_id format'}), 400
        
    try:
        print(f"calling get_top_listeners_percentile with user_id={user_id}")
        result = get_top_listeners_percentile(user_id)
        print(f"result type: {type(result)}")
        return jsonify(result)
    except Exception as e:
        import traceback
        print(f"error fetching top listeners percentile data: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': 'failed to fetch top listeners percentile data'}), 500
    
@analytics_bp.route('/user/earliest-listening-date', methods=['GET'])
def earliest_listening_date_endpoint():
    """
    Get the earliest date from user's listening history.
    Query params:
        user_id: User ID
    """
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
        
    try:
        user_id = int(user_id)
    except ValueError:
        return jsonify({'error': 'Invalid user_id format'}), 400
    
    try:
        #~ earliest played_at date query
        earliest_record = db.session.query(
            func.min(ListeningHistory.played_at)
        ).filter(
            ListeningHistory.user_id == user_id
        ).scalar()
        
        if earliest_record:
            return jsonify({
                'earliest_date': earliest_record.isoformat()
            })
        else:
            return jsonify({
                'earliest_date': None
            })
    except Exception as e:
        print(f"Error fetching earliest listening date: {str(e)}")
        return jsonify({'error': 'Failed to fetch earliest listening date'}), 500