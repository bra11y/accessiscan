"use client";

// ─── Universal Design Audit Page ──────────────────────────────────────────────
// Drop into: app/universal-design/page.tsx
// Route: /universal-design
//
// Features:
//   - URL input + scan trigger
//   - Overall UD score ring
//   - All 7 principle scorecards
//   - Expandable check results per principle
//   - Manual vs automated check distinction
//   - Severity badges
//   - How-to-fix drawer
//   - Export report as JSON

import { useState, useCallback } from "react";
import type { UDReport, UDPrincipleResult, UDCheckResult, Severity, CheckStatus } from "@/types/ud";
import { UD_PRINCIPLES } from "@/lib/ud-principles";

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
  na:     { icon: "—", color: "#475569", label: "N/A" },
};

// ─── Score ring component ─────────────────────────────────────────────────────
function ScoreRing({ score, size = 120, color, label }: { score: number; size?: number; color: string; label?: string }) {
  const r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const scoreColor = score >= 80 ? "#4ade80" : score >= 60 ? "#fbbf24" : "#f87171";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={scoreColor}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text x={size/2} y={size/2 - 4} textAnchor="middle" fill={scoreColor} fontSize={size < 80 ? 16 : 24} fontWeight="700" fontFamily="system-ui">
          {score}
        </text>
        <text x={size/2} y={size/2 + 14} textAnchor="middle" fill="#475569" fontSize="10" fontFamily="system-ui">/ 100</text>
      </svg>
      {label && <div style={{ fontSize: 11, color: "#64748b", textAlign: "center", maxWidth: size }}>{label}</div>}
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
        style={{
          width: "100%", display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px",
          background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ fontSize: 14, color: st.color, fontWeight: 700, minWidth: 16, marginTop: 1 }}>{st.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{result.check.title}</span>
            {result.status === "fail" && (
              <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: sv.bg, color: sv.text }}>
                {sv.label}
              </span>
            )}
            {result.status === "manual" && (
              <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: "#1e293b", color: "#94a3b8" }}>
                Manual
              </span>
            )}
            {result.check.wcagRef && (
              <span style={{ fontSize: 10, color: "#334155" }}>{result.check.wcagRef}</span>
            )}
            {result.count !== undefined && result.count > 0 && (
              <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: "#2d0a0a", color: "#f87171" }}>
                {result.count} instance{result.count > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {result.evidence && !expanded && (
            <div style={{ fontSize: 11, color: "#475569", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 500 }}>
              {result.evidence}
            </div>
          )}
        </div>
        <span style={{ color: "#334155", fontSize: 12, marginTop: 1, flexShrink: 0 }}>{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div style={{ padding: "0 12px 14px 36px" }}>
          <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, marginBottom: 10 }}>
            {result.check.description}
          </div>
          {result.evidence && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                Evidence
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: "#94a3b8", background: "#080c18", padding: "8px 10px", borderRadius: 6, wordBreak: "break-all" }}>
                {result.evidence}
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                How to fix
              </div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{result.check.howToFix}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                How to test
              </div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{result.check.howToTest}</div>
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
      {/* Card header */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
          background: "#0a0f1e", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        {/* Principle number badge */}
        <div style={{
          width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
          background: `${principle.color}20`, border: `1px solid ${principle.color}40`, flexShrink: 0,
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: principle.color }}>{principle.number}</span>
        </div>

        {/* Title and tagline */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{principle.title}</div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 1 }}>{principle.tagline}</div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: scoreColor }}>{score}</div>
            <div style={{ fontSize: 9, color: "#334155", textTransform: "uppercase" }}>score</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 10 }}>
            {passed > 0 && <span style={{ color: "#4ade80" }}>✓ {passed} pass</span>}
            {failed > 0 && <span style={{ color: "#f87171" }}>✗ {failed} fail</span>}
            {manual > 0 && <span style={{ color: "#fbbf24" }}>◎ {manual} manual</span>}
          </div>
          <span style={{ color: "#334155", fontSize: 12 }}>{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Expanded checks */}
      {open && (
        <div style={{ background: "#080c18", borderTop: "1px solid #1e293b" }}>
          {results.map((r) => <CheckRow key={r.check.id} result={r} />)}
        </div>
      )}
    </div>
  );
}

// ─── Demo/placeholder report for UI preview ───────────────────────────────────
function buildDemoReport(url: string): UDReport {
  const statuses: CheckStatus[] = ["pass", "fail", "manual", "pass", "fail", "manual"];
  return {
    url,
    scannedAt: new Date().toISOString(),
    overallScore: 62,
    summary: { critical: 3, serious: 5, moderate: 4, minor: 1, totalIssues: 13 },
    principleResults: UD_PRINCIPLES.map((principle, pi) => {
      const results = principle.checks.map((check, ci) => ({
        check,
        status: statuses[(pi + ci) % statuses.length] as CheckStatus,
        evidence: statuses[(pi + ci) % statuses.length] === "fail"
          ? "Automated check found issues on this page. See how-to-fix for remediation steps."
          : statuses[(pi + ci) % statuses.length] === "manual"
          ? "This check requires manual verification. See how-to-test for steps."
          : undefined,
        count: statuses[(pi + ci) % statuses.length] === "fail" ? Math.floor(Math.random() * 5) + 1 : undefined,
      }));
      const passed = results.filter((r) => r.status === "pass").length;
      const failed = results.filter((r) => r.status === "fail").length;
      const manual = results.filter((r) => r.status === "manual").length;
      const score = Math.round((passed / results.length) * 100);
      return { principle, results, score, passed, failed, manual };
    }),
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UniversalDesignPage() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [phase, setPhase] = useState("");
  const [report, setReport] = useState<UDReport | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"results" | "summary">("results");

  const SCAN_PHASES = [
    "Loading page…",
    "Checking equitable use…",
    "Auditing flexibility…",
    "Testing simplicity…",
    "Scanning perceptible info…",
    "Evaluating error tolerance…",
    "Measuring physical effort…",
    "Checking size & space…",
    "Building report…",
  ];

  const startScan = useCallback(async () => {
    if (!url.trim()) return;
    setScanning(true);
    setError("");
    setReport(null);

    // Animate scan phases
    let i = 0;
    const interval = setInterval(() => {
      setPhase(SCAN_PHASES[i % SCAN_PHASES.length]);
      i++;
    }, 600);

    try {
      const res = await fetch("/api/ud-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      clearInterval(interval);
      if (!res.ok) throw new Error(data.error || "Scan failed");
      setReport(data.report);
    } catch (err: any) {
      clearInterval(interval);
      // In development/demo mode, show a demo report
      if (process.env.NODE_ENV === "development") {
        setReport(buildDemoReport(url));
      } else {
        setError(err.message || "Scan failed. Please check the URL and try again.");
      }
    } finally {
      setScanning(false);
      setPhase("");
    }
  }, [url]);

  function exportReport() {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ud-report-${new URL(report.url).hostname}-${Date.now()}.json`;
    a.click();
  }

  const scoreColor = report
    ? report.overallScore >= 80 ? "#4ade80" : report.overallScore >= 60 ? "#fbbf24" : "#f87171"
    : "#334155";

  return (
    <div style={{ minHeight: "100vh", background: "#080c18", color: "#e2e8f0", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Header */}
      <header style={{ borderBottom: "1px solid #1e293b", padding: "20px 28px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>
              Universal Design Audit
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#475569", maxWidth: 520 }}>
              Checks your site against all 7 Universal Design principles — beyond WCAG, into genuine human inclusivity.
            </p>
          </div>
          {report && (
            <button
              onClick={exportReport}
              style={{ fontSize: 12, padding: "8px 16px", background: "#0f172a", color: "#94a3b8", border: "1px solid #1e293b", borderRadius: 8, cursor: "pointer" }}
            >
              Export JSON ↓
            </button>
          )}
        </div>

        {/* Principles legend */}
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          {UD_PRINCIPLES.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#475569" }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
              <span>P{p.number} {p.title}</span>
            </div>
          ))}
        </div>
      </header>

      {/* URL input */}
      <div style={{ padding: "20px 28px", borderBottom: "1px solid #1e293b" }}>
        <div style={{ display: "flex", gap: 10, maxWidth: 700 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startScan()}
              placeholder="https://your-site.com"
              style={{
                width: "100%", padding: "10px 14px", background: "#0a0f1e", border: "1px solid #1e293b",
                borderRadius: 8, color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box",
              }}
              aria-label="Website URL to audit"
            />
          </div>
          <button
            onClick={startScan}
            disabled={scanning || !url.trim()}
            style={{
              padding: "10px 24px", background: scanning ? "#1e293b" : "#6366f1", color: scanning ? "#475569" : "#fff",
              border: "none", borderRadius: 8, cursor: scanning ? "default" : "pointer", fontSize: 14, fontWeight: 500,
              whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            {scanning ? "Scanning…" : "Run UD Audit"}
          </button>
        </div>

        {/* Scanning status */}
        {scanning && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", gap: 3 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 6, height: 6, borderRadius: "50%", background: "#6366f1",
                    animation: `pulse 1.2s ${i * 0.2}s infinite ease-in-out`,
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: 13, color: "#475569" }}>{phase}</span>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 10, padding: "8px 12px", background: "#2d0a0a", borderRadius: 6, fontSize: 12, color: "#f87171" }}>
            {error}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
      `}</style>

      {/* Results */}
      {report && (
        <div style={{ padding: "24px 28px" }}>

          {/* Summary row */}
          <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 28, flexWrap: "wrap" }}>
            <ScoreRing score={report.overallScore} size={110} color={scoreColor} label="Overall UD score" />

            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
              {[
                { label: "Critical", count: report.summary.critical, color: "#f87171", bg: "#2d0a0a" },
                { label: "Serious", count: report.summary.serious, color: "#fb923c", bg: "#2d1a00" },
                { label: "Moderate", count: report.summary.moderate, color: "#fbbf24", bg: "#2a2000" },
                { label: "Minor", count: report.summary.minor, color: "#60a5fa", bg: "#0a1a2d" },
              ].map((s) => (
                <div key={s.label} style={{ padding: "12px", background: s.bg, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.count}</div>
                  <div style={{ fontSize: 11, color: s.color, opacity: 0.7, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Principle score mini-rings */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {report.principleResults.map((pr) => (
                <ScoreRing key={pr.principle.id} score={pr.score} size={60} color={pr.principle.color} label={`P${pr.principle.number}`} />
              ))}
            </div>
          </div>

          {/* Scanned URL */}
          <div style={{ marginBottom: 20, fontSize: 12, color: "#334155" }}>
            Scanned: <span style={{ color: "#475569" }}>{report.url}</span> &nbsp;·&nbsp; {new Date(report.scannedAt).toLocaleString()}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
            {(["results", "summary"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "7px 16px", fontSize: 13, fontWeight: 500, borderRadius: 6, border: "none", cursor: "pointer",
                  background: activeTab === tab ? "#1e293b" : "transparent",
                  color: activeTab === tab ? "#f1f5f9" : "#475569",
                }}
              >
                {tab === "results" ? "Detailed results" : "Summary"}
              </button>
            ))}
          </div>

          {/* Detailed results — all 7 principle cards */}
          {activeTab === "results" && (
            <div>
              {report.principleResults.map((pr) => <PrincipleCard key={pr.principle.id} pr={pr} />)}
            </div>
          )}

          {/* Summary tab — what needs doing */}
          {activeTab === "summary" && (
            <div>
              <div style={{ marginBottom: 16, padding: "14px 16px", background: "#0a0f1e", borderRadius: 10, border: "1px solid #1e293b" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 8 }}>Priority fixes</div>
                {report.principleResults.flatMap((pr) =>
                  pr.results
                    .filter((r) => r.status === "fail")
                    .sort((a, b) => {
                      const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
                      return order[a.check.severity] - order[b.check.severity];
                    })
                    .map((r) => {
                      const sv = SEVERITY_COLORS[r.check.severity];
                      return (
                        <div key={r.check.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid #0f172a" }}>
                          <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: sv.bg, color: sv.text, flexShrink: 0, marginTop: 2 }}>
                            {sv.label}
                          </span>
                          <div>
                            <div style={{ fontSize: 13, color: "#e2e8f0" }}>{r.check.title}</div>
                            <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>P{pr.principle.number} {pr.principle.title}</div>
                          </div>
                        </div>
                      );
                    })
                )}
                {report.summary.totalIssues === 0 && (
                  <div style={{ fontSize: 13, color: "#4ade80" }}>No automated failures detected. Review manual checks above.</div>
                )}
              </div>

              <div style={{ padding: "14px 16px", background: "#0a0f1e", borderRadius: 10, border: "1px solid #1e293b" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 8 }}>Manual checks required</div>
                {report.principleResults.flatMap((pr) =>
                  pr.results
                    .filter((r) => r.status === "manual")
                    .map((r) => (
                      <div key={r.check.id} style={{ padding: "8px 0", borderBottom: "1px solid #0f172a" }}>
                        <div style={{ fontSize: 13, color: "#e2e8f0" }}>{r.check.title}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{r.evidence}</div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!report && !scanning && (
        <div style={{ padding: "60px 28px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⬡</div>
          <div style={{ fontSize: 16, color: "#334155", marginBottom: 6 }}>Enter a URL above to run a Universal Design audit</div>
          <div style={{ fontSize: 13, color: "#1e293b", maxWidth: 420, margin: "0 auto" }}>
            Checks {UD_PRINCIPLES.reduce((a, p) => a + p.checks.length, 0)} criteria across all 7 Universal Design principles.
            Goes beyond WCAG to test real human inclusivity.
          </div>
        </div>
      )}
    </div>
  );
}
