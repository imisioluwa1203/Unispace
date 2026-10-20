from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])


@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "app": "Campus Hub"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)