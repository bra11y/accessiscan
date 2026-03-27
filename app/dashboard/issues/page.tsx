"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useIssues } from "@/hooks/use-api";
import type { Issue, IssueSeverity, IssueStatus } from "@/types";
import {
  AlertTriangle,
  Search,
  ChevronDown,
  Check,
  Users,
  X,
  Eye,
  Send,
  Filter,
} from "lucide-react";

// ─── Constants ───

const SEVERITY_ORDER: Record<string, number> = {
  CRITICAL: 0, SERIOUS: 1, MODERATE: 2, MINOR: 3,
};

const SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  CRITICAL: { bg: "bg-red-950", text: "text-red-300", border: "border-red-900", dot: "bg-red-500" },
  SERIOUS:  { bg: "bg-amber-950", text: "text-amber-300", border: "border-amber-900", dot: "bg-amber-500" },
  MODERATE: { bg: "bg-blue-950", text: "text-blue-300", border: "border-blue-900", dot: "bg-blue-500" },
  MINOR:    { bg: "bg-slate-800", text: "text-slate-400", border: "border-slate-700", dot: "bg-slate-500" },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  OPEN:           { bg: "bg-red-950", text: "text-red-300", label: "Open", dot: "bg-red-500" },
  IN_REVIEW:      { bg: "bg-purple-950", text: "text-purple-300", label: "In Review", dot: "bg-purple-500" },
  FIXED:          { bg: "bg-emerald-950", text: "text-emerald-300", label: "Fixed", dot: "bg-emerald-500" },
  WONT_FIX:       { bg: "bg-slate-800", text: "text-slate-400", label: "Won't Fix", dot: "bg-slate-500" },
  FALSE_POSITIVE: { bg: "bg-slate-800", text: "text-slate-400", label: "False Positive", dot: "bg-slate-500" },
};

// ─── Badge Components ───

function SeverityBadge({ severity }: { severity: string }) {
  const s = SEVERITY_STYLES[severity] || SEVERITY_STYLES.MINOR;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.OPEN;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {s.label}
    </span>
  );
}

// ─── Main Issues Page ───

export default function IssuesPage() {
  // ─── Filters (sent to API) ───
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterHuman, setFilterHuman] = useState(false);
  const [page, setPage] = useState(1);

  // ─── Local UI state ───
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState("severity");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [bulkLoading, setBulkLoading] = useState(false);

  const liveRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((msg: string) => {
    if (liveRef.current) {
      liveRef.current.textContent = "";
      requestAnimationFrame(() => {
        if (liveRef.current) liveRef.current.textContent = msg;
      });
    }
  }, []);

  // ─── Fetch issues from API ───
  const { data, loading, error, refetch } = useIssues({
    severity: filterSeverity || undefined,
    status: filterStatus || undefined,
    needsHuman: filterHuman || undefined,
    page,
  });

  const issues: Issue[] = data?.issues || [];
  const pagination = data?.pagination;

  // ─── Client-side search + sort (API handles the primary filters) ───
  const displayIssues = useMemo(() => {
    let list = [...issues];

    // Client-side search across multiple fields
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.rule.toLowerCase().includes(q) ||
          i.pageUrl?.toLowerCase().includes(q) ||
          i.element?.toLowerCase().includes(q)
      );
    }

    // Client-side sorting
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "severity")
        cmp = (SEVERITY_ORDER[a.severity] || 9) - (SEVERITY_ORDER[b.severity] || 9);
      else if (sortField === "title") cmp = a.title.localeCompare(b.title);
      else if (sortField === "rule") cmp = a.rule.localeCompare(b.rule);
      else if (sortField === "page") cmp = (a.pageUrl || "").localeCompare(b.pageUrl || "");
      else if (sortField === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [issues, searchQuery, sortField, sortDir]);

  // ─── Selection ───
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === displayIssues.length) {
      setSelectedIds(new Set());
      announce("All deselected");
    } else {
      setSelectedIds(new Set(displayIssues.map((i) => i.id)));
      announce(`${displayIssues.length} issues selected`);
    }
  };

  // ─── Bulk Action ───
  const bulkAction = async (status: IssueStatus) => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);

    try {
      const res = await fetch("/api/issues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueIds: Array.from(selectedIds),
          status,
        }),
      });

      if (!res.ok) throw new Error("Bulk update failed");

      const data = await res.json();
      announce(`${data.updated} issue(s) updated`);
      setSelectedIds(new Set());
      refetch();
    } catch {
      announce("Failed to update issues. Please try again.");
    } finally {
      setBulkLoading(false);
    }
  };

  // ─── Single Issue Action ───
  const updateIssue = async (issueId: string, status: IssueStatus) => {
    try {
      await fetch("/api/issues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, status }),
      });
      refetch();
      announce(`Issue updated to ${status.replace("_", " ").toLowerCase()}`);
    } catch {
      announce("Failed to update issue");
    }
  };

  // ─── Sort ───
  const handleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortArrow = (field: string) => {
    if (sortField !== field) return "↕";
    return sortDir === "asc" ? "↑" : "↓";
  };

  // ─── Stats ───
  const stats = useMemo(
    () => ({
      total: pagination?.total || issues.length,
      open: issues.filter((i) => i.status === "OPEN").length,
      critical: issues.filter((i) => i.severity === "CRITICAL" && i.status !== "FIXED").length,
      human: issues.filter((i) => i.needsHuman && i.status !== "FIXED").length,
      fixed: issues.filter((i) => i.status === "FIXED").length,
    }),
    [issues, pagination]
  );

  return (
    <div className="p-8 max-w-[1100px] mx-auto">
      {/* Live region */}
      <div ref={liveRef} aria-live="polite" aria-atomic="true" className="sr-only" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-slate-50 tracking-tight">Issues</h1>
        <p className="text-[13px] text-slate-500 mt-1">Manage, triage, and resolve accessibility barriers across all scanned pages.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-5 gap-2.5 mb-5">
        {[
          { label: "Total", value: stats.total, color: "text-slate-400" },
          { label: "Open", value: stats.open, color: "text-amber-500" },
          { label: "Critical", value: stats.critical, color: "text-red-500" },
          { label: "Human Review", value: stats.human, color: "text-purple-400" },
          { label: "Fixed", value: stats.fixed, color: "text-emerald-500" },
        ].map((s, i) => (
          <div key={i} className="bg-surface-raised border rounded-xl px-4 py-3" style={{ borderColor: "var(--color-border)" }}>
            <p className={`font-mono text-xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter toolbar */}
      <div className="bg-surface-raised border rounded-xl px-4 py-3 mb-4 flex items-center gap-3 flex-wrap" style={{ borderColor: "var(--color-border)" }}>
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <label htmlFor="issue-search" className="sr-only">Search issues</label>
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <input
            id="issue-search"
            type="search"
            placeholder="Search title, rule, page..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-surface-overlay border rounded-lg text-slate-200 text-xs placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
            style={{ borderColor: "var(--color-border)" }}
          />
        </div>

        {/* Severity */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="sev-filter" className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Severity</label>
          <select
            id="sev-filter"
            value={filterSeverity}
            onChange={(e) => { setFilterSeverity(e.target.value); setPage(1); }}
            className="px-2 py-1 bg-surface-overlay border rounded-md text-slate-200 text-[11px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
            style={{ borderColor: "var(--color-border)" }}
          >
            <option value="">All</option>
            <option value="CRITICAL">Critical</option>
            <option value="SERIOUS">Serious</option>
            <option value="MODERATE">Moderate</option>
            <option value="MINOR">Minor</option>
          </select>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="status-filter" className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Status</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-2 py-1 bg-surface-overlay border rounded-md text-slate-200 text-[11px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
            style={{ borderColor: "var(--color-border)" }}
          >
            <option value="">All</option>
            <option value="OPEN">Open</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="FIXED">Fixed</option>
            <option value="FALSE_POSITIVE">False Positive</option>
          </select>
        </div>

        {/* Human review toggle */}
        <button
          onClick={() => { setFilterHuman(!filterHuman); setPage(1); }}
          aria-pressed={filterHuman}
          className={`px-3 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1.5 transition-colors ${
            filterHuman
              ? "bg-brand-900/50 text-brand-300 border-brand-700"
              : "bg-transparent text-slate-500 border-slate-700 hover:text-slate-300"
          }`}
        >
          <Users size={12} />
          Human Review
        </button>

        <span className="font-mono text-[11px] text-slate-500 ml-auto">
          {displayIssues.length} issue{displayIssues.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div
          className="bg-brand-950 border border-brand-800 rounded-xl px-4 py-2.5 mb-3 flex items-center gap-2.5"
          role="toolbar"
          aria-label="Bulk actions for selected issues"
        >
          <span className="font-mono text-xs font-bold text-brand-300">
            {selectedIds.size} selected
          </span>
          <div className="w-px h-5 bg-brand-800" aria-hidden="true" />
          <button
            onClick={() => bulkAction("FIXED")}
            disabled={bulkLoading}
            className="px-3 py-1 rounded-md bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-600 disabled:opacity-50 min-touch"
          >
            <Check size={12} /> Mark Fixed
          </button>
          <button
            onClick={() => bulkAction("IN_REVIEW")}
            disabled={bulkLoading}
            className="px-3 py-1 rounded-md bg-brand-600 text-white text-[11px] font-bold hover:bg-brand-500 disabled:opacity-50 min-touch"
          >
            Request Review
          </button>
          <button
            onClick={() => bulkAction("FALSE_POSITIVE")}
            disabled={bulkLoading}
            className="px-3 py-1 rounded-md border border-brand-700 text-brand-300 text-[11px] font-semibold hover:bg-brand-900/50 disabled:opacity-50 min-touch"
          >
            False Positive
          </button>
          <button
            onClick={() => { setSelectedIds(new Set()); announce("Selection cleared"); }}
            className="ml-auto text-[11px] text-slate-500 hover:text-slate-300 min-touch"
          >
            Clear
          </button>
        </div>
      )}

      {/* Loading / Error states */}
      {loading && (
        <div className="bg-surface-raised border rounded-xl p-12 text-center" style={{ borderColor: "var(--color-border)" }}>
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading issues...</p>
        </div>
      )}

      {error && (
        <div role="alert" className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
          <p className="text-sm text-red-300">{error}</p>
          <button onClick={refetch} className="mt-3 px-4 py-2 rounded-lg bg-red-800 text-white text-xs font-semibold">
            Retry
          </button>
        </div>
      )}

      {/* Issues table */}
      {!loading && !error && (
        <div className="bg-surface-raised border rounded-xl overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
          <table className="w-full border-collapse" role="grid" aria-label="Accessibility issues">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--color-border)" }}>
                <th scope="col" className="w-10 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={displayIssues.length > 0 && selectedIds.size === displayIssues.length}
                    onChange={toggleSelectAll}
                    aria-label="Select all issues"
                    className="w-3.5 h-3.5 accent-brand-500 cursor-pointer"
                  />
                </th>
                {[
                  { field: "severity", label: "Severity", w: "w-[110px]" },
                  { field: "title", label: "Issue", w: "" },
                  { field: "rule", label: "Rule", w: "w-[130px]" },
                  { field: "page", label: "Page", w: "w-[90px]" },
                  { field: "status", label: "Status", w: "w-[100px]" },
                  { field: "", label: "Type", w: "w-[70px]" },
                ].map((col, i) => (
                  <th
                    key={i}
                    scope="col"
                    className={`px-3 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider ${col.w} ${col.field ? "cursor-pointer select-none" : ""}`}
                    onClick={() => col.field && handleSort(col.field)}
                    aria-sort={
                      sortField === col.field
                        ? sortDir === "asc" ? "ascending" : "descending"
                        : undefined
                    }
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.field && (
                        <span className={`text-[9px] ${sortField === col.field ? "opacity-100" : "opacity-30"}`}>
                          {sortArrow(col.field)}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayIssues.map((issue, idx) => (
                <IssueRow
                  key={issue.id}
                  issue={issue}
                  isSelected={selectedIds.has(issue.id)}
                  isExpanded={expandedId === issue.id}
                  isLast={idx === displayIssues.length - 1}
                  onToggleSelect={() => toggleSelect(issue.id)}
                  onToggleExpand={() => setExpandedId(expandedId === issue.id ? null : issue.id)}
                  onUpdateStatus={(status) => updateIssue(issue.id, status)}
                  announce={announce}
                />
              ))}
              {displayIssues.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                    {issues.length === 0 ? "No issues found. Run a scan to get started." : "No issues match your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <nav aria-label="Issues pagination" className="flex justify-center items-center gap-1.5 mt-5 pb-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-md bg-surface-raised border text-slate-400 text-xs disabled:opacity-30 disabled:cursor-not-allowed min-touch"
            style={{ borderColor: "var(--color-border)" }}
          >
            ← Prev
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              onClick={() => setPage(pg)}
              aria-current={page === pg ? "page" : undefined}
              className={`px-2.5 py-1.5 rounded-md border font-mono text-xs font-semibold min-w-[32px] ${
                page === pg
                  ? "bg-brand-900/50 text-brand-300 border-brand-700"
                  : "bg-surface-raised text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              {pg}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="px-3 py-1.5 rounded-md bg-surface-raised border text-slate-400 text-xs disabled:opacity-30 disabled:cursor-not-allowed min-touch"
            style={{ borderColor: "var(--color-border)" }}
          >
            Next →
          </button>
        </nav>
      )}
    </div>
  );
}

// ─── Issue Row Component (extracted for readability) ───

function IssueRow({
  issue,
  isSelected,
  isExpanded,
  isLast,
  onToggleSelect,
  onToggleExpand,
  onUpdateStatus,
  announce,
}: {
  issue: Issue;
  isSelected: boolean;
  isExpanded: boolean;
  isLast: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  onUpdateStatus: (status: IssueStatus) => void;
  announce: (msg: string) => void;
}) {
  return (
    <>
      <tr
        className={`transition-colors ${
          isSelected ? "bg-brand-950/40" : isExpanded ? "bg-surface-overlay/30" : "hover:bg-surface-overlay/20"
        }`}
        style={{ borderBottom: isExpanded ? "none" : isLast ? "none" : "1px solid #111a30" }}
      >
        <td className="px-3 py-2.5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            aria-label={`Select: ${issue.title}`}
            className="w-3.5 h-3.5 accent-brand-500 cursor-pointer"
          />
        </td>
        <td className="px-3 py-2.5"><SeverityBadge severity={issue.severity} /></td>
        <td className="px-3 py-2.5">
          <button
            onClick={onToggleExpand}
            aria-expanded={isExpanded}
            className="flex items-center gap-1.5 text-left bg-transparent border-none text-slate-200 text-xs font-semibold cursor-pointer w-full"
          >
            <ChevronDown
              size={12}
              className={`text-slate-500 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
            <span className="truncate">{issue.title}</span>
          </button>
        </td>
        <td className="px-3 py-2.5 font-mono text-[10px] text-slate-500">{issue.rule}</td>
        <td className="px-3 py-2.5 font-mono text-[11px] text-slate-500">{issue.pageUrl}</td>
        <td className="px-3 py-2.5"><StatusBadge status={issue.status} /></td>
        <td className="px-3 py-2.5">
          {issue.needsHuman ? (
            <span className="text-[10px] font-semibold text-brand-300 bg-brand-900/50 px-1.5 py-0.5 rounded border border-brand-800">Expert</span>
          ) : (
            <span className="text-[10px] text-slate-500">Auto</span>
          )}
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-surface-overlay/30">
          <td colSpan={7} className="px-3 pb-4 pt-0">
            <div className="pl-10 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
              {issue.description && (
                <p className="text-[13px] text-slate-300 mb-3 leading-relaxed">{issue.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1">Element</p>
                  <code className="block px-3 py-2 bg-surface rounded-lg font-mono text-[11px] text-amber-400 border break-all" style={{ borderColor: "var(--color-border)" }}>
                    {issue.htmlSnippet || issue.element}
                  </code>
                </div>
                {issue.fixSuggestion && (
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1">How to Fix</p>
                    <p className="text-xs text-slate-400 leading-relaxed px-3 py-2 bg-surface rounded-lg border" style={{ borderColor: "var(--color-border)" }}>
                      {issue.fixSuggestion}
                    </p>
                  </div>
                )}
              </div>

              {issue.needsHuman && (
                <div className="p-2.5 bg-brand-950/50 border border-brand-800 rounded-lg mb-3">
                  <p className="text-[11px] font-bold text-brand-300">Flagged for expert review</p>
                  <p className="text-[11px] text-brand-400/70">Automation detected this but accurate assessment requires manual testing with assistive technology.</p>
                </div>
              )}

              {issue.reviews && issue.reviews.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-2">Expert Feedback</p>
                  {issue.reviews.map((r) => (
                    <div key={r.id} className="p-2.5 bg-surface rounded-lg border-l-2 border-emerald-600 border" style={{ borderColor: "var(--color-border)", borderLeftColor: "#059669" }}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[11px] font-semibold text-emerald-300">{r.reviewer.name}</span>
                        <span className="font-mono text-[10px] text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{r.feedback}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-1.5">
                <button onClick={() => onUpdateStatus("FIXED")} className="px-3 py-1.5 rounded-md bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-600 min-touch">
                  <Check size={12} /> Mark Fixed
                </button>
                <button onClick={() => onUpdateStatus("FALSE_POSITIVE")} className="px-3 py-1.5 rounded-md border text-slate-400 text-[11px] font-semibold hover:bg-surface-overlay min-touch" style={{ borderColor: "var(--color-border)" }}>
                  False Positive
                </button>
                <button onClick={() => onUpdateStatus("WONT_FIX")} className="px-3 py-1.5 rounded-md border text-slate-500 text-[11px] font-semibold hover:bg-surface-overlay min-touch" style={{ borderColor: "var(--color-border)" }}>
                  Dismiss
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
