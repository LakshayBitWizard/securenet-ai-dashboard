import Header from "@/components/Header";
import { Download, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const threats = [
  { time: "2023-11-24\n14:22:01", ip: "192.168.1.45", country: "(RU)", type: "DDoS Attack", icon: "🛡️", confidence: 98, risk: "CRITICAL", status: "Blocked", statusColor: "text-success" },
  { time: "2023-11-24\n14:18:15", ip: "45.22.11.90", country: "(CN)", type: "SQL Injection", icon: "🐚", confidence: 85, risk: "HIGH", status: "Mitigated", statusColor: "text-foreground" },
  { time: "2023-11-24\n14:10:32", ip: "10.0.0.12", country: "(Internal)", type: "Brute Force", icon: "👊", confidence: 72, risk: "MEDIUM", status: "Under Review", statusColor: "text-foreground" },
  { time: "2023-11-24\n13:55:04", ip: "172.16.254.1", country: "(UK)", type: "Malware Callback", icon: "🦠", confidence: 94, risk: "CRITICAL", status: "Quarantined", statusColor: "text-foreground" },
  { time: "2023-11-24\n13:42:55", ip: "192.168.1.102", country: "(Local)", type: "Port Scan", icon: "📡", confidence: 40, risk: "LOW", status: "Ignored", statusColor: "text-muted-foreground" },
  { time: "2023-11-24\n13:30:11", ip: "88.192.4.15", country: "(FR)", type: "XSS Attempt", icon: "⚠️", confidence: 78, risk: "HIGH", status: "Prevented", statusColor: "text-foreground" },
];

const riskClass: Record<string, string> = { CRITICAL: "badge-critical", HIGH: "badge-high", MEDIUM: "badge-medium", LOW: "badge-low" };

const ThreatLogs = () => (
  <div>
    <Header title="Threat Monitoring System" />
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Threat Logs</h1>
          <p className="page-subtitle max-w-2xl">Real-time monitoring and analysis of detected cyber attacks across the entire infrastructure. All events are categorized by risk level and source.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Filter label="TYPE" value="All Attacks" />
        <Filter label="RISK" value="All Levels" />
        <Filter label="TIME" value="Last 24 Hours" />
        <button className="ml-auto text-xs text-primary font-medium hover:underline">↻ Reset Filters</button>
      </div>

      {/* Table */}
      <div className="section-card">
        <table className="data-table">
          <thead>
            <tr><th>Timestamp</th><th>Source IP</th><th>Attack Type</th><th>Confidence Score</th><th>Risk Level</th><th>Status</th></tr>
          </thead>
          <tbody>
            {threats.map((t, i) => (
              <tr key={i}>
                <td className="text-muted-foreground font-mono text-xs whitespace-pre-line">{t.time}</td>
                <td>
                  <span className="font-mono font-semibold text-foreground">{t.ip}</span>
                  <span className="text-primary text-xs ml-1">{t.country}</span>
                </td>
                <td className="flex items-center gap-2"><span>{t.icon}</span> {t.type}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${t.confidence}%` }} />
                    </div>
                    <span className="text-sm font-medium">{t.confidence}%</span>
                  </div>
                </td>
                <td><span className={riskClass[t.risk]}>{t.risk}</span></td>
                <td className={t.statusColor}>● {t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">Showing <span className="text-foreground font-semibold">1-6</span> of 128 incidents detected</p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary"><ChevronLeft className="w-4 h-4" /></button>
            {[1, 2, 3, "...", 12].map((p, i) => (
              <button key={i} className={`w-8 h-8 rounded-lg text-sm font-medium ${p === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
                {p}
              </button>
            ))}
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Filter = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm">
    <span className="text-xs font-semibold text-muted-foreground">{label}</span>
    <span className="text-foreground">{value}</span>
    <ChevronLeft className="w-3 h-3 text-muted-foreground rotate-[270deg]" />
  </div>
);

export default ThreatLogs;
