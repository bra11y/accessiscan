"use client";

import { useScans } from "@/hooks/use-api";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from "recharts";

// ─── Helpers ───────────────────────────────────────────────────────────────

function scoreColor(n: number) {
  if (n >= 80) return "#4ade80";
  if (n >= 50) return "#fbbf24";
  return "#f87171";
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#f87171",
  SERIOUS: "#fb923c",
  MODERATE: "#fbbf24",
  MINOR: "#60a5fa",
};

// ─── Stat card ──────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, color, href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  href?: string;
}) {
  const inner = (
    <div
      className="bg-surface-raised border rounded-2xl p-5 backdrop-blur-sm transition-all duration-200 hover:bg-surface-overlay/30 h-full"
      style={{ borderColor: "var(--color-border)" }}
    >
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p
        className="font-mono text-3xl font-extrabold mb-1 tracking-tight"
        style={{ color: color ?? "var(--color-text-primary)" }}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full focus-visible:ring-2 focus-visible:ring-brand-400 rounded-2xl">
      {inner}
    </Link>
  ) : (
    inner
  );
}

// ─── Date preset helpers ────────────────────────────────────────────────────

function getPresetRange(preset: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split("T")[0];
  if (preset === "7d") {
    const from = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];
    return { from, to };
  }
  if (preset === "30d") {
    const from = new Date(now.getTime() - 30 * 86400000).toISOString().split("T")[0];
    return { from, to };
  }
  return { from: "", to: "" };
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, loading } = useScans();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activePreset, setActivePreset] = useState<string>("all");

  function applyPreset(preset: string) {
    setActivePreset(preset);
    if (preset === "all") {
      setFromDate("");
      setToDate("");
    } else {
      const { from, to } = getPresetRange(preset);
      setFromDate(from);
      setToDate(to);
    }
  }

  const allScans = data?.scans ?? [];

  // Filter by date range
  const filteredScans = useMemo(() => {
    return allScans.filter((s: any) => {
      const d = new Date(s.createdAt);
      if (fromDate && d < new Date(fromDate)) return false;
      if (toDate && d > new Date(toDate + "T23:59:59")) return false;
      return true;
    });
  }, [allScans, fromDate, toDate]);

  // Most recent completed scan
  const latestScan = allScans.find((s: any) => s.status === "COMPLETED");

  // Stats from latest scan
  const overallScore = latestScan?.score ?? null;
  const wcagScore = latestScan?.wcagScore ?? null;
  const adaScore = latestScan?.adaScore ?? null;
  const ariaScore = latestScan?.ariaScore ?? null;

  // Group filtered scans by site — most recent per site
  const bySite = useMemo(() => {
    const map = new Map<string, any>();
    for (const s of filteredScans) {
      const key = s.site?.url ?? s.siteId;
      if (!map.has(key) || new Date(s.createdAt) > new Date(map.get(key).createdAt)) {
        map.set(key, s);
      }
    }
    return Array.from(map.values());
  }, [filteredScans]);

  // Score trend for line chart (last 10 completed scans, chronological)
  const trendData = useMemo(() => {
    return [...allScans]
      .filter((s: any) => s.status === "COMPLETED" && s.score != null)
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-10)
      .map((s: any) => ({
        date: new Date(s.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" }),
        Overall: s.score,
        WCAG: s.wcagScore,
        ADA: s.adaScore,
      }));
  }, [allScans]);

  // Issue breakdown donut (latest scan)
  const issueBreakdown = useMemo(() => {
    if (!latestScan?.issues) return [];
    const counts: Record<string, number> = { CRITICAL: 0, SERIOUS: 0, MODERATE: 0, MINOR: 0 };
    for (const issue of latestScan.issues) {
      counts[issue.severity] = (counts[issue.severity] ?? 0) + 1;
    }
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [latestScan]);

  // Per-standard bar chart
  const standardData = latestScan
    ? [
        { standard: "WCAG", score: latestScan.wcagScore ?? 0 },
        { standard: "ADA", score: latestScan.adaScore ?? 0 },
        { standard: "ARIA", score: latestScan.ariaScore ?? 0 },
      ]
    : [];

  const tooltipStyle = {
    contentStyle: {
      background: "#0f172a",
      border: "1px solid #1e293b",
      borderRadius: 8,
      color: "#f8fafc",
      fontSize: 12,
    },
  };

  return (
    <div className="p-8 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-50 tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Automated + Human-Powered Accessibility Auditing
        </p>
      </div>

      {/* Stats Card Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Overall Score"
          value={overallScore ?? "—"}
          sub={overallScore == null ? "Run your first scan" : "Latest scan"}
          color={overallScore != null ? scoreColor(overallScore) : "#D97706"}
        />
        <StatCard
          label="WCAG Score"
          value={wcagScore ?? "—"}
          sub="WCAG 2.1 AA"
          color={wcagScore != null ? scoreColor(wcagScore) : "#64748b"}
        />
        <StatCard
          label="ADA Score"
          value={adaScore ?? "—"}
          sub="ADA Title III"
          color={adaScore != null ? scoreColor(adaScore) : "#64748b"}
        />
        <StatCard
          label="ARIA Score"
          value={ariaScore ?? "—"}
          sub="ARIA best practices"
          color={ariaScore != null ? scoreColor(ariaScore) : "#64748b"}
        />
        <StatCard
          label="Critical Issues"
          value={latestScan?.issueCount ?? 0}
          sub="Latest scan"
          color="#f87171"
          href="/dashboard/issues?severity=CRITICAL"
        />
        <StatCard
          label="Pages Scanned"
          value={allScans.reduce((a: number, s: any) => a + (s.pagesCount ?? 0), 0)}
          sub="All time"
          color="#818cf8"
        />
        <StatCard
          label="Human Reviews"
          value="—"
          sub="Pending review"
          color="#6366F1"
          href="/dashboard/reviews"
        />
        <StatCard
          label="Total Scans"
          value={allScans.length}
          sub="All time"
          color="#94a3b8"
        />
      </div>

      {/* Charts */}
      {allScans.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Score Trend Line Chart */}
          {trendData.length >= 2 && (
            <div
              className="lg:col-span-2 bg-surface-raised border rounded-2xl p-5 backdrop-blur-sm"
              style={{ borderColor: "var(--color-border)" }}
            >
              <h2 className="text-base font-bold text-slate-300 mb-4 tracking-tight">
                Score Trend
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="Overall" stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="WCAG" stroke="#4ade80" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="ADA" stroke="#fbbf24" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Issue Breakdown Donut */}
          {issueBreakdown.length > 0 && (
            <div
              className="bg-surface-raised border rounded-2xl p-5 backdrop-blur-sm"
              style={{ borderColor: "var(--color-border)" }}
            >
              <h2 className="text-base font-bold text-slate-300 mb-4 tracking-tight">
                Issue Breakdown
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={issueBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {issueBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: "#94a3b8", fontSize: 11 }}>{value}</span>
                    )}
                  />
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Per-Standard Bar Chart */}
          {standardData.length > 0 && (
            <div
              className="lg:col-span-3 bg-surface-raised border rounded-2xl p-5 backdrop-blur-sm"
              style={{ borderColor: "var(--color-border)" }}
            >
              <h2 className="text-base font-bold text-slate-300 mb-4 tracking-tight">
                Standards Breakdown
              </h2>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={standardData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis dataKey="standard" type="category" tick={{ fill: "#94a3b8", fontSize: 12 }} width={60} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {standardData.map((entry) => (
                      <Cell key={entry.standard} fill={scoreColor(entry.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {allScans.length === 0 && !loading && (
        <div
          className="bg-surface-raised border border-dashed rounded-2xl p-12 text-center mb-8"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-900/40 mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-slate-100 mb-2 tracking-tight">
            Run your first accessibility scan
          </h2>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            Enter any URL to check it against WCAG 2.1 AA, ADA, and ARIA standards.
          </p>
          <Link
            href="/dashboard/scan"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-sm hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all min-touch"
          >
            Start Scanning
          </Link>
        </div>
      )}

      {/* Date Range Filter + Recent Scans */}
      {allScans.length > 0 && (
        <section
          className="bg-surface-raised border rounded-2xl"
          style={{ borderColor: "var(--color-border)" }}
          aria-label="Recent scans"
        >
          {/* Filter bar */}
          <div
            className="px-6 py-4 border-b flex flex-wrap items-center gap-3"
            style={{ borderColor: "var(--color-border)" }}
          >
            <h2 className="text-base font-bold text-slate-300 mr-2 tracking-tight">
              Recent Scans
            </h2>
            <div className="flex gap-1.5" role="group" aria-label="Date range presets">
              {[
                { label: "Last 7 days", id: "7d" },
                { label: "Last 30 days", id: "30d" },
                { label: "All time", id: "all" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  aria-pressed={activePreset === p.id}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    activePreset === p.id
                      ? "bg-brand-600/30 text-brand-300 border border-brand-600/50"
                      : "text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <label htmlFor="filter-from" className="sr-only">From date</label>
              <input
                id="filter-from"
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setActivePreset(""); }}
                className="bg-surface-overlay border rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                style={{ borderColor: "var(--color-border)" }}
                aria-label="Filter from date"
              />
              <span className="text-xs text-slate-500" aria-hidden="true">to</span>
              <label htmlFor="filter-to" className="sr-only">To date</label>
              <input
                id="filter-to"
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setActivePreset(""); }}
                className="bg-surface-overlay border rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                style={{ borderColor: "var(--color-border)" }}
                aria-label="Filter to date"
              />
            </div>
          </div>

          {/* Scan list grouped by site */}
          <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
            {bySite.length === 0 ? (
              <p className="px-6 py-8 text-sm text-slate-500 text-center">
                No scans found for this date range.
              </p>
            ) : (
              bySite.map((scan: any) => (
                <Link
                  key={scan.id}
                  href={`/dashboard/issues?scanId=${scan.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-surface-overlay/50 transition-colors"
                >
                  <div>
                    <p className="text-base font-medium text-slate-200">
                      {scan.site?.name || scan.site?.url}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Last scanned{" "}
                      {formatDistanceToNow(new Date(scan.createdAt), { addSuffix: true })}
                      {" · "}
                      {scan._count?.issues ?? 0} issues
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className="font-mono text-lg font-bold"
                      style={{ color: scan.score != null ? scoreColor(scan.score) : "#64748b" }}
                    >
                      {scan.score ?? "—"}
                    </span>
                    <p className="text-[10px] text-slate-500 uppercase">Score</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
