# CI/CD helper script fr database migrations

#~ override redis connection fr CI env
export REDIS_URL="redis://redis:6379/0"
export CI=true

flask db upgrade