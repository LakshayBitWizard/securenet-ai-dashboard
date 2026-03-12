# SecureNet AI - Flask Backend
# =============================
# This file is NOT run by Lovable. Run it locally alongside this frontend.
#
# Setup:
#   pip install flask flask-cors scikit-learn pandas numpy
#
# Run:
#   python backend/app.py
#
# The frontend will connect to http://localhost:5000

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import random

app = Flask(__name__)
CORS(app)

# In-memory prediction log
prediction_logs = []

# Hardcoded credentials
VALID_USER = "admin"
VALID_PASS = "1234"

# NSL-KDD attack categories
ATTACK_TYPES = ["Normal", "DoS", "Probe", "R2L", "U2R"]
RISK_MAP = {
    "Normal": "LOW",
    "DoS": "CRITICAL",
    "Probe": "MEDIUM",
    "R2L": "HIGH",
    "U2R": "CRITICAL",
}

# ──────────────────────────────────────────────
# To use a real trained model, uncomment below:
#
# import joblib
# model = joblib.load("nsl_kdd_model.pkl")
# label_encoder = joblib.load("label_encoder.pkl")
#
# def real_predict(features):
#     pred_idx = model.predict([features])[0]
#     label = label_encoder.inverse_transform([pred_idx])[0]
#     return label
# ──────────────────────────────────────────────


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "")
    password = data.get("password", "")
    if username == VALID_USER and password == VALID_PASS:
        return jsonify({"success": True, "token": "demo-token-12345"})
    return jsonify({"error": "Invalid credentials"}), 401


@app.route("/predict", methods=["GET"])
def predict():
    # Simulated prediction (replace with real model inference)
    attack_type = random.choices(
        ATTACK_TYPES, weights=[40, 25, 20, 10, 5], k=1
    )[0]
    ips = [
        "192.168.1.44", "45.233.12.102", "10.0.0.12",
        "172.16.254.1", "88.192.4.15", "203.0.113.50",
    ]
    result = {
        "prediction": attack_type,
        "risk": RISK_MAP[attack_type],
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "source_ip": random.choice(ips),
        "confidence": random.randint(60, 99),
    }
    prediction_logs.append(result)
    return jsonify(result)


@app.route("/logs", methods=["GET"])
def logs():
    return jsonify(list(reversed(prediction_logs[-100:])))


if __name__ == "__main__":
    app.run(debug=True, port=5000)
