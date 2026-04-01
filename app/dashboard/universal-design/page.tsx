"use client";

// ─── Universal Design Audit Page ──────────────────────────────────────────────
// Route: /dashboard/universal-design

import { useState, useCallback } from "react";
import type { UDReport, UDPrincipleResult, UDCheckResult, Severity, CheckStatus } from "@/types/ud";
import { UD_PRINCIPLES } from "@/lib/ud-principles";
import { useUDScanProgress } from "@/hooks/use-api";

// ─── Colour helpers ───────────────────────────────────────────────────────────
const SEVERITY_COLORS: Record<Severity, { bg: string; text: string; label: string }> = {
  critical: { bg: "#2d0a0a", text: "#f87171", label: "Critical" },
  serious:  { bg: "#2d1a00", text: "#fb923c", label: "Serious" },
  moderate: { bg: "#2a2000", text: "#fbbf24", label: "Moderate" },
  minor:    { bg: "#0a1a2d", text: "#60a5fa", label: "Minor" },
};

const STATUS_CONFIG: Record<CheckStatus, { icon: string; color: string; label: string }> = {
  pass:   { icon: "✓", color: "#4ade80", label: "Pass" },
  fail:   { icon: "✗", color: "#f87171", label: "Fail" },
  manual: { icon: "◎", color: "#fbbf24", label: "Manual check" },
  na:     { icon: "—", color: "#64748b", label: "N/A" },
};

// ─── Score ring component ─────────────────────────────────────────────────────
function ScoreRing({
  score,
  size = 120,
  color,
  label,
}: {
  score: number;
  size?: number;
  color: string;
  label?: string;
}) {
  const r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const scoreColor = score >= 80 ? "#4ade80" : score >= 60 ? "#fbbf24" : "#f87171";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={label ? `${label}: ${score} out of 100` : `Score: ${score} out of 100`}
      >
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={scoreColor}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          fill={scoreColor}
          fontSize={size < 80 ? 16 : 24}
          fontWeight="700"
          fontFamily="system-ui"
          aria-hidden="true"
        >
          {score}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 14}
          textAnchor="middle"
          fill="#64748b"
          fontSize="10"
          fontFamily="system-ui"
          aria-hidden="true"
        >
          / 100
        </text>
      </svg>
      {label && (
        <div
          style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", maxWidth: size }}
          aria-hidden="true"
        >
          {label}
        </div>
      )}
    </div>
  );
}

// ─── Single check result row ──────────────────────────────────────────────────
function CheckRow({ result }: { result: UDCheckResult }) {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS_CONFIG[result.status];
  const sv = SEVERITY_COLORS[result.check.severity];

  return (
    <div style={{ borderBottom: "1px solid #0f172a" }}>
      <button
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "10px 12px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{ fontSize: 14, color: st.color, fontWeight: 700, minWidth: 16, marginTop: 1 }}
          aria-hidden="true"
        >
          {st.icon}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>
              {result.check.title}
            </span>
            <span className="sr-only">{st.label}</span>
            {result.status === "fail" && (
              <span
                style={{
                  fontSize: 10,
                  padding: "1px 6px",
                  borderRadius: 3,
                  background: sv.bg,
                  color: sv.text,
                }}
              >
                {sv.label}
              </span>
            )}
            {result.status === "manual" && (
              <span
                style={{
                  fontSize: 10,
                  padding: "1px 6px",
                  borderRadius: 3,
                  background: "#1e293b",
                  color: "#94a3b8",
                }}
              >
                Manual
              </span>
            )}
            {result.check.wcagRef && (
              <span style={{ fontSize: 10, color: "#64748b" }}>{result.check.wcagRef}</span>
            )}
            {result.count !== undefined && result.count > 0 && (
              <span
                style={{
                  fontSize: 10,
                  padding: "1px 6px",
                  borderRadius: 3,
                  background: "#2d0a0a",
                  color: "#f87171",
                }}
              >
                {result.count} instance{result.count > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {result.evidence && !expanded && (
            <div
              style={{
                fontSize: 11,
                color: "#64748b",
                marginTop: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 500,
              }}
            >
              {result.evidence}
            </div>
          )}
        </div>
        <span style={{ color: "#64748b", fontSize: 12, marginTop: 1, flexShrink: 0 }} aria-hidden="true">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div style={{ padding: "0 12px 14px 36px" }}>
          <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, marginBottom: 10 }}>
            {result.check.description}
          </div>
          {result.evidence && (
            <div style={{ marginBottom: 10 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 4,
                }}
              >
                Evidence
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#94a3b8",
                  background: "#080c18",
                  padding: "8px 10px",
                  borderRadius: 6,
                  wordBreak: "break-all",
                }}
              >
                {result.evidence}
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 4,
                }}
              >
                How to fix
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
                {result.check.howToFix}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 4,
                }}
              >
                How to test
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
                {result.check.howToTest}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Principle card ───────────────────────────────────────────────────────────
function PrincipleCard({ pr }: { pr: UDPrincipleResult }) {
  const [open, setOpen] = useState(false);
  const { principle, results, score, passed, failed, manual } = pr;
  const scoreColor = score >= 80 ? "#4ade80" : score >= 60 ? "#fbbf24" : "#f87171";

  return (
    <div style={{ border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`${principle.title}: score ${score}. ${passed} passed, ${failed} failed, ${manual} manual. ${open ? "Collapse" : "Expand"} checks.`}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 16px",
          background: "#0a0f1e",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {/* Principle number badge */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${principle.color}20`,
            border: `1px solid ${principle.color}40`,
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <span style={{ fontSize: 14, fontWeight: 700, color: principle.color }}>
            {principle.number}
          </span>
        </div>

        {/* Title and tagline */}
        <div style={{ flex: 1 }} aria-hidden="true">
          <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{principle.title}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>{principle.tagline}</div>
        </div>

        {/* Stats */}
        <div
          style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}
          aria-hidden="true"
        >
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: scoreColor }}>{score}</div>
            <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase" }}>score</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 10 }}>
            {passed > 0 && <span style={{ color: "#4ade80" }}>✓ {passed} pass</span>}
            {failed > 0 && <span style={{ color: "#f87171" }}>✗ {failed} fail</span>}
            {manual > 0 && <span style={{ color: "#fbbf24" }}>◎ {manual} manual</span>}
          </div>
          <span style={{ color: "#64748b", fontSize: 12 }}>{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div style={{ background: "#080c18", borderTop: "1px solid #1e293b" }}>
          {results.map((r) => (
            <CheckRow key={r.check.id} result={r} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UniversalDesignPage() {
  const [url, setUrl] = useState("");
  const [reportId, setReportId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"results" | "summary">("results");

  const { progress, status, report } = useUDScanProgress(reportId);
  const scanning = status === "PENDING" || status === "RUNNING";

  const handleScan = useCallback(async () => {
    if (!url.trim()) return;
    setError(null);
    setReportId(null);

    try {
      const res = await fetch("/api/ud-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start scan");
      setReportId(data.reportId);
    } catch (e: any) {
      setError(e.message);
    }
  }, [url]);

  function exportReport() {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const hostname = (() => { try { return new URL(report.url).hostname; } catch { return "site"; } })();
    a.download = `ud-report-${hostname}-${Date.now()}.json`;
    a.click();
  }

  const scoreColor = report
    ? report.overallScore >= 80
      ? "#4ade80"
      : report.overallScore >= 60
      ? "#fbbf24"
      : "#f87171"
    : "#64748b";

  return (
    <div className="p-8 max-w-6xl mx-auto overflow-x-hidden">
      {/* ─── Header ─── */}
      <div className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-50">
              Universal Design Audit
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-lg">
              Checks your site against all 7 Universal Design principles — beyond WCAG, into genuine
              human inclusivity.
            </p>
          </div>
          {report && (
            <button
              onClick={exportReport}
              className="text-sm px-4 py-2 rounded-lg border text-slate-300 hover:text-slate-100 hover:bg-surface-overlay transition-colors"
              style={{ borderColor: "var(--color-border)" }}
            >
              Export JSON ↓
            </button>
          )}
        </div>

        {/* Principles legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
          {UD_PRINCIPLES.map((p) => (
            <div key={p.id} className="flex items-center gap-1.5 text-xs text-slate-500">
              <div
                style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }}
                aria-hidden="true"
              />
              <span>
                P{p.number} {p.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── URL Input ─── */}
      <div
        className="bg-surface-raised border rounded-xl p-5 mb-6"
        style={{ borderColor: "var(--color-border)" }}
      >
        <label htmlFor="ud-url-input" className="block text-sm font-medium text-slate-300 mb-2">
          Website URL
        </label>
        <div className="flex gap-3 max-w-2xl">
          <input
            id="ud-url-input"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            placeholder="https://your-site.com"
            autoComplete="url"
            className="flex-1 px-4 py-2.5 rounded-lg bg-surface border text-slate-200 text-sm placeholder:text-slate-600"
            style={{ borderColor: "var(--color-border)" }}
            aria-describedby={error ? "ud-error" : undefined}
          />
          <button
            onClick={handleScan}
            disabled={scanning || !url.trim()}
            className="px-6 py-2.5 rounded-lg bg-brand-600 text-white font-semibold text-sm hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            aria-busy={scanning}
          >
            {scanning ? "Scanning…" : "Run UD Audit"}
          </button>
        </div>
      </div>

      {/* ─── Scanning progress ─── */}
      {scanning && (
        <div
          className="bg-surface-raised border rounded-2xl p-8 text-center mb-6"
          style={{ borderColor: "var(--color-border)" }}
          role="status"
          aria-live="polite"
        >
          <p className="text-sm text-slate-300 mb-4">
            {status === "PENDING" ? "Starting Universal Design audit…" : "Scanning for UD compliance…"}
          </p>
          <div className="w-full bg-surface-overlay rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-brand-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {error && (
        <div
          id="ud-error"
          className="bg-red-950/50 border border-red-800 rounded-2xl p-4 text-sm text-red-300 mb-6"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* ─── Results ─── */}
      {report && (
        <div className="overflow-y-auto space-y-4">
          {/* Summary row */}
          <div
            className="bg-surface-raised border rounded-xl p-5"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="flex flex-wrap gap-6 items-center">
              <ScoreRing
                score={report.overallScore}
                size={110}
                color={scoreColor}
                label="Overall UD score"
              />

              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Critical", count: report.summary.critical, color: "#f87171", bg: "#2d0a0a" },
                  { label: "Serious", count: report.summary.serious, color: "#fb923c", bg: "#2d1a00" },
                  { label: "Moderate", count: report.summary.moderate, color: "#fbbf24", bg: "#2a2000" },
                  { label: "Minor", count: report.summary.minor, color: "#60a5fa", bg: "#0a1a2d" },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{ padding: "12px", background: s.bg, borderRadius: 8, textAlign: "center" }}
                  >
                    <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.count}</div>
                    <div style={{ fontSize: 11, color: s.color, opacity: 0.8, marginTop: 2 }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Per-principle mini rings */}
              <div className="flex flex-wrap gap-3">
                {report.principleResults.map((pr) => (
                  <ScoreRing
                    key={pr.principle.id}
                    score={pr.score}
                    size={60}
                    color={pr.principle.color}
                    label={`P${pr.principle.number}`}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-4">
              Scanned:{" "}
              <span className="text-slate-400">{report.url}</span>
              {" · "}
              {new Date(report.scannedAt).toLocaleString()}
            </p>
          </div>

          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Report view"
            className="flex gap-1"
          >
            {(["results", "summary"] as const).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab
                    ? "bg-surface-overlay text-slate-100"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab === "results" ? "Detailed results" : "Summary"}
              </button>
            ))}
          </div>

          {/* Detailed results */}
          {activeTab === "results" && (
            <div role="tabpanel" aria-label="Detailed results">
              {report.principleResults.map((pr) => (
                <PrincipleCard key={pr.principle.id} pr={pr} />
              ))}
            </div>
          )}

          {/* Summary */}
          {activeTab === "summary" && (
            <div role="tabpanel" aria-label="Summary">
              <div
                className="bg-surface-raised border rounded-xl p-5 mb-4"
                style={{ borderColor: "var(--color-border)" }}
              >
                <h2 className="text-sm font-semibold text-slate-200 mb-3">Priority fixes</h2>
                {report.principleResults
                  .flatMap((pr) =>
                    pr.results
                      .filter((r) => r.status === "fail")
                      .sort((a, b) => {
                        const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
                        return order[a.check.severity] - order[b.check.severity];
                      })
                      .map((r) => {
                        const sv = SEVERITY_COLORS[r.check.severity];
                        return (
                          <div
                            key={r.check.id}
                            className="flex gap-3 items-start py-2 border-b"
                            style={{ borderColor: "var(--color-border)" }}
                          >
                            <span
                              style={{
                                fontSize: 10,
                                padding: "2px 6px",
                                borderRadius: 3,
                                background: sv.bg,
                                color: sv.text,
                                flexShrink: 0,
                                marginTop: 2,
                              }}
                            >
                              {sv.label}
                            </span>
                            <div>
                              <div className="text-sm text-slate-200">{r.check.title}</div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                P{pr.principle.number} {pr.principle.title}
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                {report.summary.totalIssues === 0 && (
                  <p className="text-sm text-green-400">
                    No automated failures detected. Review manual checks below.
                  </p>
                )}
              </div>

              <div
                className="bg-surface-raised border rounded-xl p-5"
                style={{ borderColor: "var(--color-border)" }}
              >
                <h2 className="text-sm font-semibold text-slate-200 mb-3">
                  Manual checks required
                </h2>
                {report.principleResults.flatMap((pr) =>
                  pr.results
                    .filter((r) => r.status === "manual")
                    .map((r) => (
                      <div
                        key={r.check.id}
                        className="py-2 border-b"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <div className="text-sm text-slate-200">{r.check.title}</div>
                        <div className="text-xs text-slate-500 mt-1">{r.evidence}</div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Empty state ─── */}
      {!report && !scanning && (
        <div
          className="bg-surface-raised border border-dashed rounded-2xl p-14 text-center"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "#1e293b" }}
            aria-hidden="true"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2 className="font-display text-lg font-bold text-slate-200 mb-2">
            Enter a URL to run a Universal Design audit
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Checks {UD_PRINCIPLES.reduce((a, p) => a + p.checks.length, 0)} criteria across all 7
            Universal Design principles. Goes beyond WCAG to test real human inclusivity.
          </p>
        </div>
      )}
    </div>
  );
}
