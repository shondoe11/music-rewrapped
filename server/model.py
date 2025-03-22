from .extensions import db
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import JSONB  #~ using JSONB for JSON storage (if avail)
from werkzeug.security import generate_password_hash, check_password_hash

#* define all models here

#& user data schema: store user auth info and preferences
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    spotify_id = db.Column(db.String(128), unique=True, nullable=False)
    email = db.Column(db.String(128), unique=True, nullable=False)
    display_name = db.Column(db.String(128))
    role = db.Column(db.String(20), default='guest')  #~ values: guest, regular, promoter
    oauth_token = db.Column(db.String(512))
    refresh_token = db.Column(db.String(512))
    expires_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    username = db.Column(db.String(128), unique=True)
    password_hash = db.Column(db.String(256))
    store_listening_history = db.Column(db.Boolean, default=False)
    profile_image_url = db.Column(db.String(512))
    country = db.Column(db.String(64))
    followers = db.Column(db.Integer)
    #& relationships
    listening_histories = db.relationship('ListeningHistory', backref='user', lazy=True)
    aggregated_stats = db.relationship('AggregatedStats', uselist=False, backref='user')
    preferences = db.relationship('UserPreference', uselist=False, backref='user')
    saved_events = db.relationship('SavedEvent', backref='user', lazy=True)

    #& pw checker
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.email}>'

#& user preference schema: store user-specific settings, saved tags
class UserPreference(db.Model):
    __tablename__ = 'user_preference'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)  
    preferences = db.Column(JSONB)  #~ for fav genres, filter settings
    
    def __repr__(self):
        return f'<UserPreference user: {self.user_id}>'
    
#& listening history schema: record play event from Spotify
class ListeningHistory(db.Model):
    __tablename__ = 'listening_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    track_id = db.Column(db.String(128))
    track_name = db.Column(db.String(256))
    artist = db.Column(db.String(256))   
    artwork_url = db.Column(db.String(512)) 
    duration = db.Column(db.Integer)
    genre = db.Column(db.String(128))
    played_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    #todo add more fields for artist, duration, etc later
    
    def __repr__(self):
        return f'<ListeningHistory user:{self.user_id} track:{self.track_id}>'

#& aggregated stats schema: to store processed metrics etc top tracks/artists, genre distribution...
class AggregatedStats(db.Model):
    __tablename__ = 'aggregated_stats'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    top_tracks = db.Column(JSONB)
    top_artists = db.Column(JSONB)
    genre_distribution = db.Column(JSONB)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    def __repr__(self):
        return f'<AggregatedStats user:{self.user_id}>'
    
#& concert event schema: store details of events & concerts
class Event(db.Model):
    __tablename__ = 'event'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(256), nullable=False)
    location = db.Column(db.String(256))
    event_date = db.Column(db.DateTime)
    promoter_info = db.Column(db.String(256))
    details = db.Column(db.String(1024))
    tags = db.Column(JSONB)  #~ tags arr, store as JSON
    user_id = db.Column(db.Integer, nullable=True)  #~ saved events to user (if duplicated, not used in join approach)
    promoter_id = db.Column(db.Integer, nullable=True)
    url = db.Column(db.String(512))  #~ store event url
    image = db.Column(db.String(512))  #~ store img url
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    status = db.Column(db.String(64), default='Pre-Event')
    is_sponsored = db.Column(db.Boolean, default=False)
    target_country = db.Column(db.String(64))
    target_genre_interest = db.Column(db.String(256))  #~ comma-separated list
    target_artist_interest = db.Column(db.String(256))  #~ comma-separated list
    listening_threshold = db.Column(db.Integer)
    target_roles = db.Column(JSONB)  #~ store roles in arr
    views = db.Column(db.Integer, default=0)
    saves = db.Column(db.Integer, default=0)
    engagement = db.Column(db.Integer, default=0)
    
    def __repr__(self):
        return f'<Event {self.title} on {self.event_date}>'
    
#& saved event schema: store which events a user has saved.
class SavedEvent(db.Model):
    __tablename__ = 'saved_event'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    def __repr__(self):
        return f'<SavedEvent user:{self.user_id} event:{self.event_id}>'

#& time-stamped analytics data for Events
class EventMetricsLog(db.Model):
    __tablename__ = 'event_metrics_log'
    
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id', ondelete='CASCADE'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    views = db.Column(db.Integer, default=0)
    saves = db.Column(db.Integer, default=0)
    #~ Add index for faster queries
    __table_args__ = (
        db.Index('idx_event_date', 'event_id', 'date'),
    )

#& API integration schema: logs API calls to external APIs
class APIIntegrationLog(db.Model):
    __tablename__ = 'api_integration_log'
    
    id = db.Column(db.Integer, primary_key=True)
    api_name = db.Column(db.String(128))
    request_details = db.Column(JSONB)
    response_details = db.Column(JSONB)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    def __repr__(self):
        return f'<APIIntegrationLog {self.api_name} at {self.timestamp}>'