"use client";

import { useState, useRef, useCallback } from "react";
import { useStartScan, useScanProgress } from "@/hooks/use-api";
import Link from "next/link";
import {
  ScanLine,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Code2,
  RotateCcw,
  ChevronDown,
  Users,
  Shield,
} from "lucide-react";

// ─── Scan phases to display during progress ───
const SCAN_PHASES = [
  { label: "Resolving DNS", detail: "Connecting to server..." },
  { label: "Loading page", detail: "Waiting for DOM ready..." },
  { label: "Injecting axe-core", detail: "Preparing accessibility engine..." },
  { label: "Scanning landmarks", detail: "Checking <main>, <nav>, <header>..." },
  { label: "Checking images", detail: "Verifying alt text on all <img>..." },
  { label: "Testing contrast", detail: "Measuring WCAG 2.1 contrast ratios..." },
  { label: "Validating forms", detail: "Checking <label> associations..." },
  { label: "Testing keyboard", detail: "Verifying focus order and tab traps..." },
  { label: "Checking headings", detail: "Validating h1→h6 hierarchy..." },
  { label: "Analyzing ARIA", detail: "First Rule: prefer native HTML..." },
  { label: "Capturing screenshots", detail: "Saving evidence for human review..." },
  { label: "Classifying issues", detail: "Mapping to WCAG, ADA, Section 508..." },
  { label: "Calculating score", detail: "Weighting severity across criteria..." },
];

// ─── Severity colors ───
const SEVERITY_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  CRITICAL: { bg: "bg-red-950", text: "text-red-300", border: "border-red-900", dot: "bg-red-500" },
  SERIOUS: { bg: "bg-amber-950", text: "text-amber-300", border: "border-amber-900", dot: "bg-amber-500" },
  MODERATE: { bg: "bg-blue-950", text: "text-blue-300", border: "border-blue-900", dot: "bg-blue-500" },
  MINOR: { bg: "bg-slate-800", text: "text-slate-400", border: "border-slate-700", dot: "bg-slate-500" },
};

// ─── Score Ring ───
function ScoreRing({
  score,
  size = 160,
  label = "Overall",
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "#059669" : score >= 50 ? "#D97706" : "#DC2626";

  return (
    <div
      style={{ position: "relative", width: size, height: size }}
      role="img"
      aria-label={`Accessibility score: ${score} out of 100`}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#1a2340" strokeWidth="12"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-[1400ms] ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono font-extrabold leading-none"
          style={{ fontSize: size * 0.28, color }}
        >
          {score}
        </span>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── Severity Badge ───
function SeverityBadge({ severity }: { severity: string }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.MINOR;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {severity.toLowerCase()}
    </span>
  );
}

// ─── Main Scan Page ───
export default function ScanPage() {
  const [url, setUrl] = useState("");
  const [viewState, setViewState] = useState<"idle" | "scanning" | "complete" | "error">("idle");
  const [simulatedPhase, setSimulatedPhase] = useState(0);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [issueFilter, setIssueFilter] = useState("all");

  const { startScan, loading: scanLoading, error: scanError, scanId } = useStartScan();
  const { progress, status, result } = useScanProgress(scanId);

  const liveRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const announce = useCallback((msg: string) => {
    if (liveRef.current) {
      liveRef.current.textContent = "";
      requestAnimationFrame(() => {
        if (liveRef.current) liveRef.current.textContent = msg;
      });
    }
  }, []);

  // ─── Start Scan Handler ───
  const handleStartScan = async () => {
    if (!url.trim()) return;

    try {
      setViewState("scanning");
      announce(`Scan started for ${url}`);
      await startScan(url);

      // Simulate phase progression while real scan runs
      let phase = 0;
      const advancePhase = () => {
        if (phase >= SCAN_PHASES.length - 1) return;
        phase++;
        setSimulatedPhase(phase);
        setTimeout(advancePhase, 800 + Math.random() * 600);
      };
      advancePhase();
    } catch {
      setViewState("error");
      announce("Scan failed. Please check the URL and try again.");
    }
  };

  // Watch for real scan completion
  if (status === "COMPLETED" && viewState === "scanning") {
    setViewState("complete");
    setSimulatedPhase(SCAN_PHASES.length);
    announce(
      `Scan complete. ${result?.issueCount || 0} issues found across ${result?.pagesCount || 0} pages.`
    );
    setTimeout(() => resultRef.current?.focus(), 500);
  }

  if (status === "FAILED" && viewState === "scanning") {
    setViewState("error");
  }

  const handleReset = () => {
    setViewState("idle");
    setSimulatedPhase(0);
    setSelectedIssueId(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Filter issues from result
  const issues = result?.issues || [];
  const filteredIssues = issues.filter((i: any) => {
    if (issueFilter === "all") return true;
    if (issueFilter === "human") return i.needsHuman;
    return i.severity === issueFilter.toUpperCase();
  });

  const realProgress = viewState === "complete" ? 100 : Math.max(progress, (simulatedPhase / SCAN_PHASES.length) * 95);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Live region for screen readers */}
      <div
        ref={liveRef}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />

      {/* ─── Header ─── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center">
            <ScanLine size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-50 tracking-tight">
              Scan Website
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              WCAG 2.1 AA · ADA Title III · Section 508 · ARIA
            </p>
          </div>
        </div>
      </div>

      {/* ─── URL Input ─── */}
      <section className="bg-surface-raised border rounded-2xl p-7 mb-6" style={{ borderColor: "var(--color-border)" }}>
        <h2 className="text-[15px] font-bold text-slate-100 mb-1">
          Enter a URL to audit
        </h2>
        <p className="text-[13px] text-slate-500 mb-5">
          We&apos;ll crawl pages, run axe-core, capture screenshots, and flag issues for your review.
        </p>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <label htmlFor="scan-url" className="sr-only">
              Website URL
            </label>
            <Globe
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              id="scan-url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && viewState !== "scanning") handleStartScan();
              }}
              disabled={viewState === "scanning"}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface-overlay border text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>

          {viewState === "idle" || viewState === "error" ? (
            <button
              onClick={handleStartScan}
              disabled={!url.trim() || scanLoading}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-700 text-white text-sm font-bold flex items-center gap-2 hover:from-brand-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap min-touch"
            >
              <ScanLine size={16} />
              {scanLoading ? "Starting..." : "Start Scan"}
            </button>
          ) : viewState === "complete" ? (
            <button
              onClick={handleReset}
              className="px-7 py-3.5 rounded-xl border text-brand-300 text-sm font-bold flex items-center gap-2 hover:bg-surface-overlay focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all whitespace-nowrap min-touch"
              style={{ borderColor: "var(--color-border)" }}
            >
              <RotateCcw size={16} />
              New Scan
            </button>
          ) : null}
        </div>

        {/* Error */}
        {(viewState === "error" || scanError) && (
          <div role="alert" className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
            {scanError || "Scan failed. Please check the URL and try again."}
          </div>
        )}

        {/* Scan options tags */}
        {viewState === "idle" && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {["WCAG 2.1 AA", "ADA Title III", "Section 508", "ARIA Rules", "Screenshots"].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-overlay border text-[11px] text-slate-500 font-medium"
                style={{ borderColor: "var(--color-border)" }}
              >
                <CheckCircle2 size={10} className="text-emerald-500" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ─── Progress ─── */}
      {viewState === "scanning" && (
        <section
          className="bg-surface-raised border rounded-2xl p-7 mb-6"
          style={{ borderColor: "var(--color-border)" }}
          aria-label="Scan progress"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-[15px] font-bold text-slate-100">Scanning in progress</h3>
              <p className="font-mono text-xs text-slate-500 mt-0.5">{url}</p>
            </div>
            <span className="font-mono text-xl font-bold text-brand-400">
              {Math.round(realProgress)}%
            </span>
          </div>

          {/* Progress bar */}
          <div
            className="w-full h-2 bg-surface-overlay rounded-full overflow-hidden mb-6"
            role="progressbar"
            aria-valuenow={Math.round(realProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Scan progress: ${Math.round(realProgress)}%`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-600 via-purple-600 to-brand-400 transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${realProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
            </div>
          </div>

          {/* Phases */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            {SCAN_PHASES.map((phase, i) => {
              const isDone = i < simulatedPhase;
              const isActive = i === simulatedPhase;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 py-1.5 transition-opacity duration-300 ${
                    isDone ? "opacity-40" : isActive ? "opacity-100" : "opacity-15"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isDone
                        ? "bg-emerald-600"
                        : isActive
                        ? "bg-brand-600 ring-2 ring-brand-400/30"
                        : "bg-surface-overlay"
                    }`}
                  >
                    {isDone && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className={`text-xs ${isActive ? "font-semibold text-slate-200" : "text-slate-500"}`}>
                      {phase.label}
                    </p>
                    {isActive && (
                      <p className="font-mono text-[10px] text-brand-400 mt-px">{phase.detail}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── Results ─── */}
      {viewState === "complete" && result && (
        <div ref={resultRef} tabIndex={-1} className="outline-none">
          {/* Completion banner */}
          <div
            className="rounded-2xl p-4 mb-5 flex items-center justify-between border"
            style={{
              background: "linear-gradient(135deg, #052e16, #0d1424)",
              borderColor: "#14532d",
            }}
            role="status"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-200">Scan complete</p>
                <p className="text-xs text-emerald-400">
                  {result.issueCount} issues across {result.pagesCount} pages
                </p>
              </div>
            </div>
          </div>

          {/* Score Cards */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div
              className="bg-surface-raised border rounded-2xl p-7 flex flex-col items-center"
              style={{ borderColor: "var(--color-border)" }}
            >
              <ScoreRing score={result.score || 0} />
              <div className="flex gap-5 mt-5">
                {[
                  { label: "WCAG", val: result.wcagScore },
                  { label: "ADA", val: result.adaScore },
                  { label: "ARIA", val: result.ariaScore },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <p
                      className="font-mono text-lg font-bold"
                      style={{
                        color:
                          (item.val || 0) >= 70 ? "#059669" :
                          (item.val || 0) >= 50 ? "#D97706" : "#DC2626",
                      }}
                    >
                      {item.val || 0}%
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="bg-surface-raised border rounded-2xl p-7"
              style={{ borderColor: "var(--color-border)" }}
            >
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Total Issues", val: result.issueCount, color: "#D97706" },
                  { label: "Pages Scanned", val: result.pagesCount, color: "#3B82F6" },
                  { label: "Issues Fixed", val: result.fixedCount || 0, color: "#059669" },
                  { label: "Human Review", val: issues.filter((i: any) => i.needsHuman).length, color: "#6366F1" },
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="font-mono text-2xl font-extrabold" style={{ color: stat.color }}>
                      {stat.val}
                    </p>
                    <p className="text-[11px] text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Issues List */}
          <section
            className="bg-surface-raised border rounded-2xl overflow-hidden mb-10"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: "var(--color-border)" }}>
              <h3 className="text-sm font-bold text-slate-100">
                Issues ({filteredIssues.length})
              </h3>
              <div className="flex gap-1.5" role="group" aria-label="Filter issues">
                {[
                  { id: "all", label: "All" },
                  { id: "critical", label: "Critical" },
                  { id: "serious", label: "Serious" },
                  { id: "human", label: "Human Review" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setIssueFilter(f.id)}
                    aria-pressed={issueFilter === f.id}
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                      issueFilter === f.id
                        ? "bg-brand-900/50 text-brand-300 border-brand-700"
                        : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div role="list">
              {filteredIssues.map((issue: any, idx: number) => (
                <div key={issue.id} role="listitem">
                  <button
                    onClick={() =>
                      setSelectedIssueId(
                        selectedIssueId === issue.id ? null : issue.id
                      )
                    }
                    aria-expanded={selectedIssueId === issue.id}
                    className="w-full flex items-center gap-3 px-6 py-3.5 text-left transition-colors hover:bg-surface-overlay/30"
                    style={{
                      borderBottom:
                        idx < filteredIssues.length - 1 ? "1px solid #111a30" : "none",
                      background:
                        selectedIssueId === issue.id ? "#111a30" : "transparent",
                    }}
                  >
                    <SeverityBadge severity={issue.severity} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-200 truncate">
                        {issue.title}
                      </p>
                      <p className="font-mono text-[11px] text-slate-500 mt-px">
                        {issue.rule} · {issue.pageUrl}
                      </p>
                    </div>
                    {issue.needsHuman && (
                      <span className="px-2 py-0.5 rounded-md bg-brand-900/50 border border-brand-800 text-[10px] font-semibold text-brand-300 whitespace-nowrap">
                        Human Review
                      </span>
                    )}
                    <ChevronDown
                      size={16}
                      className={`text-slate-500 transition-transform ${
                        selectedIssueId === issue.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {selectedIssueId === issue.id && (
                    <div className="px-6 pb-5 bg-surface-overlay/30">
                      <div className="pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                        {/* Element */}
                        <div className="mb-3">
                          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1">
                            Element
                          </p>
                          <code className="block px-3.5 py-2.5 bg-surface rounded-lg font-mono text-xs text-amber-400 border break-all" style={{ borderColor: "var(--color-border)" }}>
                            {issue.element || issue.htmlSnippet}
                          </code>
                        </div>

                        {/* Fix suggestion */}
                        {issue.fixSuggestion && (
                          <div className="mb-3">
                            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1">
                              How to fix
                            </p>
                            <p className="text-[13px] text-slate-300 leading-relaxed">
                              {issue.fixSuggestion}
                            </p>
                          </div>
                        )}

                        {/* Human review flag */}
                        {issue.needsHuman && (
                          <div className="p-3 bg-brand-900/30 border border-brand-800 rounded-lg mb-3">
                            <p className="text-xs font-semibold text-brand-300">
                              Flagged for your expert review
                            </p>
                            <p className="text-[11px] text-brand-400/70 mt-0.5">
                              A screenshot has been added to your review queue.
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-600 min-touch">
                            <CheckCircle2 size={12} /> Mark Fixed
                          </button>
                          <button className="px-4 py-2 rounded-lg border text-slate-300 text-xs font-semibold hover:bg-surface-overlay min-touch" style={{ borderColor: "var(--color-border)" }}>
                            False Positive
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filteredIssues.length === 0 && (
                <div className="px-6 py-12 text-center text-slate-500 text-sm">
                  No issues match this filter.
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ─── Feature Cards (idle state) ─── */}
      {viewState === "idle" && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[
            { icon: <Shield size={22} className="text-brand-400" />, title: "Automated Engine", desc: "axe-core scans 50+ WCAG 2.1 AA criteria in seconds" },
            { icon: <Users size={22} className="text-brand-400" />, title: "Human Review", desc: "Screenshots queued for expert manual testing" },
            { icon: <Code2 size={22} className="text-brand-400" />, title: "Fix Suggestions", desc: "Every issue includes specific code fixes" },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-surface-raised border rounded-2xl p-6 text-center"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex justify-center mb-3">{item.icon}</div>
              <h3 className="text-sm font-bold text-slate-200 mb-1">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
