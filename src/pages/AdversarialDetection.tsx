import Header from "@/components/Header";
import { ExternalLink } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";

const barData = [
  { bin: "A", val: 40 }, { bin: "B", val: 55 }, { bin: "C", val: 65 },
  { bin: "D", val: 70 }, { bin: "E", val: 90 }, { bin: "F", val: 60 },
];

const connData = [
  { t: "0", v1: 40, v2: 50 }, { t: "1", v1: 55, v2: 45 }, { t: "2", v1: 70, v2: 60 },
  { t: "3", v1: 50, v2: 65 }, { t: "4", v1: 60, v2: 55 },
];

const feed = [
  { time: "04:12:44 GMT", ip: "192.168.4.12", anomaly: "Jumbo Packet Overflow", conf: "99.2%", confColor: "text-destructive", status: "FLAGGED", statusClass: "badge-critical" },
  { time: "04:11:30 GMT", ip: "45.22.128.9", anomaly: "Rapid Session Restart", conf: "84.5%", confColor: "text-warning", status: "REVIEWING", statusClass: "badge-high" },
  { time: "04:09:12 GMT", ip: "172.16.0.45", anomaly: "Latent Token Injection", conf: "42.1%", confColor: "text-foreground", status: "MONITORED", statusClass: "badge-info" },
  { time: "04:05:55 GMT", ip: "210.4.55.121", anomaly: "Base64 Encoded Exploit", conf: "96.8%", confColor: "text-destructive", status: "FLAGGED", statusClass: "badge-critical" },
];

const AdversarialDetection = () => (
  <div>
    <Header title="Adversarial Detection Engine" />
    <div className="p-6 space-y-6">
      <div>
        <h1 className="page-title uppercase tracking-wide">Adversarial Detection</h1>
        <p className="page-subtitle max-w-2xl">Monitoring suspicious neural network inputs and model-evasion attempts in real-time across global endpoints.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Threats Blocked</p>
          <p className="text-3xl font-bold text-foreground mt-1">1,284</p>
          <p className="text-xs text-success mt-1">+12% vs last hr</p>
        </div>
        <div className="stat-card">
          <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Anomaly Score</p>
          <p className="text-3xl font-bold text-foreground mt-1">88%</p>
          <p className="text-xs text-destructive mt-1">CRITICAL PEAK</p>
        </div>
        <div className="stat-card">
          <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Active Probes</p>
          <p className="text-3xl font-bold text-foreground mt-1">14</p>
          <p className="text-xs text-muted-foreground mt-1">LIVE SESSIONS</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="section-card">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Packet Size Dist.</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData}>
              <XAxis dataKey="bin" tick={{ fill: "hsl(210, 15%, 50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Bar dataKey="val" fill="hsl(185, 80%, 50%)" radius={[2, 2, 0, 0]}>
                {barData.map((_, i) => (
                  <rect key={i} fill={i === 4 ? "hsl(0, 72%, 55%)" : "hsl(185, 80%, 50%)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2">Unusual jumbo frame detection at 04:12 GMT</p>
        </div>

        <div className="section-card">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Connection Durations</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={connData}>
              <XAxis hide />
              <YAxis hide />
              <Line type="monotone" dataKey="v1" stroke="hsl(185, 80%, 50%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="v2" stroke="hsl(185, 80%, 50%)" strokeWidth={1} strokeDasharray="4 4" dot={false} opacity={0.5} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2">Pattern mismatch in long-lived sessions</p>
        </div>

        <div className="section-card">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Login Attempt Anomalies</h3>
          <div className="space-y-5 mt-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground font-medium">FAILED LOGIN BURST</span>
                <span className="text-destructive font-semibold">85% CONFIDENCE</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-warning rounded-full" style={{ width: "85%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground font-medium">CREDENTIAL STUFFING</span>
                <span className="text-primary font-semibold">12% CONFIDENCE</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "12%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Table */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">Real-time Adversarial Feed</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-primary text-primary text-xs font-medium">Export CSV</button>
            <button className="px-3 py-1.5 rounded-lg border border-primary text-primary text-xs font-medium">Bulk Action</button>
          </div>
        </div>
        <table className="data-table">
          <thead><tr><th>Timestamp</th><th>Source IP</th><th>Feature Anomaly</th><th>Pred. Confidence</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {feed.map((row, i) => (
              <tr key={i}>
                <td className="text-muted-foreground font-mono text-xs">{row.time}</td>
                <td className="text-primary font-mono text-xs">{row.ip}</td>
                <td><span className="text-destructive mr-1">●</span> {row.anomaly}</td>
                <td className={`font-semibold ${row.confColor}`}>{row.conf}</td>
                <td><span className={row.statusClass}>{row.status}</span></td>
                <td><ExternalLink className="w-4 h-4 text-muted-foreground" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
        <span>Powered by Adversarial ML Core v4.2.0</span>
        <div className="flex gap-4">
          <span>System Status</span><span>API Documentation</span><span>Security Policies</span>
        </div>
      </div>
    </div>
  </div>
);

export default AdversarialDetection;
