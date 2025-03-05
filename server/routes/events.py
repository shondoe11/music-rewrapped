from flask import Blueprint, jsonify, request

events_bp = Blueprint('events', __name__)

@events_bp.route('/')
def index():
    return jsonify({'message': 'Welcome to the Events API endpoints.'})

@events_bp.route('/list', methods=['GET'])
def list_events():
    #& placeholder first: replace with real logic to fetch events from db later
    sample_events = [
        {'id': 1, 'name': 'Concert A', 'location': 'City X'},
        {'id': 2, 'name': 'Concert B', 'location': 'City Y'}
    ]
    return jsonify({'events': sample_events})

@events_bp.route('/', methods=['POST'])
def create_event():
    data = request.get_json()
    #& placeholder first: replace with real logic to fetch events from db later
    return jsonify({'message': 'Event created', 'event': data}), 201