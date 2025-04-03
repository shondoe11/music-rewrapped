from dotenv import load_dotenv
import os
#& determine env based on 'FLASK_ENV'; default is development
env = os.environ.get('FLASK_ENV', 'development')
load_dotenv(dotenv_path=f".env.{env}")  #~ load appropriate .env file
#* App factory (Flask app config)
from flask import Flask, jsonify
from server.redis_client import redis_client
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
    from server.routes.analytics import analytics_bp
    app.register_blueprint(analytics_bp, url_prefix='/analytics')
    #& simple test route
    @app.route('/')
    def index():
        return 'Hello, Music Re-Wrapped!'
    
    #& health-check endpoint verify db & redis connectivity
    @app.route('/health')
    def health_check():
        #~ check db connectivity
        try:
            from sqlalchemy import text
            db.session.execute(text('SELECT 1'))
        except Exception as e:
            return jsonify({'status': 'error', 'component': 'database', 'error': str(e)}), 500
        #~ check redis connectivity
        try:
            redis_client.ping()
        except Exception as e:
            return jsonify({'status': 'error', 'component': 'redis', 'error': str(e)}), 500

        return jsonify({'status': 'ok'}), 200
        
    return app

app = create_app()

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    socketio.emit('notification', {'message': 'Welcome to Music Re-Wrapped!'})

if __name__ == '__main__':
    app = create_app()
    socketio.run(app, port=5001, debug=True, use_reloader=False)