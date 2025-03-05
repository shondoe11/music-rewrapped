from dotenv import load_dotenv
import os
load_dotenv()
#* App factory (Flask app config)
from flask import Flask
from server.config import DevelopmentConfig #~ current app config class: can change based on environment

#* Init Extensions
from .extensions import db
from flask_migrate import Migrate
from flask_cors import CORS
from flask_socketio import SocketIO

migrate = Migrate()
socketio = SocketIO(cors_allowed_origins='*')

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)
    CORS(app)
    #& Init extensions with app context
    db.init_app(app) 
    migrate.init_app(app, db) #~ hook Flask-Migrate to app
    socketio.init_app(app) #~ hook socketIO to app
    #& model imports here (register with SQLA) important for migration auto-generation
    from .model import User
    #& register blueprints (modular route handling)
    from .routes.spotify import spotify_bp
    app.register_blueprint(spotify_bp, url_prefix='/spotify')
    from .routes.events import events_bp
    app.register_blueprint(events_bp, url_prefix='/events')
    #& simple test route
    @app.route('/')
    def index():
        return 'Hello, Music Re-Wrapped!'
    
    return app

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    socketio.emit('notification', {'message': 'Welcome to Music Re-Wrapped!'})

if __name__ == '__main__':
    app = create_app()
    app.run(port=5001)