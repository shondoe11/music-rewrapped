import os
from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv
import os

#& determine env based on 'FLASK_DEBUG'
debug = os.environ.get('FLASK_DEBUG', '0') == '1'
env = 'production' if not debug else 'development'
load_dotenv(dotenv_path=f".env.{env}")  #~ load appropriate .env file

from server.app import create_app
from server.config import DevelopmentConfig  #~ current app config class: can change based on env

#* Init Extensions
from .extensions import db
from flask_migrate import Migrate
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_session import Session

migrate = Migrate()
socketio = SocketIO(cors_allowed_origins='*')

def make_celery(app):
    #& celery instance using Flask app config
    celery = Celery(
        app.import_name,
        broker=os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
        backend=os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
    )
    #& broker_connection_retry_on_startup to preserve previous connection retry behavior
    celery.conf.broker_connection_retry_on_startup = True

    celery.conf.update(app.config)
    
    #~ periodic task looping thru all active users every custom interval
    celery.conf.beat_schedule = {
        'sync-all-active-users-every-hour': {
            'task': 'server.tasks.sync_tasks.sync_all_users',
            'schedule': crontab(minute=0)  #~ run top of every hr
        },
        'sync-recently-played-every-15-minutes': {
            'task': 'server.tasks.sync_tasks.fetch_recent_played_all_users',
            'schedule': crontab(minute='*/15')  #~ run every 15 min
        },
        'update-event-statuses-daily': {
            'task': 'server.tasks.sync_tasks.update_event_statuses',
            'schedule': crontab(hour='0', minute='0')  #~ run daily @ midnight
        }
    }

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery

#~ create flask app + celery instance, expose celery @ module lvl
app = create_app()
celery = make_celery(app)

if __name__ == '__main__':
    celery.start()