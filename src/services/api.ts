const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export interface PredictionResult {
  prediction: string;
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  timestamp: string;
  source_ip?: string;
  confidence?: number;
  raw_label?: string;
  src_bytes?: number;
  dst_bytes?: number;
}

export interface LogEntry extends PredictionResult {
  id: number;
}

export async function fetchPrediction(): Promise<PredictionResult> {
  try {
    const res = await fetch(`${API_BASE}/predict`);
    if (res.ok) return res.json();
  } catch {
    // fallback demo data
  }
  return generateDemoPrediction();
}

export async function fetchLogs(): Promise<LogEntry[]> {
  try {
    const res = await fetch(`${API_BASE}/logs`);
    if (res.ok) return res.json();
  } catch {
    // fallback
  }
  return [];
}

// Demo data generator when Flask is not running
const attackTypes = ["Normal", "DoS", "Probe", "R2L", "U2R"];
const riskMap: Record<string, PredictionResult["risk"]> = {
  Normal: "LOW", DoS: "CRITICAL", Probe: "MEDIUM", R2L: "HIGH", U2R: "CRITICAL",
};
const ips = ["192.168.1.44", "45.233.12.102", "10.0.0.12", "172.16.254.1", "88.192.4.15", "203.0.113.50"];

function generateDemoPrediction(): PredictionResult {
  const weights = [40, 25, 20, 10, 5];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  let type = attackTypes[0];
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) { type = attackTypes[i]; break; }
  }
  return {
    prediction: type,
    risk: riskMap[type],
    timestamp: new Date().toISOString(),
    source_ip: ips[Math.floor(Math.random() * ips.length)],
    confidence: Math.floor(Math.random() * 25) + 75,
    src_bytes: Math.floor(Math.random() * 50000),
    dst_bytes: Math.floor(Math.random() * 50000),
  };
}
