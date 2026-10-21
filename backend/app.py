import os
from datetime import timedelta

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from auth import auth_bp
from models import db, User

load_dotenv()

APP_NAME = "Unispace"
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL") or (
    "sqlite:///" + os.path.join(BASE_DIR, "unispace.db")
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.environ["JWT_SECRET_KEY"]
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)

db.init_app(app)
JWTManager(app)
app.register_blueprint(auth_bp)

with app.app_context():
    db.create_all()


@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "app": APP_NAME, "users": User.query.count()})


if __name__ == "__main__":
    app.run(debug=True, port=5000)