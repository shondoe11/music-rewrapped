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

#& convert 'CERT_REQUIRED' in REDIS_URL query param to numeric value
redis_url = os.environ.get('REDIS_URL')
if redis_url and "ssl_cert_reqs=CERT_REQUIRED" in redis_url:
    redis_url = redis_url.replace("CERT_REQUIRED", str(ssl.CERT_REQUIRED))
    #~ overwrite env value w converted URL
    os.environ['REDIS_URL'] = redis_url

#& if redis url provided (prod), use it; else fallback dev settings
if os.environ.get('REDIS_URL'):
    try:
        redis_client = redis.Redis.from_url(
            os.environ.get('REDIS_URL'),
            decode_responses=True,
            socket_timeout=5,
            socket_connect_timeout=5
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