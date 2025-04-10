#!/usr/bin/env python
import os
import redis
from dotenv import load_dotenv
import logging
import ssl
import json
import time
from functools import wraps
from datetime import timedelta

logging.basicConfig(level=logging.INFO)

#& determine env based on 'FLASK_ENV'; default is development
env = os.environ.get('FLASK_ENV', 'development')
load_dotenv(dotenv_path=f".env.{env}")  #~ load appropriate .env file

#& handle redis SSL cert reqs
redis_url = os.environ.get('REDIS_URL')
#~ redis url must be specified in env vars
ssl_cert_reqs = None

#& check if in CI env
ci_environment = os.environ.get('CI') == 'true'

#& handle CI env Redis URL adjustment
if ci_environment and redis_url and 'localhost' in redis_url:
    #~ replace localhost w redis svc name in CI
    redis_url = redis_url.replace('localhost', 'redis')
    #~ update env
    os.environ['REDIS_URL'] = redis_url
    logging.info("CI environment detected, using Redis service: %s", redis_url)

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
if redis_url:
    try:
        connection_kwargs = {
            'decode_responses': True,
            'socket_timeout': 5,
            'socket_connect_timeout': 5,
            #~ ssl is required for valkey/aiven redis
            'ssl': True
        }
        
        #& only add ssl params if need
        if ssl_cert_reqs is not None:
            connection_kwargs['ssl_cert_reqs'] = ssl_cert_reqs
            
        redis_client = redis.Redis.from_url(
            redis_url,
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
    #~ get redis host frm env / use CI host if CI env detected
    if os.environ.get('CI') == 'true':
        REDIS_HOST = os.environ.get('REDIS_HOST', 'redis')
    else:
        REDIS_HOST = os.environ.get('REDIS_HOST', 'localhost')
    
    REDIS_PORT = os.environ.get('REDIS_PORT', 6379)
    REDIS_DB = os.environ.get('REDIS_DB', 0)
    
    #~ in ci/cd env use service name 'redis' instead of localhost
    redis_client = redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        db=REDIS_DB,
        decode_responses=True  #~ auto decode strings to UTF-8
    )

#& in-memory cache reduce redis commands
_local_cache = {}
_local_cache_expiry = {}

#& utility to get frm local cache first, then redis
def get_cached(key, default=None):
    """Get value from local cache first, then redis if not found"""
    #~ check local cache first
    if key in _local_cache and _local_cache_expiry.get(key, 0) > time.time():
        return _local_cache[key]
    
    #~ if nt in local cache, check redis
    value = redis_client.get(key)
    if value:
        try:
            parsed = json.loads(value)
            #~ cache locally w TTL, but slightly shorter to account fr clock drift
            ttl = redis_client.ttl(key)
            if ttl > 0:
                _local_cache[key] = parsed
                _local_cache_expiry[key] = time.time() + min(ttl, 3600)  #~ max 1 hr local caching
            return parsed
        except:
            return value
    return default

#& utility set in local cache & redis w single op
def set_cached(key, value, ex=None):
    """Set value in both local cache and redis"""
    #~ set in local cache
    serialized = json.dumps(value) if not isinstance(value, str) else value
    
    if ex:
        #~ convert timedelta to seconds if need
        if isinstance(ex, timedelta):
            seconds = ex.total_seconds()
        else:
            seconds = ex
            
        _local_cache[key] = value
        _local_cache_expiry[key] = time.time() + seconds
        redis_client.setex(key, seconds, serialized)
    else:
        _local_cache[key] = value
        _local_cache_expiry[key] = time.time() + 3600  #~ default 1 hr
        redis_client.set(key, serialized)
    
    return True

#& utility batch get operations & reduce commands
def batch_get(keys):
    """Get multiple keys at once, using local cache where possible"""
    if not keys:
        return []
    
    #~ check which keys need frm redis
    redis_keys = []
    result = [None] * len(keys)
    
    for i, key in enumerate(keys):
        if key in _local_cache and _local_cache_expiry.get(key, 0) > time.time():
            result[i] = _local_cache[key]
        else:
            redis_keys.append((i, key))
    
    #~ if have keys to get frm redis, batch them
    if redis_keys:
        idx_map = {key: i for i, (idx, key) in enumerate(redis_keys)}
        r_values = redis_client.mget([k for _, k in redis_keys])
        
        for i, val in enumerate(r_values):
            orig_idx = redis_keys[i][0]
            orig_key = redis_keys[i][1]
            
            if val:
                try:
                    parsed = json.loads(val)
                    result[orig_idx] = parsed
                    ttl = redis_client.ttl(orig_key)
                    if ttl > 0:
                        _local_cache[orig_key] = parsed
                        _local_cache_expiry[orig_key] = time.time() + min(ttl, 3600)
                except:
                    result[orig_idx] = val
    
    return result

#& decorator fr caching function results
def redis_cache(prefix, ttl=3600):
    """Decorator to cache function results in Redis"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            #~ create cache key frm function name & args
            key = f"{prefix}:{func.__name__}:{hash(str(args)+str(sorted(kwargs.items())))}"
            
            #~ try get frm cache 1st
            cached_result = get_cached(key)
            if cached_result is not None:
                return cached_result
            
            #~ if not in cache, call function
            result = func(*args, **kwargs)
            
            #~ cache result
            set_cached(key, result, ex=ttl)
            
            return result
        return wrapper
    return decorator