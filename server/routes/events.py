from flask import Blueprint, jsonify, request
from server.app import socketio
from server.extensions import db
from server.model import Event
from datetime import datetime
import os
import requests

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
    socketio.emit('notification', {'message': f'New event created: {data.get("name", "Unnamed Event")}'})
    return jsonify({'message': 'Event created', 'event': data}), 201

#& save user-tagged event endpoint
@events_bp.route('/save', methods=['POST'])
def save_event():
    data = request.get_json()
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    #& date string to datetime conversion
    event_date_str = data.get('date')
    event_date = None
    if event_date_str:
        try:
            event_date = datetime.fromisoformat(event_date_str)
        except Exception as e:
            pass

    #& include url if provided saved events have clickable titles
    new_event = Event(
        title=data.get('name'),
        location=data.get('location'),
        event_date=event_date,
        promoter_info=data.get('promoter_info', ''),
        tags=data.get('tags', []),
        user_id=user_id,  #~ store user association
        url=data.get('url', ''),  #~ store event url if have
        image=data.get('image', '')  #~ store event image if have
    )
    db.session.add(new_event)
    db.session.commit()
    return jsonify({
        'message': 'Event saved successfully',
        'event': {
            'id': new_event.id,
            'name': new_event.title,
            'location': new_event.location,
            'date': new_event.event_date.isoformat() if new_event.event_date else None,
            'promoter_info': new_event.promoter_info,
            'tags': new_event.tags,
            'url': new_event.url,
            'image': new_event.image
        }
    }), 201
    
#& all event APIs
@events_bp.route('/all', methods=['GET'])
def all_events():
    country_code = request.args.get('countryCode', 'SG')
    
    #& ticketmaster call
    tm_api_key = os.environ.get('TICKETMASTER_API_KEY')
    tm_url = f"https://app.ticketmaster.com/discovery/v2/events.json?countryCode={country_code}&apikey={tm_api_key}"
    
    #& jambase call
    jambase_api_key = os.environ.get('JAMBASE_API_KEY')
    jambase_url = f"https://www.jambase.com/jb-api/v1/events?apikey={jambase_api_key}&geoCountryIso2={country_code}"

    events_combined = []
    errors = {}
    
    #& fetch ticketmaster
    try:
        tm_response = requests.get(tm_url)
        tm_response.raise_for_status()
        tm_data = tm_response.json()
        if tm_data and tm_data.get('_embedded') and tm_data['_embedded'].get('events'):
            events_combined.extend(tm_data['_embedded']['events'])
    except Exception as e:
        errors['ticketmaster'] = str(e)
    
    #& fetch jambase
    try:
        jambase_response = requests.get(jambase_url)
        jambase_response.raise_for_status()
        jambase_data = jambase_response.json()
        if jambase_data and jambase_data.get('events'):
            events_combined.extend(jambase_data['events'])
    except Exception as e:
        errors['jambase'] = str(e)
    
    return jsonify({
        'events': events_combined,
        'errors': errors
    })

#& remove user saved event
@events_bp.route('/delete/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    #~ clear user association (simulate unsaving the event)
    event.user_id = None
    db.session.commit()
    #~ case handling delete record from db
    if not event.promoter_info and not event.user_id:
        db.session.delete(event)
        db.session.commit()
        return jsonify({'message': 'Orphaned event removed successfully', 'event_id': event_id}), 200
    else:
        return jsonify({'message': 'Event unsaved successfully', 'event_id': event_id}), 200

#& fetch user saved events
@events_bp.route('/saved', methods=['GET'])
def get_saved_events():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    try:
        user_id_int = int(user_id) #~ convert uid to int as req by model
    except ValueError:
        return jsonify({'error': 'Invalid user_id format'}), 400
    saved = Event.query.filter_by(user_id=user_id_int).all()
    saved_list = []
    for e in saved:
        saved_list.append({
            'id': e.id,
            'name': e.title,
            'location': e.location,
            'date': e.event_date.isoformat() if e.event_date else None,
            'promoter_info': e.promoter_info,
            'tags': e.tags,
            'url': e.url,
            'image': e.image
        })
    return jsonify({'events': saved_list})