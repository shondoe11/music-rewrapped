import os
import redis

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-secret-key')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    #& engine options to ensure healthy connections across forks
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 280
    }

    SESSION_TYPE = 'redis'
    SESSION_PERMANENT = False
    SESSION_COOKIE_DOMAIN = None
    # os.environ.get('SESSION_COOKIE_DOMAIN', '127.0.0.1')

    #& server-side sesh settings
    SESSION_USE_SIGNER = True
    #& if redis url provided (prod), use it; else fallback dev settings
    if os.environ.get('REDIS_URL'):
        SESSION_REDIS = redis.Redis.from_url(os.environ.get('REDIS_URL'))
    else:
        SESSION_REDIS = redis.Redis(
            host=os.environ.get('REDIS_HOST', 'localhost'),
            port=int(os.environ.get('REDIS_PORT', 6379)),
            db=int(os.environ.get('REDIS_DB', 0)),
            password=os.environ.get('REDIS_PASSWORD', None)
        )

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_DOMAIN = os.environ.get("SESSION_COOKIE_DOMAIN", "my-production-domain.com")

class TestingConfig(Config):
    TESTING = True
    #& placeholder connection string 1st
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 'postgresql+psycopg://user:password@localhost/music_rewritten_test'
    )