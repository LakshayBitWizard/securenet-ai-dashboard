import Header from "@/components/Header";
import { TrendingUp, TrendingDown, AlertTriangle, XCircle, CheckCircle, MoreHorizontal } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const trafficData = [
  { time: "00:00", value: 200 }, { time: "02:00", value: 350 }, { time: "04:00", value: 500 },
  { time: "06:00", value: 400 }, { time: "08:00", value: 600 }, { time: "10:00", value: 800 },
  { time: "12:00", value: 1200 }, { time: "14:00", value: 900 }, { time: "16:00", value: 1100 },
  { time: "18:00", value: 950 }, { time: "20:00", value: 700 }, { time: "23:59", value: 400 },
];

const pieData = [
  { name: "DDoS Attacks", value: 58, color: "hsl(185, 80%, 50%)" },
  { name: "SQL Injection", value: 24, color: "hsl(25, 90%, 55%)" },
  { name: "Brute Force", value: 18, color: "hsl(210, 15%, 40%)" },
];

const threatLogs = [
  { time: "2023-11-24 14:22:10", ip: "192.168.1.44", type: "DDoS Attempt", risk: "CRITICAL", status: "Blocked", statusColor: "text-success" },
  { time: "2023-11-24 14:18:55", ip: "45.233.12.102", type: "SQLi Pattern", risk: "HIGH", status: "Flagged", statusColor: "text-destructive" },
  { time: "2023-11-24 14:10:32", ip: "10.0.0.12", type: "Brute Force", risk: "MEDIUM", status: "Mitigated", statusColor: "text-warning" },
];

const Dashboard = () => {
  return (
    <div>
      <Header title="SecureNet AI" subtitle="Senior SOC Analyst" />
      <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-primary" />}
            iconBg="bg-primary/15"
            label="Total Network Traffic"
            value="1.2 TB"
            change="+5.2%"
            changeUp
          />
          <StatCard
            icon={<AlertTriangle className="w-5 h-5 text-warning" />}
            iconBg="bg-warning/15"
            label="Threat Alerts Today"
            value="42"
            change="+12.4%"
            changeUp
          />
          <StatCard
            icon={<XCircle className="w-5 h-5 text-destructive" />}
            iconBg="bg-destructive/15"
            label="Blocked Attacks"
            value="15"
            change="-2.1%"
            changeUp={false}
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5 text-success" />}
            iconBg="bg-success/15"
            label="System Health"
            value="99.9%"
            badge="Stable"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Traffic Chart */}
          <div className="col-span-2 section-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">Network Traffic Over Time</h3>
                <p className="text-xs text-muted-foreground">Live monitoring across all clusters</p>
              </div>
              <select className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-xs text-foreground">
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(185, 80%, 50%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(185, 80%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: "hsl(210, 15%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Area type="monotone" dataKey="value" stroke="hsl(185, 80%, 50%)" strokeWidth={2} fill="url(#trafficGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="section-card">
            <h3 className="text-base font-semibold text-foreground">Attack Type Distribution</h3>
            <p className="text-xs text-muted-foreground mb-2">Total breakdown of incidents</p>
            <div className="flex justify-center">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center -mt-28 mb-20">
              <p className="text-xs text-muted-foreground uppercase">Total</p>
              <p className="text-2xl font-bold text-foreground">1,482</p>
            </div>
            <div className="space-y-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-secondary-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Threat Logs Table */}
        <div className="section-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Recent Threat Logs</h3>
            <button className="text-xs text-primary font-medium hover:underline">View All →</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th><th>Source IP</th><th>Attack Type</th><th>Risk Level</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {threatLogs.map((log, i) => (
                <tr key={i}>
                  <td className="text-muted-foreground font-mono text-xs">{log.time}</td>
                  <td className="text-primary font-mono text-xs">{log.ip}</td>
                  <td>{log.type}</td>
                  <td><span className={log.risk === "CRITICAL" ? "badge-critical" : log.risk === "HIGH" ? "badge-high" : "badge-medium"}>{log.risk}</span></td>
                  <td><span className={log.statusColor}>● {log.status}</span></td>
                  <td><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, iconBg, label, value, change, changeUp, badge }: {
  icon: React.ReactNode; iconBg: string; label: string; value: string;
  change?: string; changeUp?: boolean; badge?: string;
}) => (
  <div className="stat-card flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>{icon}</div>
      {change && (
        <span className={`text-xs font-medium flex items-center gap-1 ${changeUp ? "text-success" : "text-destructive"}`}>
          {changeUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {change}
        </span>
      )}
      {badge && <span className="badge-success text-[10px]">● {badge}</span>}
    </div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
    </div>
  </div>
);

export default Dashboard;
