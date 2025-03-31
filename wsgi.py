import os
from server.app import create_app
from server.config import DevelopmentConfig, ProductionConfig, TestingConfig
config_map = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
}
config_name = os.environ.get('FLASK_CONFIG', 'development').lower()
app = create_app(config_map.get(config_name, DevelopmentConfig))