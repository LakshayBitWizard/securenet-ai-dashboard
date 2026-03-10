import Header from "@/components/Header";
import { Calendar, Shield, AlertTriangle, Download, MoreHorizontal } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";

const timelineData = [
  { time: "00:00", value: 300 }, { time: "04:00", value: 600 },
  { time: "08:00", value: 900 }, { time: "12:00", value: 1280 },
  { time: "16:00", value: 700 }, { time: "20:00", value: 500 }, { time: "23:59", value: 400 },
];

const protocols = [
  { name: "TCP", pct: 64 }, { name: "UDP", pct: 22 }, { name: "ICMP", pct: 8 },
  { name: "DNS", pct: 4 }, { name: "Other", pct: 2 },
];

const trafficStream = [
  { time: "2023-10-24 14:22:10.45", srcIp: "192.168.1.105", dest: "Internal_Gateway_01", proto: "TCP:443", status: "Allowed", statusColor: "text-success" },
  { time: "2023-10-24 14:21:55.12", srcIp: "45.128.2.14", dest: "Public_App_Server", proto: "UDP:53", status: "Dropped", statusColor: "text-destructive" },
  { time: "2023-10-24 14:21:40.99", srcIp: "10.0.42.11", dest: "Database_Cluster_A", proto: "TCP:5432", status: "Inspected", statusColor: "text-warning" },
];

const TrafficAnalysis = () => (
  <div>
    <Header title="Traffic Analysis" badge="LIVE MODE" />
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FilterChip icon={<Calendar className="w-3.5 h-3.5" />} label="Time Range: Last 24h" />
          <FilterChip icon={<Shield className="w-3.5 h-3.5" />} label="Protocol: All" />
          <FilterChip icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Attack: High Severity" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors">
          <Download className="w-4 h-4" /> Export Data
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 section-card">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Network Traffic Timeline</h3>
            <span className="flex items-center gap-1 text-xs text-primary">● Incoming</span>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-foreground">1.28M</span>
            <span className="text-sm text-muted-foreground">pkts/sec</span>
            <span className="text-xs text-success">↗ +12.5%</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="tlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(185, 80%, 50%)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(185, 80%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fill: "hsl(210, 15%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Area type="monotone" dataKey="value" stroke="hsl(185, 80%, 50%)" strokeWidth={2} fill="url(#tlGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Protocol Distribution */}
        <div className="section-card">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Protocol Distribution</h3>
          <div className="space-y-4">
            {protocols.map((p) => (
              <div key={p.name} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground font-medium">{p.name}</span>
                  <span className="text-primary font-semibold">{p.pct}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 border-t border-border pt-3">
            Anomaly detected in UDP traffic (Non-standard port 443).
          </p>
        </div>
      </div>

      {/* Heatmap + Origins placeholders */}
      <div className="grid grid-cols-2 gap-4">
        <div className="section-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Packet Activity Heatmap</h3>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span>LOW</span>
              <div className="flex gap-0.5">
                <span className="w-3 h-3 rounded-sm bg-primary/10" />
                <span className="w-3 h-3 rounded-sm bg-primary/30" />
                <span className="w-3 h-3 rounded-sm bg-primary/60" />
                <span className="w-3 h-3 rounded-sm bg-primary" />
              </div>
              <span>HIGH</span>
            </div>
          </div>
          <div className="grid grid-cols-24 gap-0.5">
            {Array.from({ length: 168 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-sm" style={{ background: `hsl(185, 80%, 50%, ${Math.random() * 0.6 + 0.05})` }} />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>0H</span><span>4H</span><span>8H</span><span>12H</span><span>16H</span><span>20H</span><span>24H</span>
          </div>
        </div>

        <div className="section-card">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Traffic Source Origins</h3>
          <div className="h-48 rounded-lg bg-secondary/50 flex items-center justify-center relative">
            <div className="text-muted-foreground text-sm">World Map View</div>
            <div className="absolute bottom-3 left-3 bg-card/90 rounded-lg px-3 py-2 text-xs">
              <p className="text-success font-semibold">● HIGH INTENSITY</p>
              <p className="text-muted-foreground">Primary: North America (45%)</p>
              <p className="text-muted-foreground">Secondary: East Asia (22%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ingress Stream */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ingress Traffic Stream</h3>
          <span className="flex items-center gap-1.5 text-xs text-success animate-pulse-glow">● CAPTURING...</span>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Timestamp</th><th>Source IP</th><th>Destination</th><th>Protocol</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {trafficStream.map((row, i) => (
              <tr key={i}>
                <td className="text-muted-foreground font-mono text-xs">{row.time}</td>
                <td className="font-mono text-sm font-semibold text-foreground">{row.srcIp}</td>
                <td className="text-secondary-foreground">{row.dest}</td>
                <td><span className="badge-info">{row.proto}</span></td>
                <td className={row.statusColor}>● {row.status}</td>
                <td><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const FilterChip = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-sm text-secondary-foreground hover:border-primary/50 transition-colors">
    {icon} {label}
  </button>
);

export default TrafficAnalysis;
