from flask import Blueprint, jsonify, request

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    #& placeholder, implement auth logic later
    data = request.get_json()
    #& validate user creds, generate tokens, etc
    return jsonify({'message': 'Login successful', 'user': data})