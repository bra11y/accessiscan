"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useReviewQueue, useSubmitReview } from "@/hooks/use-api";
import type { Issue, IssueSeverity } from "@/types";
import {
  Users,
  Send,
  Check,
  X,
  Camera,
  Globe,
  ChevronRight,
  Shield,
  Eye,
  Keyboard,
  Smartphone,
} from "lucide-react";

// ─── AT Testing Checklist ───
const AT_CHECKLIST = [
  { id: "voiceover", label: "VoiceOver (macOS/iOS)" },
  { id: "jaws", label: "JAWS (Windows)" },
  { id: "nvda", label: "NVDA (Windows)" },
  { id: "keyboard", label: "Keyboard-only" },
  { id: "zoom", label: "200% browser zoom" },
  { id: "motion", label: "prefers-reduced-motion" },
];

const SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string; dot: string; accent: string }> = {
  CRITICAL: { bg: "bg-red-950", text: "text-red-300", border: "border-red-900", dot: "bg-red-500", accent: "border-l-red-500" },
  SERIOUS: { bg: "bg-amber-950", text: "text-amber-300", border: "border-amber-900", dot: "bg-amber-500", accent: "border-l-amber-500" },
  MODERATE: { bg: "bg-blue-950", text: "text-blue-300", border: "border-blue-900", dot: "bg-blue-500", accent: "border-l-blue-500" },
  MINOR: { bg: "bg-slate-800", text: "text-slate-400", border: "border-slate-700", dot: "bg-slate-500", accent: "border-l-slate-500" },
};

function SeverityBadge({ severity }: { severity: string }) {
  const s = SEVERITY_STYLES[severity] || SEVERITY_STYLES.MINOR;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {severity}
    </span>
  );
}

// ─── Main Review Page ───

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState("PENDING");
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);

  // Form state
  const [feedback, setFeedback] = useState("");
  const [severityOverride, setSeverityOverride] = useState("");
  const [fixCode, setFixCode] = useState("");
  const [checklist, setChecklist] = useState<Set<string>>(new Set());
  const [successMsg, setSuccessMsg] = useState("");

  const liveRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLTextAreaElement>(null);

  const { data, loading, error, refetch } = useReviewQueue(activeTab);
  const { submitReview, loading: submitLoading } = useSubmitReview();

  const issues: any[] = data?.issues || [];
  const activeIssue = issues.find((i) => i.id === activeIssueId);

  const announce = useCallback((msg: string) => {
    if (liveRef.current) {
      liveRef.current.textContent = "";
      requestAnimationFrame(() => {
        if (liveRef.current) liveRef.current.textContent = msg;
      });
    }
  }, []);

  const openIssue = (id: string) => {
    setActiveIssueId(id);
    setFeedback("");
    setSeverityOverride("");
    setFixCode("");
    setChecklist(new Set());
    setSuccessMsg("");
    setTimeout(() => feedbackRef.current?.focus(), 200);
  };

  const toggleChecklist = (id: string) => {
    setChecklist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!activeIssue || feedback.trim().length < 10) return;

    try {
      // Prepend AT checklist to feedback
      const testedWith = Array.from(checklist)
        .map((id) => AT_CHECKLIST.find((at) => at.id === id)?.label)
        .filter(Boolean)
        .join(", ");

      const fullFeedback = testedWith
        ? `[Tested with: ${testedWith}]\n\n${feedback}`
        : feedback;

      await submitReview({
        issueId: activeIssue.id,
        feedback: fullFeedback,
        severity: severityOverride || undefined,
        fixCode: fixCode || undefined,
      });

      setSuccessMsg("Review submitted! Your client will be notified.");
      announce("Expert review submitted for: " + activeIssue.title);
      setFeedback("");
      setFixCode("");
      setSeverityOverride("");
      setChecklist(new Set());
      refetch();
    } catch {
      announce("Failed to submit review. Please try again.");
    }
  };

  const markResolved = async (issueId: string) => {
    try {
      await fetch("/api/issues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, status: "FIXED" }),
      });
      if (activeIssueId === issueId) setActiveIssueId(null);
      refetch();
      announce("Issue marked as resolved");
    } catch {
      announce("Failed to update issue");
    }
  };

  const stats = useMemo(() => {
    const pending = issues.filter((i) => !i.reviews || i.reviews.length === 0).length;
    const reviewed = issues.filter((i) => i.reviews && i.reviews.length > 0).length;
    return { pending, reviewed, total: issues.length };
  }, [issues]);

  return (
    <div className="p-8">
      {/* Live region */}
      <div ref={liveRef} aria-live="polite" aria-atomic="true" className="sr-only" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center">
          <Users size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-50 tracking-tight">
            Human Review Queue
          </h1>
          <p className="text-[13px] text-slate-500">
            Your expert workspace — test with assistive technology, write actionable feedback.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5" role="tablist" aria-label="Review queue filters">
        {[
          { id: "PENDING", label: "Pending Review", count: stats.pending, color: "text-amber-500" },
          { id: "COMPLETED", label: "Reviewed", count: stats.reviewed, color: "text-emerald-500" },
          { id: "all", label: "All", count: stats.total, color: "text-slate-400" },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setActiveIssueId(null);
              announce(`Showing ${tab.label}`);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border flex items-center gap-2 transition-all ${
              activeTab === tab.id
                ? "bg-brand-900/50 text-brand-300 border-brand-700"
                : "bg-surface-raised text-slate-500 border-transparent hover:border-slate-700"
            }`}
          >
            {tab.label}
            <span className={`font-mono text-[11px] font-bold ${tab.color}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-surface-raised border rounded-xl p-12 text-center" style={{ borderColor: "var(--color-border)" }}>
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading review queue...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div role="alert" className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
          <p className="text-sm text-red-300">{error}</p>
          <button onClick={refetch} className="mt-3 px-4 py-2 rounded-lg bg-red-800 text-white text-xs font-semibold">
            Retry
          </button>
        </div>
      )}

      {/* Main Layout */}
      {!loading && !error && (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: activeIssueId ? "380px 1fr" : "1fr",
            minHeight: "65vh",
          }}
        >
          {/* Queue List */}
          <div className="space-y-2.5" role="tabpanel">
            {issues.length === 0 && (
              <div className="bg-surface-raised border rounded-xl p-12 text-center" style={{ borderColor: "var(--color-border)" }}>
                <div className="w-12 h-12 rounded-xl bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                  <Check size={24} className="text-emerald-400" />
                </div>
                <p className="text-sm font-semibold text-emerald-200 mb-1">
                  {activeTab === "PENDING" ? "All caught up!" : "No reviews yet."}
                </p>
                <p className="text-xs text-slate-500">
                  {activeTab === "PENDING"
                    ? "No pending issues. Run a scan to populate your queue."
                    : "Complete some reviews to see them here."}
                </p>
              </div>
            )}

            {issues.map((issue: any) => {
              const isActive = activeIssueId === issue.id;
              const isReviewed = issue.reviews && issue.reviews.length > 0;
              const sevStyle = SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.MINOR;

              return (
                <article
                  key={issue.id}
                  onClick={() => openIssue(issue.id)}
                  onKeyDown={(e) => { if (e.key === "Enter") openIssue(issue.id); }}
                  tabIndex={0}
                  aria-label={`${issue.severity} issue: ${issue.title}. ${isReviewed ? "Reviewed" : "Pending"}.`}
                  className={`bg-surface-raised border rounded-xl p-4 cursor-pointer transition-all border-l-[3px] ${sevStyle.accent} ${
                    isActive ? "border-brand-600 bg-surface-overlay" : ""
                  }`}
                  style={{ borderColor: isActive ? undefined : "var(--color-border)" }}
                >
                  {/* Reviewed badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={issue.severity} />
                      <span className="font-mono text-[10px] text-slate-500">{issue.rule}</span>
                    </div>
                    {isReviewed && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[10px] font-semibold text-emerald-300">
                        <Check size={10} /> Reviewed
                      </span>
                    )}
                  </div>

                  <h3 className="text-[13px] font-bold text-slate-100 mb-1 leading-snug">{issue.title}</h3>
                  <p className="text-[11px] text-slate-500 mb-2 line-clamp-2 leading-relaxed">
                    {issue.description}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <Globe size={10} />
                      {issue.scan?.site?.name || "—"}
                    </span>
                    <span className="font-mono">{issue.pageUrl}</span>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Detail / Review Panel */}
          {activeIssue && (
            <div
              className="bg-surface-raised border rounded-xl flex flex-col overflow-hidden"
              style={{ borderColor: "var(--color-border)", maxHeight: "calc(100vh - 220px)" }}
            >
              {/* Panel header */}
              <div className="px-5 py-4 border-b flex-shrink-0" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex gap-1.5 mb-1.5">
                      <SeverityBadge severity={activeIssue.severity} />
                      <span className="font-mono text-[10px] text-slate-500 px-2 py-0.5 bg-surface-overlay rounded">
                        {activeIssue.rule}
                      </span>
                    </div>
                    <h2 className="text-base font-extrabold text-slate-50 leading-snug">
                      {activeIssue.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveIssueId(null)}
                    aria-label="Close panel"
                    className="text-slate-500 hover:text-slate-300 p-1"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
                <p className="text-[13px] text-slate-300 leading-relaxed">
                  {activeIssue.description}
                </p>

                {/* Site + Page */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-surface-overlay rounded-lg">
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-0.5">Site</p>
                    <p className="font-mono text-xs text-slate-400">{activeIssue.scan?.site?.url || "—"}</p>
                  </div>
                  <div className="p-2.5 bg-surface-overlay rounded-lg">
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-0.5">Page</p>
                    <p className="font-mono text-xs text-slate-400">{activeIssue.pageUrl}</p>
                  </div>
                </div>

                {/* Screenshot */}
                <div>
                  <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-1.5">Screenshot</p>
                  {activeIssue.page?.screenshotUrl ? (
                    <img
                      src={activeIssue.page.screenshotUrl}
                      alt={`Screenshot of ${activeIssue.pageUrl}`}
                      className="w-full rounded-lg border"
                      style={{ borderColor: "var(--color-border)" }}
                    />
                  ) : (
                    <div className="w-full h-36 bg-surface-overlay border border-dashed rounded-lg flex flex-col items-center justify-center" style={{ borderColor: "var(--color-border)" }}>
                      <Camera size={24} className="text-slate-700 mb-1.5" />
                      <span className="text-[11px] text-slate-600">Screenshot captured</span>
                      <span className="font-mono text-[10px] text-slate-700">{activeIssue.pageUrl}</span>
                    </div>
                  )}
                </div>

                {/* HTML Snippet */}
                <div>
                  <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-1.5">Element Code</p>
                  <pre className="px-3 py-2.5 bg-surface rounded-lg border font-mono text-[11px] text-amber-400 whitespace-pre-wrap break-all leading-relaxed" style={{ borderColor: "var(--color-border)" }}>
                    {activeIssue.htmlSnippet || activeIssue.element}
                  </pre>
                </div>

                {/* Auto fix */}
                {activeIssue.fixSuggestion && (
                  <div className="p-3 bg-surface-overlay/50 border rounded-lg" style={{ borderColor: "var(--color-border)" }}>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-1">Auto-Suggested Fix</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{activeIssue.fixSuggestion}</p>
                  </div>
                )}

                {/* Previous reviews */}
                {activeIssue.reviews?.length > 0 && (
                  <div>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-2">Previous Reviews</p>
                    {activeIssue.reviews.map((r: any) => (
                      <div key={r.id} className="p-3 bg-surface rounded-lg border-l-2 border-emerald-600 border mb-2" style={{ borderColor: "var(--color-border)", borderLeftColor: "#059669" }}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[11px] font-bold text-emerald-300">{r.reviewer?.name || "You"}</span>
                          <span className="font-mono text-[10px] text-slate-600">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{r.feedback}</p>
                        {r.fixCode && (
                          <pre className="mt-2 p-2 bg-surface-overlay rounded font-mono text-[10px] text-emerald-400 whitespace-pre-wrap">
                            {r.fixCode}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ─── Review Form ─── */}
                <div className="border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
                  <h3 className="text-sm font-extrabold text-slate-50 mb-3">
                    {activeIssue.reviews?.length > 0 ? "Add Follow-up Review" : "Write Your Expert Review"}
                  </h3>

                  {/* AT Checklist */}
                  <div className="mb-3">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-2">
                      Assistive Technology Tested
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {AT_CHECKLIST.map((at) => (
                        <label
                          key={at.id}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer border transition-all ${
                            checklist.has(at.id)
                              ? "bg-brand-900/50 text-brand-300 border-brand-700"
                              : "bg-surface-overlay text-slate-500 border-transparent hover:border-slate-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checklist.has(at.id)}
                            onChange={() => toggleChecklist(at.id)}
                            className="w-3 h-3 accent-brand-500"
                          />
                          {at.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Severity override */}
                  <div className="mb-3">
                    <label htmlFor="sev-override" className="block text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1">
                      Severity Assessment
                    </label>
                    <select
                      id="sev-override"
                      value={severityOverride}
                      onChange={(e) => setSeverityOverride(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-overlay border rounded-lg text-slate-200 text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <option value="">Keep as {activeIssue.severity}</option>
                      <option value="CRITICAL">Override → Critical</option>
                      <option value="SERIOUS">Override → Serious</option>
                      <option value="MODERATE">Override → Moderate</option>
                      <option value="MINOR">Override → Minor</option>
                    </select>
                  </div>

                  {/* Feedback */}
                  <div className="mb-3">
                    <label htmlFor="review-feedback" className="block text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1">
                      Expert Feedback *
                    </label>
                    <textarea
                      ref={feedbackRef}
                      id="review-feedback"
                      rows={4}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Describe what you tested, what you found, and what you recommend..."
                      className="w-full px-3 py-2.5 bg-surface-overlay border rounded-lg text-slate-200 text-[13px] leading-relaxed placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
                      style={{ borderColor: "var(--color-border)" }}
                    />
                    <p className={`font-mono text-[10px] mt-1 ${feedback.length >= 10 ? "text-emerald-500" : "text-slate-600"}`}>
                      {feedback.length}/10 min
                    </p>
                  </div>

                  {/* Code fix */}
                  <div className="mb-4">
                    <label htmlFor="fix-code" className="block text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1">
                      Suggested Code Fix (optional)
                    </label>
                    <textarea
                      id="fix-code"
                      rows={3}
                      value={fixCode}
                      onChange={(e) => setFixCode(e.target.value)}
                      placeholder="<!-- Before -->&#10;...&#10;&#10;<!-- After -->&#10;..."
                      className="w-full px-3 py-2.5 bg-surface border rounded-lg font-mono text-emerald-400 text-xs leading-relaxed placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
                      style={{ borderColor: "var(--color-border)" }}
                    />
                  </div>

                  {/* Success */}
                  {successMsg && (
                    <div role="status" className="p-3 bg-emerald-950 border border-emerald-800 rounded-lg mb-3">
                      <p className="text-xs font-semibold text-emerald-300">{successMsg}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmit}
                      disabled={submitLoading || feedback.trim().length < 10}
                      className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-brand-600 to-purple-700 text-white text-[13px] font-bold flex items-center gap-2 hover:from-brand-700 hover:to-purple-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-touch"
                    >
                      <Send size={14} />
                      {submitLoading ? "Submitting..." : "Submit Review"}
                    </button>
                    <button
                      onClick={() => markResolved(activeIssue.id)}
                      className="px-4 py-2.5 rounded-lg bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-600 min-touch"
                    >
                      <Check size={14} /> Resolved
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
