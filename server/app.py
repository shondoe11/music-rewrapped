from dotenv import load_dotenv
import os
load_dotenv()
#* App factory (Flask app config)
from flask import Flask
from server.config import DevelopmentConfig  #~ current app config class: can change based on environment

#* Init Extensions
from .extensions import db
from flask_migrate import Migrate
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_session import Session

migrate = Migrate()
socketio = SocketIO(cors_allowed_origins='*')

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False
    Session(app)
    
    CORS(app, supports_credentials=True)
    
    #& Init extensions with app context
    db.init_app(app)
    migrate.init_app(app, db)  #~ hook Flask-Migrate to app
    socketio.init_app(app)     #~ hook socketIO to app
    #& model imports here (register with SQLA) important for migration auto-generation
    from .model import User
    #& register blueprints (modular route handling)
    from .routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    from .routes.spotify import spotify_bp
    app.register_blueprint(spotify_bp, url_prefix='/spotify')
    from server.routes.sync import sync_bp
    app.register_blueprint(sync_bp, url_prefix='/sync')
    from .routes.events import events_bp
    app.register_blueprint(events_bp, url_prefix='/events')
    from .routes.home import home_bp
    app.register_blueprint(home_bp, url_prefix='/home')
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
    socketio.run(app, port=5001, debug=True, use_reloader=False)