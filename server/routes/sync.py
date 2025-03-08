from flask import Blueprint, jsonify, request
from server.model import User
from server.tasks.sync_tasks import fetch_listening_history, aggregate_listening_history_task

sync_bp = Blueprint('sync', __name__)

@sync_bp.route('/listening-history', methods=['POST'])
def sync_listening_history_endpoint():
    """
    Trigger bg task to fetch user recently played tracks from Spotify.
    
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
        return jsonify({'error': 'user not found'}), 404

    #~ for syncing listening history:
    task = fetch_listening_history.delay(user_id)
    return jsonify({'message': 'listening history sync task triggered', 'task_id': task.id}), 202

@sync_bp.route('/aggregate', methods=['POST'])
def aggregate_listening_history_endpoint():
    """
    Trigger bg task to aggregate user listening history and update AggregatedStats.
    
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

    #~ for aggregating stats:
    task = aggregate_listening_history_task.delay(user_id)
    return jsonify({'message': 'aggregation task triggered', 'task_id': task.id}), 202
