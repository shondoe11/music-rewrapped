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
    #& rm domain restriction allow cross-domain cookies
    SESSION_COOKIE_DOMAIN = None
    SESSION_COOKIE_SAMESITE = 'None'

    #& server-side sesh settings
    SESSION_USE_SIGNER = True
    #& if redis url provided (prod), use it; else fallback dev settings
    redis_url = os.environ.get('REDIS_URL')
    if redis_url:
        connection_kwargs = {'decode_responses': True}
        
        #~ handle ssl cert requirements fr redis connection
        if redis_url.startswith('rediss://'):
            import ssl
            
            #~ extract ssl params frm url if present
            if 'ssl_cert_reqs=CERT_NONE' in redis_url:
                #~ remove frm url & set explicitly
                redis_url = redis_url.replace('ssl_cert_reqs=CERT_NONE', '')
                redis_url = redis_url.replace('&&', '&').rstrip('&?')
                connection_kwargs['ssl_cert_reqs'] = ssl.CERT_NONE
            elif 'ssl_cert_reqs=CERT_REQUIRED' in redis_url:
                #~ remove frm url & set explicitly
                redis_url = redis_url.replace('ssl_cert_reqs=CERT_REQUIRED', '')
                redis_url = redis_url.replace('&&', '&').rstrip('&?')
                connection_kwargs['ssl_cert_reqs'] = ssl.CERT_REQUIRED
        
        SESSION_REDIS = redis.Redis.from_url(redis_url, **connection_kwargs)
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
    #& allow cross-domain cookie sharing in prod
    SESSION_COOKIE_DOMAIN = None
    SESSION_COOKIE_SAMESITE = 'None'

class TestingConfig(Config):
    TESTING = True
    #& placeholder connection string 1st
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 'postgresql+psycopg://user:password@localhost/music_rewritten_test'
    )