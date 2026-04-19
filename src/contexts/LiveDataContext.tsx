import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import {
  fetchLogs, fetchNotifications, fetchStats, fetchSettings, updateSettings,
  type PredictionResult, type NotificationItem, type StatsResponse, type AppSettings,
} from "@/services/api";

interface LiveDataContextType {
  logs: PredictionResult[];
  stats: StatsResponse | null;
  settings: AppSettings | null;
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationsRead: () => void;
  saveSettings: (patch: Partial<AppSettings>) => Promise<void>;
}

const LiveDataContext = createContext<LiveDataContextType | null>(null);

const DEFAULT_INTERVAL = 5000;

export const LiveDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [logs, setLogs] = useState<PredictionResult[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readUntil, setReadUntil] = useState<number>(0);

  const lastLogIdRef = useRef(0);
  const lastNotifIdRef = useRef(0);

  const tick = useCallback(async () => {
    const [logsRes, notifRes, statsRes] = await Promise.all([
      fetchLogs(lastLogIdRef.current, 200),
      fetchNotifications(lastNotifIdRef.current),
      fetchStats(),
    ]);
    if (logsRes.logs.length) {
      lastLogIdRef.current = Math.max(lastLogIdRef.current, logsRes.last_id);
      setLogs((prev) => {
        // logsRes.logs is newest-first; merge & dedupe by id
        const merged = [...logsRes.logs, ...prev];
        const seen = new Set<number>();
        const out: PredictionResult[] = [];
        for (const l of merged) {
          const key = l.id ?? -1;
          if (key >= 0 && seen.has(key)) continue;
          if (key >= 0) seen.add(key);
          out.push(l);
          if (out.length >= 500) break;
        }
        return out;
      });
    }
    if (notifRes.notifications.length) {
      lastNotifIdRef.current = Math.max(lastNotifIdRef.current, notifRes.last_id);
      setNotifications((prev) => [...notifRes.notifications.reverse(), ...prev].slice(0, 50));
    }
    if (statsRes) setStats(statsRes);
  }, []);

  // Poll using current refresh_interval
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await tick();
    };
    run();
    const interval = (settings?.refresh_interval || 5) * 1000 || DEFAULT_INTERVAL;
    const id = setInterval(run, interval);
    return () => { cancelled = true; clearInterval(id); };
  }, [tick, settings?.refresh_interval]);

  // Load settings once
  useEffect(() => {
    fetchSettings().then((s) => s && setSettings(s));
  }, []);

  const saveSettings = useCallback(async (patch: Partial<AppSettings>) => {
    const updated = await updateSettings(patch);
    if (updated) setSettings(updated);
  }, []);

  const markNotificationsRead = useCallback(() => {
    setReadUntil(notifications[0]?.id ?? lastNotifIdRef.current);
  }, [notifications]);

  const unreadCount = notifications.filter((n) => n.id > readUntil).length;

  return (
    <LiveDataContext.Provider value={{
      logs, stats, settings, notifications, unreadCount,
      markNotificationsRead, saveSettings,
    }}>
      {children}
    </LiveDataContext.Provider>
  );
};

export const useLiveData = () => {
  const ctx = useContext(LiveDataContext);
  if (!ctx) throw new Error("useLiveData must be inside LiveDataProvider");
  return ctx;
};
