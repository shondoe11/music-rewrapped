#!/usr/bin/env python
import os
import redis
from dotenv import load_dotenv
import logging
import ssl

logging.basicConfig(level=logging.INFO)

#& determine env based on 'FLASK_ENV'; default is development
env = os.environ.get('FLASK_ENV', 'development')
load_dotenv(dotenv_path=f".env.{env}")  #~ load appropriate .env file

#& handle redis SSL cert reqs
redis_url = os.environ.get('REDIS_URL')
ssl_cert_reqs = None

#& extract ssl param & pass as connection param later
if redis_url and "ssl_cert_reqs=CERT_REQUIRED" in redis_url:
    #~ remove problem param frm URL
    redis_url = redis_url.replace("ssl_cert_reqs=CERT_REQUIRED", "")
    #~ URL cleanup: remove trailing chars
    redis_url = redis_url.replace("&&", "&").rstrip("&?")
    #~ set ssl cert requirement explicitly
    ssl_cert_reqs = ssl.CERT_REQUIRED
    #~ update env
    os.environ['REDIS_URL'] = redis_url

#& if redis url provided (prod), use it; else fallback dev settings
if os.environ.get('REDIS_URL'):
    try:
        connection_kwargs = {
            'decode_responses': True,
            'socket_timeout': 5,
            'socket_connect_timeout': 5
        }
        
        #& only add ssl params if need
        if ssl_cert_reqs is not None:
            connection_kwargs['ssl_cert_reqs'] = ssl_cert_reqs
            
        redis_client = redis.Redis.from_url(
            os.environ.get('REDIS_URL'),
            **connection_kwargs
        )
        redis_client.ping()
        logging.info("Redis connection successful.")
    except redis.ConnectionError as e:
        logging.error("Redis connection failed: %s", e)
        raise
    except Exception as e:
        logging.error("Unexpected error while connecting to Redis: %s", e)
        raise
else:
    REDIS_HOST = os.environ.get('REDIS_HOST', 'localhost')
    REDIS_PORT = os.environ.get('REDIS_PORT', 6379)
    REDIS_DB = os.environ.get('REDIS_DB', 0)
    redis_client = redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        db=REDIS_DB,
        decode_responses=True  #~ auto decode strings to UTF-8
    )