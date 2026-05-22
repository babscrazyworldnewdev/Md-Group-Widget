import { useState, useEffect, useMemo } from "react";
import { format, subDays, parseISO, startOfDay } from "date-fns";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Users, TrendingUp, Globe, Smartphone, Monitor, Tablet,
  Lock, Eye, EyeOff, LogOut, RefreshCw, Download,
  MapPin, Wifi, Clock, Search, Mail, Phone, Scale,
  ChevronRight, Activity, BarChart2, FileText, Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  legalIssue: string;
  conversationId?: string | null;
  createdAt: string;
}

interface Session {
  id: number;
  sessionId: string;
  ip?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  timezone?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  isp?: string | null;
  browser?: string | null;
  browserVersion?: string | null;
  os?: string | null;
  osVersion?: string | null;
  device?: string | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
  language?: string | null;
  referrer?: string | null;
  pageUrl?: string | null;
  userAgent?: string | null;
  extra?: Record<string, unknown> | null;
  visitedAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ADMIN_PASSWORD = "MDLaw2024!";
const AUTH_KEY = "mdlaw_admin_auth";

const CHART_COLORS = [
  "#1e3a5f", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd",
  "#1d4ed8", "#1e40af", "#1e3a8a", "#172554", "#0ea5e9",
];

const PIE_COLORS = ["#1e3a5f", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#0ea5e9", "#0284c7"];

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "1");
      onLogin();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1f3d] via-[#1e3a5f] to-[#0f1f3d] flex items-center justify-center p-4">
      <div className={`w-full max-w-sm transition-all ${shake ? "animate-bounce" : ""}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 border border-white/20">
            <Scale className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">MD Law Group</h1>
          <p className="text-blue-300 text-sm mt-1">Analytics Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="h-4 w-4 text-blue-400" />
            <span className="text-white font-semibold text-sm">Secure Access</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-blue-300 font-medium uppercase tracking-wider">Password</label>
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(false); }}
                  placeholder="Enter admin password"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 pr-10 focus:border-blue-400 focus:ring-blue-400/20"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <span>✕</span> Incorrect password
                </p>
              )}
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold gap-2">
              Access Dashboard <ChevronRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          MD Law Group &bull; Intake Analytics System
        </p>
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
  label, value, sub, icon: Icon, trend, color = "blue",
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; trend?: string; color?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    navy: "bg-[#1e3a5f]/10 text-[#1e3a5f]",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-0.5">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Chart Card ───────────────────────────────────────────────────────────────

function ChartCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <SectionHeader title={title} sub={sub} />
      {children}
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg text-sm">
      {label && <p className="font-semibold text-gray-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-gray-600">{p.name}: <span className="font-bold text-gray-900">{p.value}</span></p>
      ))}
    </div>
  );
}

// ─── Table Helpers ────────────────────────────────────────────────────────────

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
      {children}
    </th>
  );
}
function Td({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <td className={`px-4 py-3 text-sm text-gray-700 ${mono ? "font-mono text-xs" : ""}`}>
      {children ?? <span className="text-gray-300">—</span>}
    </td>
  );
}

// ─── Export CSV ───────────────────────────────────────────────────────────────

function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const rows = [keys.join(","), ...data.map((r) => keys.map((k) => JSON.stringify(r[k] ?? "")).join(","))];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [searchLeads, setSearchLeads] = useState("");
  const [searchVisitors, setSearchVisitors] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, sessionsRes] = await Promise.all([
        fetch("/api/leads"),
        fetch("/api/analytics/sessions"),
      ]);
      const [leadsData, sessionsData] = await Promise.all([
        leadsRes.json() as Promise<Lead[]>,
        sessionsRes.json() as Promise<Session[]>,
      ]);
      setLeads(Array.isArray(leadsData) ? leadsData : []);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setLastRefresh(new Date());
    } catch {
      // silently fail — show empty state
    }
    setLoading(false);
  };

  useEffect(() => { void fetchData(); }, []);

  // ── Derived analytics ──────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const uniqueCountries = new Set(sessions.map((s) => s.country).filter(Boolean)).size;
    const conversionRate = sessions.length ? ((leads.length / sessions.length) * 100).toFixed(1) : "0.0";
    const avgSessionsPerDay = (() => {
      if (!sessions.length) return "0";
      const oldest = sessions[sessions.length - 1]?.visitedAt;
      if (!oldest) return "0";
      const days = Math.max(1, Math.ceil((Date.now() - new Date(oldest).getTime()) / 86400000));
      return (sessions.length / days).toFixed(1);
    })();
    return { uniqueCountries, conversionRate, avgSessionsPerDay };
  }, [sessions, leads]);

  // Visits per day (last 14 days)
  const visitsPerDay = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "MMM d");
      days[d] = 0;
    }
    sessions.forEach((s) => {
      const d = format(parseISO(s.visitedAt), "MMM d");
      if (d in days) days[d]++;
    });
    return Object.entries(days).map(([date, visits]) => ({ date, visits }));
  }, [sessions]);

  // Leads per day (last 14 days)
  const leadsPerDay = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "MMM d");
      days[d] = 0;
    }
    leads.forEach((l) => {
      const d = format(parseISO(l.createdAt), "MMM d");
      if (d in days) days[d]++;
    });
    return Object.entries(days).map(([date, leads]) => ({ date, leads }));
  }, [leads]);

  // Device breakdown
  const deviceData = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach((s) => { const d = s.device ?? "Unknown"; counts[d] = (counts[d] ?? 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [sessions]);

  // Browser breakdown
  const browserData = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach((s) => { const b = s.browser ?? "Unknown"; counts[b] = (counts[b] ?? 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 7);
  }, [sessions]);

  // Country breakdown
  const countryData = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach((s) => { const c = s.country ?? "Unknown"; counts[c] = (counts[c] ?? 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [sessions]);

  // Legal issue breakdown
  const legalIssueData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => { const li = l.legalIssue ?? "General Inquiry"; counts[li] = (counts[li] ?? 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [leads]);

  // Top referrers (SEO)
  const referrerData = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach((s) => {
      const r = s.referrer?.trim() || "Direct / None";
      let host = r;
      try { if (r !== "Direct / None") host = new URL(r).hostname; } catch { /* skip */ }
      counts[host] = (counts[host] ?? 0) + 1;
    });
    return Object.entries(counts).map(([source, visits]) => ({ source, visits })).sort((a, b) => b.visits - a.visits).slice(0, 10);
  }, [sessions]);

  // Top pages (SEO)
  const pageData = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach((s) => {
      const p = s.pageUrl?.trim() || "Unknown";
      let path = p;
      try { path = new URL(p).pathname; } catch { /* skip */ }
      counts[path] = (counts[path] ?? 0) + 1;
    });
    return Object.entries(counts).map(([page, views]) => ({ page, views })).sort((a, b) => b.views - a.views).slice(0, 10);
  }, [sessions]);

  // OS breakdown
  const osData = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach((s) => { const o = s.os ?? "Unknown"; counts[o] = (counts[o] ?? 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [sessions]);

  // Hourly heatmap (visits by hour of day)
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, visits: 0 }));
    sessions.forEach((s) => {
      const h = new Date(s.visitedAt).getHours();
      hours[h].visits++;
    });
    return hours;
  }, [sessions]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    const q = searchLeads.toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.phone.toLowerCase().includes(q) ||
      l.legalIssue.toLowerCase().includes(q)
    );
  }, [leads, searchLeads]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    const q = searchVisitors.toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) =>
      (s.ip ?? "").includes(q) ||
      (s.country ?? "").toLowerCase().includes(q) ||
      (s.city ?? "").toLowerCase().includes(q) ||
      (s.browser ?? "").toLowerCase().includes(q) ||
      (s.referrer ?? "").toLowerCase().includes(q)
    );
  }, [sessions, searchVisitors]);

  const deviceIcon = (d?: string | null) => {
    if (d === "Mobile") return <Smartphone className="h-3.5 w-3.5 text-blue-500" />;
    if (d === "Tablet") return <Tablet className="h-3.5 w-3.5 text-purple-500" />;
    return <Monitor className="h-3.5 w-3.5 text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="bg-[#1e3a5f] text-white px-6 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 rounded-lg p-1.5 border border-white/20">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-base">MD Law Group</span>
            <span className="text-blue-300 text-xs ml-2">Analytics Dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-blue-300">
            Refreshed {format(lastRefresh, "h:mm:ss a")}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void fetchData()}
            disabled={loading}
            className="text-white hover:bg-white/10 gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-blue-300 hover:text-white hover:bg-white/10 gap-1.5 text-xs"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KPICard label="Total Visits" value={sessions.length} sub={`${stats.avgSessionsPerDay}/day avg`} icon={Activity} color="blue" />
          <KPICard label="Leads Captured" value={leads.length} sub="From intake form" icon={Users} color="green" />
          <KPICard label="Conversion Rate" value={`${stats.conversionRate}%`} sub="Visits → Leads" icon={TrendingUp} color="purple" />
          <KPICard label="Countries Reached" value={stats.uniqueCountries} sub="Unique geographies" icon={Globe} color="orange" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="mb-5 bg-white border border-gray-200 shadow-sm h-10">
            <TabsTrigger value="overview" className="gap-1.5 text-xs"><BarChart2 className="h-3.5 w-3.5" />Overview</TabsTrigger>
            <TabsTrigger value="leads" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" />Leads ({leads.length})</TabsTrigger>
            <TabsTrigger value="visitors" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" />Visitors ({sessions.length})</TabsTrigger>
            <TabsTrigger value="seo" className="gap-1.5 text-xs"><Search className="h-3.5 w-3.5" />SEO & Traffic</TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ── */}
          <TabsContent value="overview" className="space-y-4">
            {/* Row 1: Visits + Leads over time */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard title="Website Visits (Last 14 Days)" sub="Daily unique visitor sessions">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={visitsPerDay} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="visits" stroke="#2563eb" strokeWidth={2} fill="url(#visitGrad)" name="Visits" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="New Leads (Last 14 Days)" sub="Intake form submissions per day">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={leadsPerDay} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="leads" stroke="#16a34a" strokeWidth={2} fill="url(#leadGrad)" name="Leads" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Row 2: Device + Legal Issues */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <ChartCard title="Device Types" sub="Desktop vs Mobile vs Tablet">
                {deviceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={deviceData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {deviceData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </ChartCard>

              <ChartCard title="Legal Issues" sub="Most requested practice areas">
                {legalIssueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={legalIssueData.slice(0, 6)} layout="vertical" margin={{ top: 0, right: 8, left: 60, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} width={60} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Leads" radius={[0, 4, 4, 0]}>
                        {legalIssueData.slice(0, 6).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </ChartCard>

              <ChartCard title="Browsers" sub="Top browsers used by visitors">
                {browserData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={browserData} margin={{ top: 4, right: 4, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} angle={-30} textAnchor="end" />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Visitors" radius={[4, 4, 0, 0]}>
                        {browserData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </ChartCard>
            </div>

            {/* Row 3: Countries + Hourly heatmap + OS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <ChartCard title="Top Countries" sub="Visitor geolocation">
                {countryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={countryData} layout="vertical" margin={{ top: 0, right: 8, left: 30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} width={30} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Visitors" radius={[0, 4, 4, 0]} fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </ChartCard>

              <ChartCard title="Visits by Hour of Day" sub="When visitors are most active (local time)">
                {sessions.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={hourlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "#94a3b8" }} interval={3} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="visits" name="Visits" fill="#1e3a5f" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </ChartCard>

              <ChartCard title="Operating Systems" sub="Visitor OS breakdown">
                {osData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={osData} cx="50%" cy="50%" outerRadius={75} innerRadius={35} dataKey="value">
                        {osData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </ChartCard>
            </div>
          </TabsContent>

          {/* ── LEADS ── */}
          <TabsContent value="leads">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-semibold text-gray-900">Captured Leads</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{leads.length} total leads from intake form</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <Input value={searchLeads} onChange={(e) => setSearchLeads(e.target.value)} placeholder="Search leads…" className="pl-8 h-8 text-xs w-52" />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => exportCSV(leads as unknown as Record<string, unknown>[], "leads.csv")} className="gap-1.5 text-xs h-8">
                    <Download className="h-3.5 w-3.5" /> Export CSV
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <Th>#</Th><Th>Name</Th><Th>Email</Th><Th>Phone</Th>
                      <Th>Legal Issue</Th><Th>Submitted</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredLeads.length === 0 ? (
                      <tr><td colSpan={6} className="text-center text-gray-400 text-sm py-12">No leads yet</td></tr>
                    ) : filteredLeads.map((l) => (
                      <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                        <Td><span className="text-gray-400 text-xs">{l.id}</span></Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center text-xs font-bold text-[#1e3a5f] shrink-0">
                              {l.name?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                            <span className="font-medium text-gray-900">{l.name}</span>
                          </div>
                        </Td>
                        <Td>
                          <a href={`mailto:${l.email}`} className="flex items-center gap-1 text-blue-600 hover:underline text-xs">
                            <Mail className="h-3 w-3" />{l.email}
                          </a>
                        </Td>
                        <Td>
                          <a href={`tel:${l.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline text-xs">
                            <Phone className="h-3 w-3" />{l.phone}
                          </a>
                        </Td>
                        <Td>
                          <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-100">
                            {l.legalIssue}
                          </Badge>
                        </Td>
                        <Td>
                          <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(l.createdAt), "MMM d, yyyy h:mm a")}
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ── VISITORS ── */}
          <TabsContent value="visitors">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-semibold text-gray-900">Visitor Sessions</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{sessions.length} total sessions recorded</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <Input value={searchVisitors} onChange={(e) => setSearchVisitors(e.target.value)} placeholder="Search visitors…" className="pl-8 h-8 text-xs w-52" />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => exportCSV(sessions as unknown as Record<string, unknown>[], "sessions.csv")} className="gap-1.5 text-xs h-8">
                    <Download className="h-3.5 w-3.5" /> Export CSV
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <Th>Time</Th><Th>Location</Th><Th>IP</Th>
                      <Th>Device</Th><Th>Browser / OS</Th>
                      <Th>Referrer</Th><Th>Page</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredSessions.length === 0 ? (
                      <tr><td colSpan={7} className="text-center text-gray-400 text-sm py-12">No sessions yet</td></tr>
                    ) : filteredSessions.slice(0, 200).map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <Td>
                          <div className="text-xs text-gray-500 whitespace-nowrap">
                            {format(parseISO(s.visitedAt), "MMM d h:mm a")}
                          </div>
                        </Td>
                        <Td>
                          <div className="flex items-center gap-1 text-xs whitespace-nowrap">
                            <MapPin className="h-3 w-3 text-red-400 shrink-0" />
                            {[s.city, s.region, s.country].filter(Boolean).join(", ") || "Unknown"}
                          </div>
                        </Td>
                        <Td mono>{s.ip ?? "—"}</Td>
                        <Td>
                          <div className="flex items-center gap-1.5">
                            {deviceIcon(s.device)}
                            <span className="text-xs">{s.device ?? "—"}</span>
                          </div>
                        </Td>
                        <Td>
                          <div className="text-xs">
                            <span className="font-medium">{s.browser ?? "—"}</span>
                            {s.browserVersion && <span className="text-gray-400"> {s.browserVersion.split(".")[0]}</span>}
                            {s.os && <span className="text-gray-400"> · {s.os}</span>}
                          </div>
                        </Td>
                        <Td>
                          <div className="text-xs text-gray-500 max-w-[160px] truncate">
                            {s.referrer ? (
                              <a href={s.referrer} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                {(() => { try { return new URL(s.referrer).hostname; } catch { return s.referrer; } })()}
                              </a>
                            ) : <span className="text-gray-400">Direct</span>}
                          </div>
                        </Td>
                        <Td>
                          <div className="text-xs text-gray-500 max-w-[120px] truncate">
                            {s.pageUrl ? ((() => { try { return new URL(s.pageUrl).pathname; } catch { return s.pageUrl; } })()) : "—"}
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredSessions.length > 200 && (
                  <p className="text-center text-xs text-gray-400 py-3">Showing latest 200 of {filteredSessions.length} sessions</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── SEO ── */}
          <TabsContent value="seo" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPICard label="Organic Traffic" value={sessions.filter((s) => s.referrer?.includes("google") || s.referrer?.includes("bing") || s.referrer?.includes("yahoo")).length} sub="From search engines" icon={Search} color="blue" />
              <KPICard label="Direct Visits" value={sessions.filter((s) => !s.referrer?.trim()).length} sub="No referrer" icon={Globe} color="navy" />
              <KPICard label="Social / Referral" value={sessions.filter((s) => s.referrer?.trim() && !s.referrer.includes("google") && !s.referrer.includes("bing") && !s.referrer.includes("yahoo")).length} sub="From other websites" icon={Wifi} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Referrer table */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 text-sm">Top Traffic Sources</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Where visitors are coming from</p>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr><Th>Source</Th><Th>Visits</Th><Th>Share</Th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {referrerData.length === 0 ? (
                      <tr><td colSpan={3} className="text-center text-gray-400 text-sm py-10">No data yet</td></tr>
                    ) : referrerData.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800 truncate max-w-[200px]">{r.source}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{r.visits}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${sessions.length ? (r.visits / sessions.length) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-9 text-right">
                              {sessions.length ? ((r.visits / sessions.length) * 100).toFixed(0) : 0}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pages table */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 text-sm">Top Pages</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Most visited paths on the widget</p>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr><Th>Page Path</Th><Th>Views</Th><Th>Share</Th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pageData.length === 0 ? (
                      <tr><td colSpan={3} className="text-center text-gray-400 text-sm py-10">No data yet</td></tr>
                    ) : pageData.map((p, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono text-gray-700 truncate max-w-[200px]">{p.page}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{p.views}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                              <div
                                className="bg-[#1e3a5f] h-1.5 rounded-full"
                                style={{ width: `${sessions.length ? (p.views / sessions.length) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-9 text-right">
                              {sessions.length ? ((p.views / sessions.length) * 100).toFixed(0) : 0}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Language + Timezone breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard title="Visitor Languages" sub="Browser language settings">
                {sessions.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={Object.entries(
                        sessions.reduce((acc, s) => {
                          const lang = (s.language ?? "Unknown").split("-")[0].toUpperCase();
                          acc[lang] = (acc[lang] ?? 0) + 1; return acc;
                        }, {} as Record<string, number>)
                      ).map(([lang, count]) => ({ lang, count })).sort((a, b) => b.count - a.count).slice(0, 8)}
                      margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="lang" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Visitors" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </ChartCard>

              <ChartCard title="Screen Resolutions" sub="Top display sizes used by visitors">
                {sessions.length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(
                      sessions.reduce((acc, s) => {
                        const res = s.screenWidth && s.screenHeight ? `${s.screenWidth}×${s.screenHeight}` : "Unknown";
                        acc[res] = (acc[res] ?? 0) + 1; return acc;
                      }, {} as Record<string, number>)
                    ).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([res, count]) => (
                      <div key={res} className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-600 w-28 shrink-0">{res}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-[#1e3a5f] h-2 rounded-full transition-all" style={{ width: `${(count / sessions.length) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : <EmptyChart />}
              </ChartCard>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-[200px] flex items-center justify-center text-gray-300 text-sm">
      No data yet — visit the widget to record sessions
    </div>
  );
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

export function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === "1");

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  };

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  return <Dashboard onLogout={handleLogout} />;
}
