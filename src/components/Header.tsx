import { useState, useMemo } from "react";
import { Search, Bell, HelpCircle, X } from "lucide-react";
import { useLiveData } from "@/contexts/LiveDataContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";

interface HeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
}

const Header = ({ title, subtitle, badge, actions }: HeaderProps) => {
  const { logs, notifications, unreadCount, markNotificationsRead } = useLiveData();
  const [query, setQuery] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return logs.filter((l) =>
      (l.source_ip || "").toLowerCase().includes(q) ||
      (l.prediction || "").toLowerCase().includes(q) ||
      (l.timestamp || "").toLowerCase().includes(q) ||
      (l.risk || "").toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query, logs]);

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card/50">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {badge && <span className="badge-info text-[10px] uppercase tracking-wider">{badge}</span>}
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search with results popover */}
        <Popover open={query.length > 0}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search logs, IPs, or threats..."
                className="w-64 h-8 pl-9 pr-8 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0 bg-card border-border" onOpenAutoFocus={(e) => e.preventDefault()}>
            <div className="p-3 border-b border-border text-xs text-muted-foreground">
              {searchResults.length} match{searchResults.length === 1 ? "" : "es"} in {logs.length} logs
            </div>
            <div className="max-h-80 overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4 text-center">No results</p>
              ) : (
                searchResults.map((r, i) => (
                  <div key={r.id ?? i} className="px-3 py-2 border-b border-border/50 hover:bg-secondary/40 text-xs">
                    <div className="flex justify-between">
                      <span className="font-mono text-primary">{r.source_ip}</span>
                      <span className={
                        r.risk === "CRITICAL" ? "text-destructive" :
                        r.risk === "HIGH" ? "text-warning" :
                        r.risk === "MEDIUM" ? "text-muted-foreground" : "text-success"
                      }>{r.risk}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground mt-0.5">
                      <span>{r.prediction}</span>
                      <span className="font-mono">{new Date(r.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {actions}

        {/* Bell — notifications */}
        <Popover onOpenChange={(open) => { if (open) markNotificationsRead(); }}>
          <PopoverTrigger asChild>
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-destructive rounded-full text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0 bg-card border-border">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Threat Notifications</h4>
              <span className="text-xs text-muted-foreground">{notifications.length} recent</span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground p-6 text-center">No alerts yet</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="px-3 py-2.5 border-b border-border/50 hover:bg-secondary/40">
                    <div className="flex items-start gap-2">
                      <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                        n.risk === "CRITICAL" ? "bg-destructive" : "bg-warning"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{n.message}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {new Date(n.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Help */}
        <button onClick={() => setHelpOpen(true)} className="text-muted-foreground hover:text-foreground transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </header>
  );
};

const HelpDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>SecureNet AI — Help & Documentation</DialogTitle>
        <DialogDescription>How the dashboard works and what each panel means.</DialogDescription>
      </DialogHeader>
      <div className="space-y-5 text-sm">
        <section>
          <h4 className="font-semibold text-foreground mb-2">Dashboard panels</h4>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li><b>Network Traffic Over Time</b> — rolling window of byte volume per minute.</li>
            <li><b>Attack Type Distribution</b> — counts of each attack class predicted by the ResNet model.</li>
            <li><b>Recent Threat Logs</b> — newest predictions; persists on the backend across page changes.</li>
          </ul>
        </section>
        <section>
          <h4 className="font-semibold text-foreground mb-2">Attack categories (NSL-KDD)</h4>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li><b>DoS</b> — Denial of Service (e.g. neptune, smurf, teardrop). Risk: CRITICAL.</li>
            <li><b>Probe</b> — Reconnaissance (e.g. nmap, portsweep, satan). Risk: MEDIUM.</li>
            <li><b>R2L</b> — Remote-to-Local unauthorized access (e.g. guess_passwd, ftp_write). Risk: HIGH.</li>
            <li><b>U2R</b> — User-to-Root privilege escalation (e.g. buffer_overflow, rootkit). Risk: CRITICAL.</li>
            <li><b>Normal</b> — benign traffic. Risk: LOW.</li>
          </ul>
        </section>
        <section>
          <h4 className="font-semibold text-foreground mb-2">Feature glossary</h4>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li><b>hot</b> — number of "hot" indicators (sensitive system access attempts).</li>
            <li><b>flag</b> — TCP connection state (SF normal, S0 no reply, REJ rejected, RSTO reset, …).</li>
            <li><b>src_bytes / dst_bytes</b> — bytes sent from source / destination.</li>
            <li><b>service</b> — destination service (http, ftp, ssh, …) inferred from port.</li>
          </ul>
        </section>
        <section>
          <h4 className="font-semibold text-foreground mb-2">FAQ</h4>
          <p className="text-muted-foreground"><b>Q: Why does my log keep growing after I switch tabs?</b><br />
            The Flask backend captures and predicts continuously. The dashboard just displays what it finds when you return.</p>
          <p className="text-muted-foreground mt-2"><b>Q: How do I switch to live Scapy capture?</b><br />
            Open <i>Settings</i> in the sidebar and toggle <i>Capture mode</i> to "Scapy". Requires running the backend with sudo.</p>
        </section>
      </div>
    </DialogContent>
  </Dialog>
);

export default Header;
