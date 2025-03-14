from flask import Blueprint, jsonify, request
from server.app import socketio
from server.extensions import db
from server.model import Event, SavedEvent
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

    title = data.get('name') or data.get('title')
    if not title:
        return jsonify({'error': 'Event title is required'}), 400

    #~ date string to datetime conversion
    event_date_str = data.get('date')
    event_date = None
    if event_date_str:
        try:
            event_date = datetime.fromisoformat(event_date_str)
        except Exception as e:
            pass

    #~ event checker (by title and location).
    event = Event.query.filter_by(title=title, location=data.get('location')).first()
    if not event:
        #~ create new event record
        event = Event(
            title=title,
            location=data.get('location'),
            event_date=event_date,
            promoter_info=data.get('promoter_info', ''),
            tags=data.get('tags', []),
            url=data.get('url', ''),
            image=data.get('image', '')
        )
        db.session.add(event)
        db.session.commit()

    #~ create new saved event record if not already saved by this user
    existing = SavedEvent.query.filter_by(user_id=user_id, event_id=event.id).first()
    if not existing:
        saved = SavedEvent(user_id=user_id, event_id=event.id)
        db.session.add(saved)
        db.session.commit()

    return jsonify({
        'message': 'Event saved successfully',
        'event': {
            'id': event.id,
            'name': event.title,
            'location': event.location,
            'date': event.event_date.isoformat() if event.event_date else None,
            'promoter_info': event.promoter_info,
            'tags': event.tags,
            'url': event.url,
            'image': event.image
        }
    }), 201

#& GET /events/all: fetch external events and recommended (sponsored) events separately
@events_bp.route('/all', methods=['GET'])
def all_events():
    country_code = request.args.get('countryCode', 'SG')
    
    #& ticketmaster call
    tm_api_key = os.environ.get('TICKETMASTER_API_KEY')
    tm_url = f"https://app.ticketmaster.com/discovery/v2/events.json?countryCode={country_code}&apikey={tm_api_key}"
    
    #& jambase call
    jambase_api_key = os.environ.get('JAMBASE_API_KEY')
    jambase_url = f"https://www.jambase.com/jb-api/v1/events?apikey={jambase_api_key}&geoCountryIso2={country_code}"

    external_events = []
    errors = {}
    
    #& fetch ticketmaster
    try:
        tm_response = requests.get(tm_url)
        tm_response.raise_for_status()
        tm_data = tm_response.json()
        if tm_data and tm_data.get('_embedded') and tm_data['_embedded'].get('events'):
            external_events.extend(tm_data['_embedded']['events'])
    except Exception as e:
        errors['ticketmaster'] = str(e)
    
    #& fetch jambase
    try:
        jambase_response = requests.get(jambase_url)
        jambase_response.raise_for_status()
        jambase_data = jambase_response.json()
        if jambase_data and jambase_data.get('events'):
            external_events.extend(jambase_data['events'])
    except Exception as e:
        errors['jambase'] = str(e)
    
    #& fetch internal sponsored events from db (recommended events)
    internal_sponsored = Event.query.filter_by(is_sponsored=True).all()
    recommended_events = []
    for ev in internal_sponsored:
        recommended_events.append({
            'id': ev.id,
            'title': ev.title,
            'location': ev.location,
            'event_date': ev.event_date.isoformat() if ev.event_date else None,
            'status': ev.status,
            'promoter_info': ev.promoter_info,
            'is_sponsored': ev.is_sponsored,
            'target_country': ev.target_country,
            'target_genre_interest': ev.target_genre_interest,
            'target_artist_interest': ev.target_artist_interest,
            'listening_threshold': ev.listening_threshold,
            'target_roles': ev.target_roles
        })
    
    return jsonify({
        'recommended_events': recommended_events,
        'external_events': external_events,
        'errors': errors
    })

#& remove user saved event
def delete_event(event_id):
    #~ delete saved_event record(s) for this event
    saved = SavedEvent.query.filter_by(event_id=event_id).all()
    if not saved:
        return jsonify({'error': 'Saved event not found'}), 404
    for s in saved:
        db.session.delete(s)
    db.session.commit()
    
    #~ check if event should be removed from event table
    event = Event.query.get(event_id)
    if event:
        #~ if no owner: no user_id, no promoter_info (empty or whitespace), and is_sponsored is false,
        #~ then delete the event record entirely
        if (not event.user_id) and (not event.promoter_info or event.promoter_info.strip() == '') and (event.is_sponsored is False):
            db.session.delete(event)
            db.session.commit()
            return jsonify({'message': 'Event unsaved and removed successfully', 'event_id': event_id}), 200

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
    # Perform a join between SavedEvent and Event to get current event details.
    saved = db.session.query(Event).join(SavedEvent, Event.id == SavedEvent.event_id).filter(SavedEvent.user_id == user_id_int).all()
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

#& fetch all sponsored events and submit/update promoter event
@events_bp.route('/promoter', methods=['GET', 'POST'])
def promoter_events():
    if request.method == 'GET':
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        try:
            user_id_int = int(user_id)
        except ValueError:
            return jsonify({'error': 'Invalid user_id format'}), 400
        events = Event.query.filter_by(promoter_id=user_id_int).all()
        events_list = []
        for ev in events:
            events_list.append({
                'id': ev.id,
                'title': ev.title,
                'location': ev.location,
                'event_date': ev.event_date.isoformat() if ev.event_date else None,
                'status': ev.status,
                'views': getattr(ev, 'views', 0),
                'saves': getattr(ev, 'saves', 0),
                'tags': ev.tags,
                'engagement': getattr(ev, 'engagement', 0),
                'promoter_info': ev.promoter_info,
                'is_sponsored': ev.is_sponsored,
                'target_country': ev.target_country,
                'target_genre_interest': ev.target_genre_interest,
                'target_artist_interest': ev.target_artist_interest,
                'listening_threshold': ev.listening_threshold,
                'target_roles': ev.target_roles
            })
        return jsonify({'events': events_list})
    
    if request.method == 'POST':
        data = request.get_json()
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400

        #& combine date & time fields into proper datetime
        event_date = None
        event_date_str = data.get('date')
        time_str = data.get('time')
        if event_date_str:
            try:
                if time_str:
                    event_date = datetime.fromisoformat(f"{event_date_str}T{time_str}")
                else:
                    event_date = datetime.fromisoformat(event_date_str)
            except Exception:
                pass

        new_event = Event(
            title=data.get('title'),
            location=data.get('location'),
            event_date=event_date,
            promoter_info='',  #~ to set below
            tags=data.get('tags', []),
            promoter_id=user_id,  #~ set promoter_id instead of user_id
            url=data.get('url', ''),
            image=data.get('image', ''),
            status='Pre-Event',
            target_country=data.get('targetCountry'),
            target_genre_interest=data.get('targetGenreInterest'),
            target_artist_interest=data.get('targetArtistInterest'),
            listening_threshold=int(data.get('listeningThreshold')) if data.get('listeningThreshold') else None,
            target_roles=data.get('targetRoles', [])
        )
        #& if event submitted by promoter role, mark as sponsored
        if data.get('promoter_info') or True:  #~ condition adjustable
            new_event.promoter_info = data.get('promoter_info') or "Promoter: " + str(user_id)
            new_event.is_sponsored = True

        db.session.add(new_event)
        db.session.commit()
        return jsonify({'message': 'Promoter event submitted successfully', 'event': {
            'id': new_event.id,
            'title': new_event.title,
            'location': new_event.location,
            'event_date': new_event.event_date.isoformat() if new_event.event_date else None,
            'status': new_event.status,
            'promoter_info': new_event.promoter_info,
            'is_sponsored': new_event.is_sponsored,
            'target_country': new_event.target_country,
            'target_genre_interest': new_event.target_genre_interest,
            'target_artist_interest': new_event.target_artist_interest,
            'listening_threshold': new_event.listening_threshold,
            'target_roles': new_event.target_roles
        }}), 201

#& update promoter event details
@events_bp.route('/promoter/<int:event_id>', methods=['PUT'])
def update_promoter_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    data = request.get_json()
    event.title = data.get('title', event.title)
    event.location = data.get('location', event.location)
    date_str = data.get('date')
    time_str = data.get('time')
    if date_str:
        try:
            if time_str:
                event.event_date = datetime.fromisoformat(f"{date_str}T{time_str}")
            else:
                event.event_date = datetime.fromisoformat(date_str)
        except Exception:
            pass
    event.description = data.get('description', getattr(event, 'description', ''))
    event.status = data.get('status', event.status)
    #~ make sure event remains sponsored when updated by promoter
    event.is_sponsored = True
    event.promoter_info = data.get('promoter_info', event.promoter_info)
    #~ update targeting fields if provided
    event.target_country = data.get('targetCountry', event.target_country)
    event.target_genre_interest = data.get('targetGenreInterest', event.target_genre_interest)
    event.target_artist_interest = data.get('targetArtistInterest', event.target_artist_interest)
    if data.get('listeningThreshold'):
        try:
            event.listening_threshold = int(data.get('listeningThreshold'))
        except Exception:
            pass
    event.target_roles = data.get('targetRoles', event.target_roles)
    db.session.commit()
    return jsonify({'message': 'Event updated successfully', 'event': {
        'id': event.id,
        'title': event.title,
        'location': event.location,
        'event_date': event.event_date.isoformat() if event.event_date else None,
        'status': event.status,
        'promoter_info': event.promoter_info,
        'is_sponsored': event.is_sponsored,
        'target_country': event.target_country,
        'target_genre_interest': event.target_genre_interest,
        'target_artist_interest': event.target_artist_interest,
        'listening_threshold': event.listening_threshold,
        'target_roles': event.target_roles
    }}), 200

@events_bp.route('/promoter/<int:event_id>', methods=['DELETE'])
def delete_promoter_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    #~ check if is promoter event verify set promoter_id
    if not event.promoter_id:
        return jsonify({'error': 'Not a promoter event'}), 400
    db.session.delete(event)
    db.session.commit()
    return jsonify({'message': 'Event deleted successfully', 'event_id': event_id}), 200