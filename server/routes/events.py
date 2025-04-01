from flask import Blueprint, jsonify, request, Response
from server.app import socketio
from server.extensions import db
from server.model import Event, SavedEvent, EventMetricsLog
from datetime import datetime, timezone, timedelta
import os
import requests
import csv
import io
import json
from sqlalchemy import func

events_bp = Blueprint('events', __name__)

@events_bp.route('/')
def index():
    return jsonify({'message': 'Welcome to the Events API endpoints.'})

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
            image=data.get('image', ''),
            data_source=data.get('data_source', '')  #~ data src fr attribution
        )
        db.session.add(event)
        db.session.commit()
    else:
        #~ increment saves count when an event is saved by a user
        event.saves = (event.saves or 0) + 1
        db.session.commit()

    #~ create new saved event record if not already saved by this user
    existing = SavedEvent.query.filter_by(user_id=user_id, event_id=event.id).first()
    if not existing:
        saved = SavedEvent(user_id=user_id, event_id=event.id)
        db.session.add(saved)
        db.session.commit()
        
    today = datetime.now(timezone.utc).date()
    daily_log = EventMetricsLog.query.filter_by(
        event_id=event.id, 
        date=today
    ).first()

    if daily_log:
        daily_log.saves += 1
    else:
        daily_log = EventMetricsLog(
            event_id=event.id,
            date=today,
            views=0,
            saves=1
        )
        db.session.add(daily_log)

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
            'image': event.image,
            'saves': event.saves,
            'data_source': event.data_source  #~ include data src in res
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
            tm_events = tm_data['_embedded']['events']
            #~ mark data src
            for event in tm_events:
                event['data_source'] = 'ticketmaster'
            external_events.extend(tm_events)
    except Exception as e:
        errors['ticketmaster'] = str(e)
    
    #& fetch jambase
    try:
        jambase_response = requests.get(jambase_url)
        jambase_response.raise_for_status()
        jambase_data = jambase_response.json()
        if jambase_data and jambase_data.get('events'):
            jambase_events = jambase_data['events']
            #~ mark data src + ensure necessary links
            for event in jambase_events:
                event['data_source'] = 'jambase'
                
                #& add jambase url if no ticket links avail
                if not event.get('ticketLinks') or len(event.get('ticketLinks', [])) == 0:
                    #~ format jambase event url fr compliance
                    artist_name = event.get('name', '').replace(' ', '-').lower()
                    venue_name = event.get('venue', {}).get('name', '').replace(' ', '-').lower()
                    event_date = event.get('date', '').split('T')[0] if event.get('date') else ''
                    event['jambase_url'] = f"https://www.jambase.com/show/{artist_name}-{venue_name}-{event_date}"
            
            external_events.extend(jambase_events)
    except Exception as e:
        errors['jambase'] = str(e)
    
    #& fetch internal sponsored events frm db (recommended events)
    internal_sponsored = Event.query.filter_by(is_sponsored=True).all()
    recommended_events = []
    for ev in internal_sponsored:
        #~ increment view count for each sponsored event
        ev.views = (ev.views or 0) + 1
        db.session.commit()
        
        recommended_events.append({
            'id': ev.id,
            'title': ev.title,
            'location': ev.location,
            'event_date': ev.event_date.isoformat() if ev.event_date else None,
            'status': ev.status,
            'promoter_info': ev.promoter_info,
            'details': ev.details,
            'is_sponsored': ev.is_sponsored,
            'target_country': ev.target_country,
            'target_genre_interest': ev.target_genre_interest,
            'target_artist_interest': ev.target_artist_interest,
            'listening_threshold': ev.listening_threshold,
            'target_roles': ev.target_roles,
            'url': ev.url,
            'image': ev.image,
            'views': ev.views,
            'saves': ev.saves,
            'data_source': ev.data_source or 'internal'  #~ include data src
        })
    return jsonify({
        'recommended_events': recommended_events,
        'external_events': external_events,
        'errors': errors
    })

#& remove user saved event
@events_bp.route('/delete/<int:event_id>', methods=['DELETE'])
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
    #~ perform join between SavedEvent & Event to get current event details
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
            'image': e.image,
            'data_source': e.data_source  #~ include data source fr attribution on frontend
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
                'target_roles': ev.target_roles,
                'url': ev.url,
                'image': ev.image,
                'details': ev.details,
                'data_source': ev.data_source or 'internal'  #~ include data src
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
            details=data.get('details') or data.get('description'),
            tags=data.get('tags', []),
            promoter_id=user_id,  #~ set promoter_id instead of user_id
            url=data.get('url', ''),
            image=data.get('image', ''),
            status='Pre-Event',
            target_country=data.get('targetCountry'),
            target_genre_interest=data.get('targetGenreInterest'),
            target_artist_interest=data.get('targetArtistInterest'),
            listening_threshold=int(data.get('listeningThreshold')) if data.get('listeningThreshold') else None,
            target_roles=data.get('targetRoles', []),
            views=0,
            saves=0,
            engagement=0,
            data_source='internal'  #~ mark as internal data src
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
            'details': new_event.details,
            'is_sponsored': new_event.is_sponsored,
            'target_country': new_event.target_country,
            'target_genre_interest': new_event.target_genre_interest,
            'target_artist_interest': new_event.target_artist_interest,
            'listening_threshold': new_event.listening_threshold,
            'target_roles': new_event.target_roles,
            'url': new_event.url,
            'image': new_event.image,
            'views': 0,
            'saves': 0,
            'data_source': new_event.data_source
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
    event.details = data.get('details', getattr(event, 'details', ''))
    event.status = data.get('status', event.status)
    #~ make sure event remains sponsored when updated by promoter
    event.is_sponsored = True
    event.promoter_info = data.get('promoter_info', event.promoter_info)
    event.url = data.get('url', event.url)
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
        'details': event.details,
        'is_sponsored': event.is_sponsored,
        'target_country': event.target_country,
        'target_genre_interest': event.target_genre_interest,
        'target_artist_interest': event.target_artist_interest,
        'listening_threshold': event.listening_threshold,
        'target_roles': event.target_roles,
        'views': event.views,
        'saves': event.saves,
        'data_source': event.data_source
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

#& track event view
@events_bp.route('/track/view/<int:event_id>', methods=['POST'])
def track_event_view(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    today = datetime.now(timezone.utc).date()
    
    #~ update daily metrics log
    daily_log = EventMetricsLog.query.filter_by(
        event_id=event_id, 
        date=today
    ).first()
    
    if daily_log:
        daily_log.views += 1
    else:
        daily_log = EventMetricsLog(
            event_id=event_id,
            date=today,
            views=1,
            saves=0
        )
        db.session.add(daily_log)
    
    #~ update overall event metrics
    event.views = (event.views or 0) + 1
    event.engagement = event.views + ((event.saves or 0) * 2)
    
    db.session.commit()
    return jsonify({
        'message': 'View tracked successfully',
        'event_id': event_id,
        'views': event.views,
        'engagement': event.engagement
    }), 200

#& get analytics fr promoter's events
@events_bp.route('/analytics/promoter', methods=['GET'])
def get_promoter_analytics():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    try:
        user_id_int = int(user_id)
    except ValueError:
        return jsonify({'error': 'Invalid user_id format'}), 400
        
    #~ get all events fr this promoter
    events = Event.query.filter_by(promoter_id=user_id_int).all()
    
    if not events:
        return jsonify({
            'total_events': 0,
            'total_views': 0,
            'total_saves': 0,
            'average_engagement': 0,
            'events_analytics': []
        }), 200
    
    #~ calculate summary stats
    total_events = len(events)
    total_views = sum(event.views or 0 for event in events)
    total_saves = sum(event.saves or 0 for event in events)
    avg_engagement = sum(event.engagement or 0 for event in events) / total_events if total_events > 0 else 0
    
    #~ compile detailed analytics fr each event
    events_analytics = []
    for event in events:
        save_rate = (event.saves or 0) / (event.views or 1) * 100  #~ prevent division by zero
        
        events_analytics.append({
            'id': event.id,
            'title': event.title,
            'views': event.views or 0,
            'saves': event.saves or 0,
            'engagement': event.engagement or 0,
            'save_rate': round(save_rate, 2),
            'event_date': event.event_date.isoformat() if event.event_date else None,
            'status': event.status,
            'target_country': event.target_country,
            'target_genre_interest': event.target_genre_interest,
            'target_artist_interest': event.target_artist_interest
        })
    
    #~ sort events by engagement score (descending)
    events_analytics.sort(key=lambda x: x['engagement'], reverse=True)
    
    return jsonify({
        'total_events': total_events,
        'total_views': total_views,
        'total_saves': total_saves,
        'average_engagement': round(avg_engagement, 2),
        'events_analytics': events_analytics
    }), 200
    
@events_bp.route('/analytics/time-series/<int:event_id>', methods=['GET'])
def event_time_series(event_id):
    """Get time-series analytics data for a specific event."""
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
        
    #~ check if user has permission to view this data
    user_id = request.args.get('user_id')
    if not user_id or int(user_id) != event.promoter_id:
        return jsonify({'error': 'Unauthorized access'}), 403
        
    #~ get time range parameters
    days = request.args.get('days', 30, type=int)
    end_date = datetime.now(timezone.utc).date()
    start_date = end_date - timedelta(days=days)
    
    #~ query daily metrics
    daily_metrics = EventMetricsLog.query.filter(
        EventMetricsLog.event_id == event_id,
        EventMetricsLog.date >= start_date,
        EventMetricsLog.date <= end_date
    ).order_by(EventMetricsLog.date).all()
    
    #~ fill in missing dates w zero values
    metrics_by_date = {m.date.isoformat(): {'views': m.views, 'saves': m.saves} for m in daily_metrics}
    
    date_range = []
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.isoformat()
        if date_str not in metrics_by_date:
            metrics_by_date[date_str] = {'views': 0, 'saves': 0}
        
        date_range.append({
            'date': date_str,
            'views': metrics_by_date[date_str]['views'],
            'saves': metrics_by_date[date_str]['saves'],
            'engagement': metrics_by_date[date_str]['views'] + (metrics_by_date[date_str]['saves'] * 2)
        })
        current_date += timedelta(days=1)
    
    #~ calculate weekly aggregations
    weekly_metrics = {}
    for entry in date_range:
        date_obj = datetime.fromisoformat(entry['date'])
        year, week_num, _ = date_obj.isocalendar()
        week_key = f"{year}-W{week_num:02d}"
        
        if week_key not in weekly_metrics:
            weekly_metrics[week_key] = {'views': 0, 'saves': 0, 'engagement': 0}
            
        weekly_metrics[week_key]['views'] += entry['views']
        weekly_metrics[week_key]['saves'] += entry['saves']
        weekly_metrics[week_key]['engagement'] += entry['engagement']
    
    weekly_range = [
        {'week': week, **metrics}
        for week, metrics in sorted(weekly_metrics.items())
    ]
    
    return jsonify({
        'event_id': event_id,
        'time_series': {
            'daily': date_range,
            'weekly': weekly_range
        },
        'summary': {
            'total_views': sum(entry['views'] for entry in date_range),
            'total_saves': sum(entry['saves'] for entry in date_range),
            'average_daily_views': round(sum(entry['views'] for entry in date_range) / len(date_range), 2),
            'average_daily_saves': round(sum(entry['saves'] for entry in date_range) / len(date_range), 2)
        }
    })

@events_bp.route('/analytics/time-series/promoter', methods=['GET'])
def promoter_time_series():
    """Get time-series analytics data for all events by a promoter."""
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    #~ get time range parameters
    days = request.args.get('days', 30, type=int)
    end_date = datetime.now(timezone.utc).date()
    start_date = end_date - timedelta(days=days)
    
    #~ get all events by this promoter
    events = Event.query.filter_by(promoter_id=int(user_id)).all()
    event_ids = [event.id for event in events]
    
    if not event_ids:
        return jsonify({
            'time_series': {
                'daily': [],
                'weekly': []
            },
            'summary': {
                'total_views': 0,
                'total_saves': 0,
                'average_daily_views': 0,
                'average_daily_saves': 0
            }
        })
    
    #~ query aggregated daily metrics fr all events
    query = db.session.query(
        EventMetricsLog.date,
        func.sum(EventMetricsLog.views).label('views'),
        func.sum(EventMetricsLog.saves).label('saves')
    ).filter(
        EventMetricsLog.event_id.in_(event_ids),
        EventMetricsLog.date >= start_date,
        EventMetricsLog.date <= end_date
    ).group_by(
        EventMetricsLog.date
    ).order_by(
        EventMetricsLog.date
    )
    
    daily_results = query.all()
    
    #~ format results & fill missing dates
    metrics_by_date = {row.date.isoformat(): {'views': row.views, 'saves': row.saves} for row in daily_results}
    
    date_range = []
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.isoformat()
        if date_str not in metrics_by_date:
            metrics_by_date[date_str] = {'views': 0, 'saves': 0}
        
        date_range.append({
            'date': date_str,
            'views': metrics_by_date[date_str]['views'],
            'saves': metrics_by_date[date_str]['saves'],
            'engagement': metrics_by_date[date_str]['views'] + (metrics_by_date[date_str]['saves'] * 2)
        })
        current_date += timedelta(days=1)
    
    #~ weekly aggregations (similar to event-specific endpoint)
    weekly_metrics = {}
    for entry in date_range:
        date_obj = datetime.fromisoformat(entry['date'])
        year, week_num, _ = date_obj.isocalendar()
        week_key = f"{year}-W{week_num:02d}"
        
        if week_key not in weekly_metrics:
            weekly_metrics[week_key] = {'views': 0, 'saves': 0, 'engagement': 0}
            
        weekly_metrics[week_key]['views'] += entry['views']
        weekly_metrics[week_key]['saves'] += entry['saves']
        weekly_metrics[week_key]['engagement'] += entry['engagement']
    
    weekly_range = [
        {'week': week, **metrics}
        for week, metrics in sorted(weekly_metrics.items())
    ]
    
    return jsonify({
        'time_series': {
            'daily': date_range,
            'weekly': weekly_range
        },
        'summary': {
            'total_views': sum(entry['views'] for entry in date_range),
            'total_saves': sum(entry['saves'] for entry in date_range),
            'average_daily_views': round(sum(entry['views'] for entry in date_range) / len(date_range), 2),
            'average_daily_saves': round(sum(entry['saves'] for entry in date_range) / len(date_range), 2)
        }
    })

@events_bp.route('/export/analytics/<int:event_id>', methods=['GET'])
def export_event_analytics(event_id):
    """Export analytics data for a specific event."""
    event = Event.query.get(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
        
    #~ check if user has permission to export data
    user_id = request.args.get('user_id')
    if not user_id or int(user_id) != event.promoter_id:
        return jsonify({'error': 'Unauthorized access'}), 403
        
    #~ get export format
    export_format = request.args.get('format', 'csv')
    if export_format not in ['csv', 'json']:
        return jsonify({'error': 'Unsupported export format'}), 400
        
    #~ get time range params
    days = request.args.get('days', 30, type=int)
    end_date = datetime.now(timezone.utc).date()
    start_date = end_date - timedelta(days=days)
    
    #~ get time series data
    daily_metrics = EventMetricsLog.query.filter(
        EventMetricsLog.event_id == event_id,
        EventMetricsLog.date >= start_date,
        EventMetricsLog.date <= end_date
    ).order_by(EventMetricsLog.date).all()
    
    #~ fill missing dates
    metrics_by_date = {m.date.isoformat(): {'views': m.views, 'saves': m.saves} for m in daily_metrics}
    
    date_range = []
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.isoformat()
        if date_str not in metrics_by_date:
            metrics_by_date[date_str] = {'views': 0, 'saves': 0}
        
        date_range.append({
            'date': date_str,
            'views': metrics_by_date[date_str]['views'],
            'saves': metrics_by_date[date_str]['saves'],
            'engagement': metrics_by_date[date_str]['views'] + (metrics_by_date[date_str]['saves'] * 2)
        })
        current_date += timedelta(days=1)
    
    #~ create export data
    export_data = {
        'event': {
            'id': event.id,
            'title': event.title,
            'location': event.location,
            'event_date': event.event_date.isoformat() if event.event_date else None,
            'total_views': event.views,
            'total_saves': event.saves,
            'engagement': event.engagement,
            'data_source': event.data_source
        },
        'time_series': date_range
    }
    
    if export_format == 'json':
        #~ return JSON
        return jsonify(export_data)
    else:
        #~ return CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        #~ write header row
        writer.writerow(['date', 'views', 'saves', 'engagement'])
        
        #~ write data rows
        for entry in date_range:
            writer.writerow([
                entry['date'],
                entry['views'],
                entry['saves'],
                entry['engagement']
            ])
        
        #~ prep response
        response = Response(
            output.getvalue(),
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename=event_{event_id}_analytics.csv'
            }
        )
        
        return response

@events_bp.route('/export/analytics/promoter', methods=['GET'])
def export_promoter_analytics():
    """Export analytics data for all events by a promoter."""
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    #~ get export format
    export_format = request.args.get('format', 'csv')
    if export_format not in ['csv', 'json']:
        return jsonify({'error': 'Unsupported export format'}), 400
        
    #~ get all events by this promoter
    events = Event.query.filter_by(promoter_id=int(user_id)).all()
    
    if not events:
        return jsonify({'error': 'No events found for this promoter'}), 404
    
    #~ prep export data fr each event
    event_data = []
    for event in events:
        event_data.append({
            'id': event.id,
            'title': event.title,
            'location': event.location,
            'event_date': event.event_date.isoformat() if event.event_date else None,
            'views': event.views or 0,
            'saves': event.saves or 0,
            'engagement': event.engagement or 0,
            'save_rate': round((event.saves or 0) / (event.views or 1) * 100, 2),
            'data_source': event.data_source or 'internal'
        })
    
    if export_format == 'json':
        #~ return JSON
        return jsonify({'events': event_data})
    else:
        #~ return CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        #~ write header row
        writer.writerow(['id', 'title', 'location', 'event_date', 'views', 'saves', 'engagement', 'save_rate', 'data_source'])
        
        #~ write data rows
        for event in event_data:
            writer.writerow([
                event['id'],
                event['title'],
                event['location'],
                event['event_date'],
                event['views'],
                event['saves'],
                event['engagement'],
                event['save_rate'],
                event['data_source']
            ])
        
        #~ prep response
        response = Response(
            output.getvalue(),
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename=promoter_{user_id}_analytics.csv'
            }
        )
        
        return response