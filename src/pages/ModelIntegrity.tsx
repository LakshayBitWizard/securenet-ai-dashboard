import Header from "@/components/Header";
import { CheckCircle, RefreshCw, FileDown, Eye, Info } from "lucide-react";

const activityLogs = [
  { event: "Model loaded into memory", icon: "⬇️", time: "Today, 10:45:12 AM", status: "COMPLETED", statusClass: "badge-success" },
  { event: "Prediction request received", icon: "↗️", time: "Today, 10:46:05 AM", status: "PROCESSED", statusClass: "badge-info" },
  { event: "Model verification completed", icon: "✅", time: "Today, 10:46:07 AM", status: "VERIFIED", statusClass: "badge-success" },
  { event: "Prediction request received", icon: "↗️", time: "Today, 10:48:22 AM", status: "PROCESSED", statusClass: "badge-info" },
];

const ModelIntegrity = () => (
  <div>
    <Header title="Integrity Monitor" subtitle="Real-time verification and security status of AI assets" actions={
      <span className="badge-info flex items-center gap-1.5 text-xs">🕐 Last Scan: 2 mins ago</span>
    } />
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-5 gap-6">
        {/* Main Integrity Status */}
        <div className="col-span-3">
          <div className="section-card text-center py-12" style={{ borderColor: "hsl(155, 70%, 50%, 0.3)" }}>
            <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Model Secure</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Integrity check passed. No unauthorized modifications detected in the current neural network weights or architecture.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                <RefreshCw className="w-4 h-4" /> Force Re-scan
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors">
                <FileDown className="w-4 h-4" /> Export Certificate
              </button>
            </div>
          </div>
        </div>

        {/* Model Info */}
        <div className="col-span-2 section-card">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-primary mb-4">
            <Info className="w-4 h-4" /> Model Information
          </h3>
          <div className="space-y-3 text-sm">
            <InfoRow label="File Name" value="secure_net_v4.bin" />
            <InfoRow label="Version" value="v4.2.0-stable" />
            <InfoRow label="Last Integrity Check" value="2023-10-27 14:30" />
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Hash Verification (SHA-256)</p>
            <p className="font-mono text-xs text-primary break-all leading-relaxed">
              f2ca1bb6c7e907d06dafe4687e579fce76b3 776e21b33291bf0d8
            </p>
            <p className="text-xs text-success font-semibold mt-2">✓ MATCHED</p>
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">Model Activity Logs</h3>
          <button className="text-xs text-primary font-medium hover:underline">View All Logs</button>
        </div>
        <table className="data-table">
          <thead><tr><th>Event</th><th>Timestamp</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {activityLogs.map((log, i) => (
              <tr key={i}>
                <td className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">{log.icon}</span>
                  <span className="text-foreground">{log.event}</span>
                </td>
                <td className="text-muted-foreground text-xs">{log.time}</td>
                <td><span className={log.statusClass}>{log.status}</span></td>
                <td><Eye className="w-4 h-4 text-muted-foreground" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="section-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weight Distribution Drift</h3>
            <span className="text-xs text-success">0.02% Δ</span>
          </div>
          <div className="flex items-end gap-1 h-24 mt-4">
            {[30, 45, 55, 70, 65, 50, 35].map((h, i) => (
              <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: "hsl(185, 80%, 50%)" }} />
            ))}
          </div>
        </div>
        <div className="section-card flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <span className="text-primary text-lg">✦</span>
            </div>
            <p className="text-sm text-muted-foreground">Continuous Integrity Monitoring Active</p>
          </div>
        </div>
      </div>

      {/* System Status Footer */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="status-dot bg-success" />
        <span className="text-[10px] uppercase tracking-wider">System Status</span>
        <span className="text-foreground ml-1">All nodes operational</span>
      </div>
    </div>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground font-medium">{value}</span>
  </div>
);

export default ModelIntegrity;
