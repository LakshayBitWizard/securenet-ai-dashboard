import Header from "@/components/Header";
import { ShieldCheck, AlertTriangle, Eye, MoreHorizontal, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";

const barData = [
  { bin: "0.0", val: 20 }, { bin: "0.1", val: 35 }, { bin: "0.2", val: 40 },
  { bin: "0.3", val: 55 }, { bin: "0.4", val: 70 }, { bin: "0.5", val: 85 },
  { bin: "0.6", val: 95 }, { bin: "0.7", val: 90 }, { bin: "0.8", val: 100 },
  { bin: "0.9", val: 80 }, { bin: "1.0", val: 50 },
];

const lineData = [
  { t: "60M", val: 20 }, { t: "50M", val: 25 }, { t: "40M", val: 30 },
  { t: "30M", val: 35 }, { t: "20M", val: 55 }, { t: "10M", val: 70 }, { t: "NOW", val: 50 },
];

const ModelSecurity = () => (
  <div>
    <Header title="Deep Learning Model Monitoring" badge="LIVE" actions={
      <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
        <Download className="w-4 h-4" /> Export Report
      </button>
    } />
    <div className="p-6 space-y-6">
      <div>
        <h1 className="page-title">Real-time Security Analysis</h1>
        <p className="page-subtitle max-w-3xl">Continuous monitoring for model v1.0 (Production). Detecting adversarial patterns and inference anomalies.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <MiniStat icon={<ShieldCheck className="w-5 h-5 text-success" />} label="Model Integrity" value="Secure" sub="Verification: 2m ago · v1.0" />
        <MiniStat icon={<AlertTriangle className="w-5 h-5 text-warning" />} label="Adversarial Inputs" value="124" sub="+12% vs last hour" subColor="text-success" />
        <MiniStat icon={<Eye className="w-5 h-5 text-muted-foreground" />} label="Low Confidence" value="8.2%" sub="-2% target threshold" subColor="text-destructive" />
        <MiniStat icon={<MoreHorizontal className="w-5 h-5 text-muted-foreground" />} label="Prediction API Activity" value="1.2k/min" sub="+5% load" subColor="text-success" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="section-card">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-base font-semibold text-foreground">Prediction Confidence</h3>
              <p className="text-xs text-muted-foreground">Distribution across current inference batch</p>
            </div>
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <XAxis dataKey="bin" tick={{ fill: "hsl(210, 15%, 50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Bar dataKey="val" fill="hsl(185, 80%, 50%)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0.0 (Low)</span><span>Confidence Score</span><span>1.0 (High)</span>
          </div>
        </div>

        <div className="section-card">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-base font-semibold text-foreground">Suspicious Input Frequency</h3>
              <p className="text-xs text-muted-foreground">Threat detection alerts over last 60 minutes</p>
            </div>
            <span className="badge-critical text-[10px]">High Risk</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData}>
              <XAxis dataKey="t" tick={{ fill: "hsl(210, 15%, 50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Line type="monotone" dataKey="val" stroke="hsl(185, 80%, 50%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
);

const MiniStat = ({ icon, label, value, sub, subColor }: {
  icon: React.ReactNode; label: string; value: string; sub: string; subColor?: string;
}) => (
  <div className="stat-card">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      {icon}
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className={`text-xs mt-1 ${subColor || "text-muted-foreground"}`}>{sub}</p>
  </div>
);

export default ModelSecurity;
