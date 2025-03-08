import os
from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv
from server.app import create_app

load_dotenv()

def make_celery(app):
    #& celery instance using Flask app config
    celery = Celery(
        app.import_name,
        broker=os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
        backend=os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
    )
    #~ use app config in celery
    celery.conf.update(app.config)
    
    #~ periodic task looping thru all active users every 15 min
    celery.conf.beat_schedule = {
        'sync-all-active-users-every-15-minutes': {
            'task': 'server.tasks.sync_tasks.sync_all_users', #~new task to loop thru users
            'schedule': crontab(minute='*/15')
        }
    }
    
    #~ create task base, wrap tasks in app context
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