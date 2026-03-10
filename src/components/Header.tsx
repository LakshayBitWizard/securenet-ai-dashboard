import { Search, Bell, HelpCircle } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
}

const Header = ({ title, subtitle, badge, actions }: HeaderProps) => {
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card/50">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {badge && (
          <span className="badge-info text-[10px] uppercase tracking-wider">{badge}</span>
        )}
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search logs, IPs, or threats..."
            className="w-64 h-8 pl-9 pr-3 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        {actions}

        <button className="relative text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
