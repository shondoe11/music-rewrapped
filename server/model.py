from .extensions import db
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import JSONB  #~ using JSONB for JSON storage (if avail)
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
    
    #& relationships
    listening_histories = db.relationship('ListeningHistory', backref='user', lazy=True)
    aggregated_stats = db.relationship('AggregatedStats', uselist=False, backref='user')
    preferences = db.relationship('UserPreference', uselist=False, backref='user')

    def __repr__(self):
        return f'<User {self.email}>'  #~ self: instance of the class being used, current object instance: https://www.geeksforgeeks.org/self-in-python-class/
    
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
class ConcertEvent(db.Model):
    __tablename__ = 'concert_event'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(256), nullable=False)
    location = db.Column(db.String(256))
    event_date = db.Column(db.DateTime)
    promoter_info = db.Column(db.String(256))
    tags = db.Column(JSONB)  #~ expected array of tags, store as JSON
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    def __repr__(self):
        return f'<ConcertEvent {self.title} on {self.event_date}>'

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