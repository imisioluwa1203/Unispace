import re

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash, generate_password_hash

from models import db, User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
LEVELS = {"100", "200", "300", "400", "500"}


def error(message, status):
    return jsonify({"error": message}), status


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    level = str(data.get("level") or "").strip()
    department = (data.get("department") or "").strip()

    if not full_name:
        return error("Please enter your full name.", 400)
    if not EMAIL_PATTERN.match(email):
        return error("Please enter a valid email address.", 400)
    if len(password) < 8:
        return error("Password must be at least 8 characters.", 400)
    if level not in LEVELS:
        return error("Please choose your level.", 400)
    if not department:
        return error("Please enter your department.", 400)
    if User.query.filter_by(email=email).first():
        return error("An account with this email already exists.", 409)

    user = User(
        full_name=full_name,
        email=email,
        password_hash=generate_password_hash(password),
        level=level,
        department=department,
    )
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if user is None or not check_password_hash(user.password_hash, password):
        return error("Wrong email or password.", 401)

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()})


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user = db.session.get(User, int(get_jwt_identity()))
    if user is None:
        return error("Account not found.", 404)
    return jsonify({"user": user.to_dict()})


@auth_bp.route("/me", methods=["PATCH"])
@jwt_required()
def update_me():
    user = db.session.get(User, int(get_jwt_identity()))
    if user is None:
        return error("Account not found.", 404)

    data = request.get_json(silent=True) or {}

    if "full_name" in data:
        full_name = (data["full_name"] or "").strip()
        if not full_name:
            return error("Please enter your full name.", 400)
        user.full_name = full_name
    if "level" in data:
        level = str(data["level"] or "").strip()
        if level not in LEVELS:
            return error("Please choose your level.", 400)
        user.level = level
    if "department" in data:
        department = (data["department"] or "").strip()
        if not department:
            return error("Please enter your department.", 400)
        user.department = department

    db.session.commit()
    return jsonify({"user": user.to_dict()})