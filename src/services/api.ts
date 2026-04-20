const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export interface PredictionResult {
  id?: number;
  prediction: string;
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  timestamp: string;
  source_ip?: string;
  destination_ip?: string;
  confidence?: number;
  raw_label?: string;
  src_bytes?: number;
  dst_bytes?: number;
  protocol?: string;
  service?: string;
  flag?: string;
  dst_port?: number;
  origin?: string;
  source?: string;
}

export interface NotificationItem {
  id: number;
  timestamp: string;
  source_ip?: string;
  prediction: string;
  risk: string;
  message: string;
}

export interface StatsResponse {
  total_predictions: number;
  protocols: { name: string; pct: number; count: number }[];
  attacks: Record<string, number>;
  origins: Record<string, number>;
  anomalies: { id: number; type: string; source_ip?: string; timestamp: string }[];
  timeline: { time: string; value: number }[];
  mode: "dataset" | "scapy";
  scapy_available: boolean;
}

export interface AppSettings {
  mode: "dataset" | "scapy";
  refresh_interval: number;
  alert_threshold: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  username: string;
  scapy_available: boolean;
}

export async function fetchPrediction(): Promise<PredictionResult> {
  try {
    const res = await fetch(`${API_BASE}/predict`);
    if (res.ok) return res.json();
  } catch { /* ignore */ }
  return generateDemoPrediction();
}

export async function fetchLogs(sinceId = 0, limit = 100): Promise<{ logs: PredictionResult[]; last_id: number }> {
  try {
    const res = await fetch(`${API_BASE}/logs?since_id=${sinceId}&limit=${limit}`);
    if (res.ok) return res.json();
  } catch { /* ignore */ }
  // Fallback: synthesize one prediction
  const demo = generateDemoPrediction();
  demo.id = sinceId + 1;
  return { logs: [demo], last_id: demo.id! };
}

export async function fetchNotifications(sinceId = 0): Promise<{ notifications: NotificationItem[]; last_id: number }> {
  try {
    const res = await fetch(`${API_BASE}/notifications?since_id=${sinceId}`);
    if (res.ok) return res.json();
  } catch { /* ignore */ }
  return { notifications: [], last_id: sinceId };
}

export async function fetchStats(): Promise<StatsResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (res.ok) return res.json();
  } catch { /* ignore */ }
  return null;
}

export async function fetchSettings(): Promise<AppSettings | null> {
  try {
    const res = await fetch(`${API_BASE}/settings`);
    if (res.ok) return res.json();
  } catch { /* ignore */ }
  return null;
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<AppSettings | null> {
  try {
    const res = await fetch(`${API_BASE}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) return res.json();
  } catch { /* ignore */ }
  return null;
}

// ─── Demo fallback (backend offline) ─────────────────
const attackTypes = ["Normal", "DoS", "Probe", "R2L", "U2R"];
const riskMap: Record<string, PredictionResult["risk"]> = {
  Normal: "LOW", DoS: "CRITICAL", Probe: "MEDIUM", R2L: "HIGH", U2R: "CRITICAL",
};
const ips = ["192.168.1.44", "45.233.12.102", "10.0.0.12", "172.16.254.1", "88.192.4.15", "203.0.113.50"];
const protos = ["tcp", "udp", "icmp"];

let _demoCursor = 0;
function generateDemoPrediction(): PredictionResult {
  // Rotate deterministically through all 5 categories so every one appears,
  // then add some randomness so it doesn't feel scripted.
  const rotation = ["Normal", "Normal", "DoS", "Probe", "Normal", "R2L", "Normal", "DoS", "U2R", "Probe"];
  const type = Math.random() < 0.7
    ? rotation[_demoCursor++ % rotation.length]
    : attackTypes[Math.floor(Math.random() * attackTypes.length)];
  return {
    prediction: type,
    risk: riskMap[type],
    timestamp: new Date().toISOString(),
    source_ip: ips[Math.floor(Math.random() * ips.length)],
    confidence: Math.floor(Math.random() * 25) + 75,
    src_bytes: Math.floor(Math.random() * 50000),
    dst_bytes: Math.floor(Math.random() * 50000),
    protocol: protos[Math.floor(Math.random() * protos.length)],
    service: "http",
    flag: "SF",
  };
}
