from flask import Blueprint, jsonify, request
from server.services.analytics_service import get_listening_trends, get_listening_heatmap

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