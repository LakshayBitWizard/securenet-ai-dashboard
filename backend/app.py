# SecureNet AI - Flask Backend with ResNet + NSL-KDD + Scapy live capture
# =========================================================================
# Run locally:
#   pip install flask flask-cors torch numpy pandas scikit-learn scapy
#   sudo python backend/app.py     # sudo required for live packet capture
#
# Endpoints:
#   POST /login           — auth (admin / 1234)
#   GET  /predict         — single prediction (dataset or live flow)
#   GET  /logs            — full rolling log (persistent across requests)
#   GET  /stats           — aggregate stats: protocols, timeline, anomalies, origins
#   GET  /notifications   — recent HIGH/CRITICAL alerts since ?since=<iso>
#   GET  /settings        — current settings
#   POST /settings        — update settings (mode: dataset|scapy, refresh, threshold)
#
# Capture runs in a background thread the moment the app starts and keeps
# accumulating predictions independently of any frontend tab activity.

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from collections import Counter, deque
import threading
import time
import random
import os
import csv
import numpy as np

app = Flask(__name__)
CORS(app)

# ─── NSL-KDD constants ─────────────────────────────────
KDD_COLUMN_NAMES = [
    "duration", "protocol_type", "service", "flag",
    "src_bytes", "dst_bytes", "land", "wrong_fragment", "urgent",
    "hot", "num_failed_logins", "logged_in", "num_compromised",
    "root_shell", "su_attempted", "num_root", "num_file_creations",
    "num_shells", "num_access_files", "num_outbound_cmds",
    "is_host_login", "is_guest_login",
    "count", "srv_count", "serror_rate", "srv_serror_rate",
    "rerror_rate", "srv_rerror_rate", "same_srv_rate",
    "diff_srv_rate", "srv_diff_host_rate",
    "dst_host_count", "dst_host_srv_count",
    "dst_host_same_srv_rate", "dst_host_diff_srv_rate",
    "dst_host_same_src_port_rate", "dst_host_srv_diff_host_rate",
    "dst_host_serror_rate", "dst_host_srv_serror_rate",
    "dst_host_rerror_rate", "dst_host_srv_rerror_rate",
    "label", "difficulty",
]

ATTACK_CATEGORY = {
    "normal": "Normal",
    "back": "DoS", "land": "DoS", "neptune": "DoS", "pod": "DoS",
    "smurf": "DoS", "teardrop": "DoS", "mailbomb": "DoS",
    "apache2": "DoS", "processtable": "DoS", "udpstorm": "DoS",
    "ipsweep": "Probe", "nmap": "Probe", "portsweep": "Probe",
    "satan": "Probe", "mscan": "Probe", "saint": "Probe",
    "ftp_write": "R2L", "guess_passwd": "R2L", "imap": "R2L",
    "multihop": "R2L", "phf": "R2L", "spy": "R2L",
    "warezclient": "R2L", "warezmaster": "R2L", "sendmail": "R2L",
    "named": "R2L", "snmpgetattack": "R2L", "snmpguess": "R2L",
    "xlock": "R2L", "xsnoop": "R2L", "worm": "R2L",
    "buffer_overflow": "U2R", "loadmodule": "U2R", "perl": "U2R",
    "rootkit": "U2R", "httptunnel": "U2R", "ps": "U2R",
    "sqlattack": "U2R", "xterm": "U2R",
}

RISK_MAP = {
    "Normal": "LOW", "DoS": "CRITICAL", "Probe": "MEDIUM",
    "R2L": "HIGH", "U2R": "CRITICAL",
    # Application-level threats
    "SQL Injection": "HIGH", "XSS": "HIGH", "Brute Force": "HIGH",
    "Malware Callback": "CRITICAL", "Port Scan": "MEDIUM",
}

# Default status assigned per risk (used by frontend filters)
STATUS_MAP = {
    "CRITICAL": "Blocked", "HIGH": "Mitigated",
    "MEDIUM": "Quarantined", "LOW": "Passed",
}

# Regex patterns to flag application-layer attacks from packet payloads or log lines
import re
APP_THREAT_PATTERNS = [
    ("SQL Injection", re.compile(r"(union\s+select|or\s+1=1|';--|drop\s+table|information_schema)", re.I)),
    ("XSS",           re.compile(r"(<script\b|onerror\s*=|javascript:|<iframe\b)", re.I)),
    ("Brute Force",   re.compile(r"(failed\s+login|authentication\s+failure|invalid\s+password){2,}|(login.*){5,}", re.I)),
    ("Malware Callback", re.compile(r"(\.onion|cmd\.exe|powershell\s+-enc|/c2/|beacon)", re.I)),
    ("Port Scan",     re.compile(r"(nmap|masscan|zmap)", re.I)),
]


def detect_app_threat(text: str):
    if not text:
        return None
    for name, pat in APP_THREAT_PATTERNS:
        if pat.search(text):
            return name
    return None

PROTOCOL_TYPES = ["tcp", "udp", "icmp"]
SERVICES = [
    "aol", "auth", "bgp", "courier", "csnet_ns", "ctf", "daytime",
    "discard", "domain", "domain_u", "echo", "eco_i", "ecr_i", "efs",
    "exec", "finger", "ftp", "ftp_data", "gopher", "harvest",
    "hostnames", "http", "http_2784", "http_443", "http_8001", "imap4",
    "IRC", "iso_tsap", "klogin", "kshell", "ldap", "link", "login",
    "mtp", "name", "netbios_dgm", "netbios_ns", "netbios_ssn",
    "netstat", "nnsp", "nntp", "ntp_u", "other", "pm_dump", "pop_2",
    "pop_3", "printer", "private", "red_i", "remote_job", "rje",
    "shell", "smtp", "sql_net", "ssh", "sunrpc", "supdup", "systat",
    "telnet", "tftp_u", "tim_i", "time", "urh_i", "urp_i", "uucp",
    "uucp_path", "vmnet", "whois", "X11", "Z39_50",
]
FLAGS = ["OTH", "REJ", "RSTO", "RSTOS0", "RSTR", "S0", "S1", "S2", "S3", "SF", "SH"]

# Common service port → KDD service name
PORT_SERVICE = {
    80: "http", 443: "http_443", 21: "ftp", 20: "ftp_data", 22: "ssh",
    23: "telnet", 25: "smtp", 53: "domain", 110: "pop_3", 143: "imap4",
    194: "IRC", 113: "auth", 70: "gopher", 79: "finger",
}

IPS = [
    "192.168.1.44", "45.233.12.102", "10.0.0.12",
    "172.16.254.1", "88.192.4.15", "203.0.113.50",
    "74.125.224.72", "31.13.65.36", "198.51.100.14",
]

# Rough geo origin guess by IP prefix (demo only)
def ip_origin(ip: str) -> str:
    if ip.startswith("192.168.") or ip.startswith("10.") or ip.startswith("172."):
        return "Internal"
    first = int(ip.split(".")[0]) if ip and ip[0].isdigit() else 0
    if first in (74, 198, 199, 208):
        return "North America"
    if first in (31, 88, 89, 90, 91):
        return "Europe"
    if first in (45, 103, 203, 218):
        return "East Asia"
    if first in (41, 196, 197):
        return "Africa"
    return "Other"


# Load dataset
dataset_rows = []
data_path = os.path.join(os.path.dirname(__file__), "data", "KDDTest.txt")
if os.path.exists(data_path):
    with open(data_path, "r") as f:
        for row in csv.reader(f):
            if len(row) >= 42:
                dataset_rows.append(row)
    print(f"[SecureNet] Loaded {len(dataset_rows)} rows from KDDTest.txt")
else:
    print(f"[SecureNet] WARNING: {data_path} not found.")


# ─── ResNet model ──────────────────────────────────────
resnet_model = None
label_to_idx = {"Normal": 0, "DoS": 1, "Probe": 2, "R2L": 3, "U2R": 4}
idx_to_label = {v: k for k, v in label_to_idx.items()}
torch = None  # filled if import succeeds

try:
    import torch  # noqa: F401
    import torch.nn as nn

    class ResidualBlock(nn.Module):
        def __init__(self, dim):
            super().__init__()
            self.fc1 = nn.Linear(dim, dim)
            self.bn1 = nn.BatchNorm1d(dim)
            self.fc2 = nn.Linear(dim, dim)
            self.bn2 = nn.BatchNorm1d(dim)
            self.relu = nn.ReLU()

        def forward(self, x):
            identity = x
            out = self.relu(self.bn1(self.fc1(x)))
            out = self.bn2(self.fc2(out))
            out += identity
            return self.relu(out)

    class ResNetClassifier(nn.Module):
        def __init__(self, input_dim=122, hidden_dim=128, num_classes=5, num_blocks=3):
            super().__init__()
            self.input_layer = nn.Sequential(
                nn.Linear(input_dim, hidden_dim),
                nn.BatchNorm1d(hidden_dim),
                nn.ReLU(),
            )
            self.res_blocks = nn.Sequential(
                *[ResidualBlock(hidden_dim) for _ in range(num_blocks)]
            )
            self.classifier = nn.Sequential(
                nn.Linear(hidden_dim, 64),
                nn.ReLU(),
                nn.Dropout(0.3),
                nn.Linear(64, num_classes),
            )

        def forward(self, x):
            x = self.input_layer(x)
            x = self.res_blocks(x)
            return self.classifier(x)

    model_path = os.path.join(os.path.dirname(__file__), "resnet_nslkdd.pth")
    if os.path.exists(model_path):
        resnet_model = ResNetClassifier()
        resnet_model.load_state_dict(torch.load(model_path, map_location="cpu"))
        resnet_model.eval()
        print("[SecureNet] ResNet model loaded")
    else:
        print("[SecureNet] No pre-trained model — using ground-truth labels")

except ImportError:
    print("[SecureNet] PyTorch not installed — using ground-truth labels")


def encode_row(row):
    """KDD row → 122-dim numeric vector."""
    numeric_indices = [0] + list(range(4, 41))
    features = []
    for i in numeric_indices:
        try:
            features.append(float(row[i]))
        except (ValueError, IndexError):
            features.append(0.0)
    proto = row[1] if len(row) > 1 else ""
    for p in PROTOCOL_TYPES:
        features.append(1.0 if proto == p else 0.0)
    svc = row[2] if len(row) > 2 else ""
    for s in SERVICES:
        features.append(1.0 if svc == s else 0.0)
    flg = row[3] if len(row) > 3 else ""
    for f in FLAGS:
        features.append(1.0 if flg == f else 0.0)
    return features


def heuristic_classify(row):
    """Heuristic classifier for live Scapy flows (no ground-truth label).
    Maps flow features to one of the 5 NSL-KDD categories."""
    try:
        proto = row[1]
        svc = row[2]
        flag = row[3]
        src_b = float(row[4])
        dst_b = float(row[5])
        dport = 0
        # dport hint stored on row via flow; not in standard KDD col, so infer from service
        # ICMP flood / huge unidirectional → DoS
        if proto == "icmp" and src_b > 5000:
            return "DoS"
        if flag in ("S0", "REJ") and src_b > 0 and dst_b == 0:
            # half-open / rejected connections → Probe (port scan)
            return "Probe"
        if svc in ("private", "other") and src_b > 0 and dst_b == 0:
            return "Probe"
        if svc in ("ftp", "ftp_data", "telnet", "ssh", "smtp", "pop_3", "imap4") and src_b > 100:
            # auth-service traffic with payload → R2L attempt
            return "R2L"
        if svc in ("shell", "kshell", "exec", "rje") or (svc == "telnet" and src_b > 5000):
            return "U2R"
        if src_b + dst_b > 200000:
            return "DoS"
        return "Normal"
    except Exception:
        return "Normal"


def predict_row(row, live=False):
    raw_label = row[41].strip().lower() if len(row) > 41 else "normal"
    gt = ATTACK_CATEGORY.get(raw_label, "Normal")
    if resnet_model is not None and torch is not None:
        try:
            tensor = torch.FloatTensor([encode_row(row)])
            with torch.no_grad():
                idx = torch.argmax(resnet_model(tensor), dim=1).item()
            return idx_to_label.get(idx, "Normal")
        except Exception as e:
            print(f"[SecureNet] inference error: {e}")
    if live:
        return heuristic_classify(row)
    return gt


# ─── Persistent state (thread-safe) ────────────────────
state_lock = threading.Lock()
prediction_logs = deque(maxlen=2000)   # rolling log
notifications = deque(maxlen=200)      # HIGH/CRITICAL alerts
_log_id = [0]

settings = {
    "mode": "dataset",          # "dataset" | "scapy"
    "refresh_interval": 5,      # seconds (frontend hint)
    "alert_threshold": "HIGH",  # LOW | MEDIUM | HIGH | CRITICAL
    "username": "admin",
    "password": "1234",
}

RISK_LEVEL = {"LOW": 0, "MEDIUM": 1, "HIGH": 2, "CRITICAL": 3}


def append_prediction(result):
    with state_lock:
        _log_id[0] += 1
        result["id"] = _log_id[0]
        prediction_logs.append(result)
        if RISK_LEVEL.get(result["risk"], 0) >= RISK_LEVEL.get(settings["alert_threshold"], 2):
            notifications.append({
                "id": result["id"],
                "timestamp": result["timestamp"],
                "source_ip": result.get("source_ip"),
                "prediction": result["prediction"],
                "risk": result["risk"],
                "message": f"{result['risk']} {result['prediction']} from {result.get('source_ip','?')}",
            })


def make_prediction_from_dataset():
    if not dataset_rows:
        return None
    row = random.choice(dataset_rows)
    attack = predict_row(row)
    proto = row[1] if len(row) > 1 else "tcp"
    svc = row[2] if len(row) > 2 else "other"
    flag = row[3] if len(row) > 3 else "SF"
    src_bytes = int(float(row[4])) if len(row) > 4 else 0
    dst_bytes = int(float(row[5])) if len(row) > 5 else 0
    raw_label = row[41].strip() if len(row) > 41 else "unknown"
    return {
        "prediction": attack,
        "risk": RISK_MAP.get(attack, "MEDIUM"),
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "source_ip": random.choice(IPS),
        "confidence": random.randint(85, 99) if attack == "Normal" else random.randint(75, 99),
        "raw_label": raw_label,
        "src_bytes": src_bytes,
        "dst_bytes": dst_bytes,
        "protocol": proto,
        "service": svc,
        "flag": flag,
        "origin": None,
        "source": "dataset",
        "status": STATUS_MAP.get(RISK_MAP.get(attack, "MEDIUM"), "Under Review"),
        "destination_ip": random.choice(IPS),
    }


# ─── Scapy live capture ────────────────────────────────
# Aggregates packets into short flows (2s window, by 5-tuple), encodes them
# into the same 122-dim vector and pushes predictions.
scapy_available = False
try:
    from scapy.all import sniff, IP, TCP, UDP, ICMP, Raw  # noqa
    scapy_available = True
except Exception as e:
    print(f"[SecureNet] Scapy unavailable ({e}). Live capture disabled.")

flow_buffer = {}
flow_lock = threading.Lock()
FLOW_WINDOW = 2.0  # seconds


def _flow_key(pkt):
    if IP not in pkt:
        return None
    ip = pkt[IP]
    proto = "tcp" if TCP in pkt else "udp" if UDP in pkt else "icmp" if ICMP in pkt else "other"
    sport = pkt[TCP].sport if TCP in pkt else pkt[UDP].sport if UDP in pkt else 0
    dport = pkt[TCP].dport if TCP in pkt else pkt[UDP].dport if UDP in pkt else 0
    return (ip.src, ip.dst, sport, dport, proto)


def _packet_handler(pkt):
    if IP not in pkt:
        return
    key = _flow_key(pkt)
    if key is None:
        return
    now = time.time()
    size = len(pkt)
    with flow_lock:
        f = flow_buffer.get(key)
        if f is None:
            f = {"start": now, "src_bytes": 0, "dst_bytes": 0, "count": 0,
                 "src": key[0], "dst": key[1], "sport": key[2], "dport": key[3],
                 "proto": key[4], "flag": "SF"}
            flow_buffer[key] = f
        # crude direction: assume flow's first src is "src"
        if pkt[IP].src == f["src"]:
            f["src_bytes"] += size
        else:
            f["dst_bytes"] += size
        f["count"] += 1
        if TCP in pkt:
            tflags = pkt[TCP].flags
            if tflags & 0x04: f["flag"] = "REJ"
            elif tflags & 0x01: f["flag"] = "SF"
            elif tflags & 0x02: f["flag"] = "S0"


def _flow_to_kdd_row(f, duration):
    """Build a 42-col KDD row from an aggregated flow."""
    proto = f["proto"] if f["proto"] in PROTOCOL_TYPES else "tcp"
    svc = PORT_SERVICE.get(f["dport"], "other")
    flag = f["flag"] if f["flag"] in FLAGS else "SF"
    row = [str(int(duration)), proto, svc, flag,
           str(f["src_bytes"]), str(f["dst_bytes"])]
    # pad numeric features (land..dst_host_srv_rerror_rate) with zeros
    row += ["0"] * (41 - len(row))
    row.append("normal")  # placeholder label
    row.append("20")
    return row


def _flow_flusher():
    """Background loop: every FLOW_WINDOW, flush flows → predictions."""
    while True:
        time.sleep(FLOW_WINDOW)
        if settings["mode"] != "scapy":
            with flow_lock:
                flow_buffer.clear()
            continue
        now = time.time()
        ready = []
        with flow_lock:
            for k, f in list(flow_buffer.items()):
                if now - f["start"] >= FLOW_WINDOW:
                    ready.append((k, f))
                    del flow_buffer[k]
        for _, f in ready:
            duration = max(0, now - f["start"])
            row = _flow_to_kdd_row(f, duration)
            attack = predict_row(row, live=True)
            result = {
                "prediction": attack,
                "risk": RISK_MAP.get(attack, "MEDIUM"),
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "source_ip": f["src"],
                "destination_ip": f["dst"],
                "confidence": random.randint(70, 99),
                "raw_label": "live",
                "src_bytes": f["src_bytes"],
                "dst_bytes": f["dst_bytes"],
                "protocol": f["proto"],
                "service": PORT_SERVICE.get(f["dport"], "other"),
                "flag": f["flag"],
                "dst_port": f["dport"],
                "origin": ip_origin(f["src"]),
                "source": "scapy",
            }
            append_prediction(result)


def _scapy_thread():
    print("[SecureNet] Scapy capture thread started")
    while True:
        if settings["mode"] == "scapy" and scapy_available:
            try:
                sniff(prn=_packet_handler, store=False, timeout=5)
            except Exception as e:
                print(f"[SecureNet] sniff error: {e}")
                time.sleep(2)
        else:
            time.sleep(1)


# ─── Background prediction generator (dataset mode) ────
def _dataset_generator():
    """Continuously generate predictions when in dataset mode so the
    dashboard sees live activity even if no client polls /predict."""
    print("[SecureNet] Dataset generator thread started")
    while True:
        if settings["mode"] == "dataset":
            pred = make_prediction_from_dataset()
            if pred:
                append_prediction(pred)
        time.sleep(2)


# Start background threads (daemon so they die with the process)
threading.Thread(target=_dataset_generator, daemon=True).start()
threading.Thread(target=_flow_flusher, daemon=True).start()
if scapy_available:
    threading.Thread(target=_scapy_thread, daemon=True).start()


# ─── Endpoints ─────────────────────────────────────────
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    if data.get("username") == settings["username"] and data.get("password") == settings["password"]:
        return jsonify({"success": True, "token": "demo-token-12345"})
    return jsonify({"error": "Invalid credentials"}), 401


@app.route("/predict", methods=["GET"])
def predict():
    """Returns the most recent prediction (kept for backwards compat).
    Predictions are continuously generated server-side."""
    with state_lock:
        if prediction_logs:
            return jsonify(prediction_logs[-1])
    pred = make_prediction_from_dataset()
    if pred:
        append_prediction(pred)
        return jsonify(pred)
    return jsonify({"error": "no data"}), 503


@app.route("/logs", methods=["GET"])
def logs():
    since_id = int(request.args.get("since_id", 0))
    limit = int(request.args.get("limit", 100))
    with state_lock:
        items = [l for l in prediction_logs if l["id"] > since_id]
    items = items[-limit:]
    return jsonify({"logs": list(reversed(items)), "last_id": _log_id[0]})


@app.route("/notifications", methods=["GET"])
def get_notifications():
    since_id = int(request.args.get("since_id", 0))
    with state_lock:
        items = [n for n in notifications if n["id"] > since_id]
    return jsonify({"notifications": items, "last_id": _log_id[0]})


@app.route("/stats", methods=["GET"])
def stats():
    with state_lock:
        items = list(prediction_logs)
    proto_counts = Counter()
    attack_counts = Counter()
    origin_counts = Counter()
    anomalies = []
    timeline_buckets = {}  # minute → bytes total
    for l in items:
        proto = (l.get("protocol") or "other").upper()
        if proto not in ("TCP", "UDP", "ICMP", "DNS"):
            # treat domain service as DNS
            if l.get("service") in ("domain", "domain_u"):
                proto = "DNS"
            else:
                proto = "Other"
        proto_counts[proto] += 1
        attack_counts[l["prediction"]] += 1
        origin_counts[l.get("origin") or ip_origin(l.get("source_ip", ""))] += 1
        # anomaly: UDP on port 443, or HIGH/CRITICAL risk
        if l.get("protocol") == "udp" and l.get("dst_port") == 443:
            anomalies.append({"id": l["id"], "type": "UDP on port 443",
                              "source_ip": l.get("source_ip"),
                              "timestamp": l["timestamp"]})
        # bucket by minute
        ts = l["timestamp"][:16]  # YYYY-MM-DDTHH:MM
        bytes_total = (l.get("src_bytes") or 0) + (l.get("dst_bytes") or 0)
        timeline_buckets[ts] = timeline_buckets.get(ts, 0) + bytes_total

    timeline = [{"time": k[-5:], "value": v} for k, v in sorted(timeline_buckets.items())[-24:]]
    total_proto = sum(proto_counts.values()) or 1
    protocols = [{"name": n, "pct": round(c * 100 / total_proto, 1), "count": c}
                 for n, c in proto_counts.most_common()]
    return jsonify({
        "total_predictions": len(items),
        "protocols": protocols,
        "attacks": dict(attack_counts),
        "origins": dict(origin_counts),
        "anomalies": anomalies[-10:],
        "timeline": timeline,
        "mode": settings["mode"],
        "scapy_available": scapy_available,
    })


@app.route("/settings", methods=["GET", "POST"])
def settings_endpoint():
    global settings
    if request.method == "POST":
        data = request.get_json() or {}
        for k in ("mode", "alert_threshold", "username", "password"):
            if k in data and isinstance(data[k], str):
                settings[k] = data[k]
        if "refresh_interval" in data:
            try:
                settings["refresh_interval"] = max(1, int(data["refresh_interval"]))
            except (TypeError, ValueError):
                pass
        if settings["mode"] == "scapy" and not scapy_available:
            return jsonify({"error": "Scapy not available on server", "settings": _public_settings()}), 400
    return jsonify(_public_settings())


def _public_settings():
    return {
        "mode": settings["mode"],
        "refresh_interval": settings["refresh_interval"],
        "alert_threshold": settings["alert_threshold"],
        "username": settings["username"],
        "scapy_available": scapy_available,
    }


if __name__ == "__main__":
    app.run(debug=False, port=5000, threaded=True)
