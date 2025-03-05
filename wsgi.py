import os
from server.app import create_app

app = create_app(os.environ.get('FLASK_CONFIG', 'DevelopmentConfig'))