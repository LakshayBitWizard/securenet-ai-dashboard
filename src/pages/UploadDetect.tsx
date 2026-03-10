import Header from "@/components/Header";
import { Upload as UploadIcon, FileText, X, Zap, Eye } from "lucide-react";

const scanHistory = [
  { time: "2023-11-20 14:23:41", file: "log_session_99.csv", threat: "NO THREAT", confidence: "99.9%", threatClass: "badge-success" },
  { time: "2023-11-20 10:12:05", file: "alpha_stream_v2.log", threat: "SQL INJECTION", confidence: "92.4%", threatClass: "badge-critical" },
];

const UploadDetect = () => (
  <div>
    <Header title="Upload & Detect" subtitle="Session: SN-AI-8832-X" />
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <UploadIcon className="w-6 h-6 text-primary" /> Upload & Detect
        </h1>
        <p className="page-subtitle max-w-2xl">
          Deep packet inspection and behavioral analysis. Upload network logs for instantaneous intrusion identification across enterprise nodes.
        </p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left: Upload Area */}
        <div className="col-span-3 space-y-4">
          {/* Drop Zone */}
          <div className="border-2 border-dashed border-primary/30 rounded-xl p-12 flex flex-col items-center justify-center hover:border-primary/50 transition-colors cursor-pointer">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <UploadIcon className="w-7 h-7 text-primary" />
            </div>
            <p className="text-lg font-semibold text-foreground">Drop your file here</p>
            <p className="text-sm text-muted-foreground mt-1">
              Accepting <span className="text-primary">CSV</span>, <span className="text-primary">PCAP</span>, <span className="text-primary">LOG</span> formats
            </p>
            <button className="mt-4 px-6 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors">
              Select File
            </button>
          </div>

          {/* File Selected */}
          <div className="section-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">network_traffic_dump_0423.pcap</p>
              <p className="text-xs text-muted-foreground">SIZE: <span className="text-foreground">142.5 MB</span> &nbsp; ROWS: <span className="text-foreground">1.2M</span></p>
            </div>
            <button className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="px-6 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">
              Clear Selection
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4" /> Run Intrusion Detection
            </button>
          </div>
        </div>

        {/* Right: Detection Results */}
        <div className="col-span-2 section-card cyber-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">Detection Results</h3>
            <span className="badge-critical uppercase text-[10px]">Threat Detected</span>
          </div>
          <div className="text-center py-4">
            <p className="text-4xl font-black text-destructive">DoS</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Identified Attack Type</p>
          </div>
          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="bg-secondary rounded-lg p-3 text-center">
              <p className="text-[10px] uppercase text-muted-foreground">Confidence</p>
              <p className="text-xl font-bold text-foreground font-mono">98.4%</p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <p className="text-[10px] uppercase text-muted-foreground">Risk Level</p>
              <p className="text-xl font-bold text-destructive">CRITICAL</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Source IP</span><span className="font-mono text-foreground">192.168.1.104</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Destination</span><span className="text-foreground">Core_Server_01</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Time to Detect</span><span className="text-foreground">1.4s</span></div>
          </div>
          <button className="w-full mt-5 py-2.5 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors">
            Download Full Forensic Report
          </button>
        </div>
      </div>

      {/* Scan History */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">Scan History</h3>
          <button className="text-xs text-primary font-semibold uppercase tracking-wider hover:underline">View All Records</button>
        </div>
        <table className="data-table">
          <thead><tr><th>Timestamp</th><th>File Name</th><th>Threat Type</th><th>Confidence</th><th>Action</th></tr></thead>
          <tbody>
            {scanHistory.map((row, i) => (
              <tr key={i}>
                <td className="text-muted-foreground font-mono text-xs">{row.time}</td>
                <td className="text-foreground font-medium">{row.file}</td>
                <td><span className={row.threatClass}>{row.threat}</span></td>
                <td className="font-mono">{row.confidence}</td>
                <td><Eye className="w-4 h-4 text-muted-foreground" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default UploadDetect;
