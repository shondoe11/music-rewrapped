import os
import redis
from dotenv import load_dotenv

#& determine env based on 'FLASK_ENV'; default is development
env = os.environ.get('FLASK_ENV', 'development')
load_dotenv(dotenv_path=f".env.{env}")  #~ load appropriate .env file

#& if redis url provided (prod), use it; else fallback dev settings
if os.environ.get('REDIS_URL'):
    redis_client = redis.Redis.from_url(os.environ.get('REDIS_URL'), decode_responses=True)
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