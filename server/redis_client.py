import os
import redis
from dotenv import load_dotenv
load_dotenv()

#* read connection info from env (set defaults to local first - testing)
REDIS_HOST = os.environ.get('REDIS_HOST', 'localhost')
REDIS_PORT = os.environ.get('REDIS_PORT', 6379)
REDIS_DB = os.environ.get('redis_db', 0)

redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=REDIS_DB,
    decode_responses=True #~ auto decode strings to UTF-8
)