import secrets

#& generate secure secret key fr production; 32 bytes give 64-character hex string
secret_key = secrets.token_hex(32)
print(f"my production SECRET_KEY: {secret_key}")

#& generate secure JWT secret; can adjust size as needed, here using token_urlsafe will create url-safe string
jwt_secret = secrets.token_urlsafe(48)
print(f"my production JWT_SECRET: {jwt_secret}")