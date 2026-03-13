"use client";

import { useState, useRef, useCallback, useMemo } from "react";

/*
 * ─── Compliance Dashboard ───
 * 
 * "Compliance is the floor, not the ceiling.
 *  But you need to know where the floor is
 *  before you can build something extraordinary."
 *
 * This page answers one question:
 * "Can I prove my website is accessible?"
 *
 * VPAT = Voluntary Product Accessibility Template
 * Required by US federal procurement (Section 508)
 * Required by EU (EN 301 549 / EAA)
 * Required by enterprise buyers everywhere
 */

// ─── Types ───
type Status = "pass" | "fail" | "na";
type Criterion = { id: string; title: string; level: string; principle: string; status: Status; notes: string };

// ─── WCAG 2.1 AA Success Criteria (simplified) ───
const WCAG_CRITERIA: Criterion[] = [
  // Perceivable
  { id: "1.1.1", title: "Non-text Content", level: "A", principle: "Perceivable", status: "fail", notes: "4 images missing alt text" },
  { id: "1.2.1", title: "Audio-only and Video-only", level: "A", principle: "Perceivable", status: "na", notes: "No pre-recorded media" },
  { id: "1.2.2", title: "Captions (Prerecorded)", level: "A", principle: "Perceivable", status: "na", notes: "" },
  { id: "1.2.3", title: "Audio Description", level: "A", principle: "Perceivable", status: "na", notes: "" },
  { id: "1.3.1", title: "Info and Relationships", level: "A", principle: "Perceivable", status: "fail", notes: "Heading skip h2→h4, table missing headers" },
  { id: "1.3.2", title: "Meaningful Sequence", level: "A", principle: "Perceivable", status: "pass", notes: "" },
  { id: "1.3.3", title: "Sensory Characteristics", level: "A", principle: "Perceivable", status: "pass", notes: "" },
  { id: "1.3.4", title: "Orientation", level: "AA", principle: "Perceivable", status: "pass", notes: "" },
  { id: "1.3.5", title: "Identify Input Purpose", level: "AA", principle: "Perceivable", status: "fail", notes: "Email input missing autocomplete attribute" },
  { id: "1.4.1", title: "Use of Color", level: "A", principle: "Perceivable", status: "fail", notes: "Stock status uses color alone" },
  { id: "1.4.2", title: "Audio Control", level: "A", principle: "Perceivable", status: "fail", notes: "Auto-playing video lacks pause control" },
  { id: "1.4.3", title: "Contrast (Minimum)", level: "AA", principle: "Perceivable", status: "fail", notes: "Subtitle text 2.8:1 ratio (needs 4.5:1)" },
  { id: "1.4.4", title: "Resize Text", level: "AA", principle: "Perceivable", status: "pass", notes: "" },
  { id: "1.4.5", title: "Images of Text", level: "AA", principle: "Perceivable", status: "pass", notes: "" },
  { id: "1.4.10", title: "Reflow", level: "AA", principle: "Perceivable", status: "pass", notes: "" },
  { id: "1.4.11", title: "Non-text Contrast", level: "AA", principle: "Perceivable", status: "pass", notes: "" },
  { id: "1.4.12", title: "Text Spacing", level: "AA", principle: "Perceivable", status: "pass", notes: "" },
  { id: "1.4.13", title: "Content on Hover/Focus", level: "AA", principle: "Perceivable", status: "pass", notes: "" },
  // Operable
  { id: "2.1.1", title: "Keyboard", level: "A", principle: "Operable", status: "pass", notes: "" },
  { id: "2.1.2", title: "No Keyboard Trap", level: "A", principle: "Operable", status: "fail", notes: "Modal dialog traps focus" },
  { id: "2.1.4", title: "Character Key Shortcuts", level: "A", principle: "Operable", status: "na", notes: "No custom shortcuts" },
  { id: "2.2.1", title: "Timing Adjustable", level: "A", principle: "Operable", status: "na", notes: "" },
  { id: "2.2.2", title: "Pause, Stop, Hide", level: "A", principle: "Operable", status: "fail", notes: "Background video cannot be paused" },
  { id: "2.3.1", title: "Three Flashes", level: "A", principle: "Operable", status: "pass", notes: "" },
  { id: "2.4.1", title: "Bypass Blocks", level: "A", principle: "Operable", status: "fail", notes: "No skip navigation link" },
  { id: "2.4.2", title: "Page Titled", level: "A", principle: "Operable", status: "pass", notes: "" },
  { id: "2.4.3", title: "Focus Order", level: "A", principle: "Operable", status: "fail", notes: "tabindex > 0 disrupts natural order" },
  { id: "2.4.4", title: "Link Purpose (In Context)", level: "A", principle: "Operable", status: "fail", notes: "3 'Click here' links" },
  { id: "2.4.5", title: "Multiple Ways", level: "AA", principle: "Operable", status: "pass", notes: "" },
  { id: "2.4.6", title: "Headings and Labels", level: "AA", principle: "Operable", status: "pass", notes: "" },
  { id: "2.4.7", title: "Focus Visible", level: "AA", principle: "Operable", status: "fail", notes: "outline:none with no replacement" },
  { id: "2.5.1", title: "Pointer Gestures", level: "A", principle: "Operable", status: "pass", notes: "" },
  { id: "2.5.2", title: "Pointer Cancellation", level: "A", principle: "Operable", status: "pass", notes: "" },
  { id: "2.5.3", title: "Label in Name", level: "A", principle: "Operable", status: "pass", notes: "" },
  { id: "2.5.4", title: "Motion Actuation", level: "A", principle: "Operable", status: "na", notes: "" },
  // Understandable
  { id: "3.1.1", title: "Language of Page", level: "A", principle: "Understandable", status: "pass", notes: "Fixed in latest scan" },
  { id: "3.1.2", title: "Language of Parts", level: "AA", principle: "Understandable", status: "pass", notes: "" },
  { id: "3.2.1", title: "On Focus", level: "A", principle: "Understandable", status: "pass", notes: "" },
  { id: "3.2.2", title: "On Input", level: "A", principle: "Understandable", status: "pass", notes: "" },
  { id: "3.2.3", title: "Consistent Navigation", level: "AA", principle: "Understandable", status: "pass", notes: "" },
  { id: "3.2.4", title: "Consistent Identification", level: "AA", principle: "Understandable", status: "pass", notes: "" },
  { id: "3.3.1", title: "Error Identification", level: "A", principle: "Understandable", status: "pass", notes: "" },
  { id: "3.3.2", title: "Labels or Instructions", level: "A", principle: "Understandable", status: "fail", notes: "Email input has no label" },
  { id: "3.3.3", title: "Error Suggestion", level: "AA", principle: "Understandable", status: "pass", notes: "" },
  { id: "3.3.4", title: "Error Prevention", level: "AA", principle: "Understandable", status: "pass", notes: "" },
  // Robust
  { id: "4.1.1", title: "Parsing", level: "A", principle: "Robust", status: "pass", notes: "" },
  { id: "4.1.2", title: "Name, Role, Value", level: "A", principle: "Robust", status: "fail", notes: "Icon button missing accessible name" },
  { id: "4.1.3", title: "Status Messages", level: "AA", principle: "Robust", status: "pass", notes: "" },
];

// ─── Helpers ───
const statusIcon = { pass: "✓", fail: "✗", na: "—" };
const statusColor = { pass: "#059669", fail: "#dc2626", na: "#64748b" };
const statusBg = { pass: "#052e16", fail: "#450a0a", na: "#1a1a2e" };

function getStats(criteria: Criterion[]) {
  const pass = criteria.filter(c => c.status === "pass").length;
  const fail = criteria.filter(c => c.status === "fail").length;
  const na = criteria.filter(c => c.status === "na").length;
  const applicable = criteria.length - na;
  const score = applicable > 0 ? Math.round((pass / applicable) * 100) : 100;
  return { pass, fail, na, applicable, total: criteria.length, score };
}

// ─── Score Ring ───
function ScoreRing({ score, size = 100, label, color }: { score: number; size?: number; label: string; color?: string }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const c = color || (score >= 80 ? "#059669" : score >= 50 ? "#d97706" : "#dc2626");
  return (
    <div style={{ position: "relative", width: size, height: size }} role="img" aria-label={`${label}: ${score}%`}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a2340" strokeWidth="8"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth="8" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }}/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.26, fontWeight: 800, color: c, fontFamily: "'Azeret Mono', monospace" }}>{score}</span>
        <span style={{ fontSize: 8, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      </div>
    </div>
  );
}

// ─── Main ───
export default function CompliancePage() {
  const [expandedPrinciple, setExpandedPrinciple] = useState<string | null>(null);
  const [showOnlyFails, setShowOnlyFails] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const liveRef = useRef<HTMLDivElement | null>(null);
  const announce = useCallback((msg: string) => { if (liveRef.current) { liveRef.current.textContent = ""; requestAnimationFrame(() => { if (liveRef.current) liveRef.current.textContent = msg; }); } }, []);

  const overall = getStats(WCAG_CRITERIA);
  const byPrinciple = useMemo(() => {
    const groups: Record<string, Criterion[]> = {};
    WCAG_CRITERIA.forEach(c => {
      if (!groups[c.principle]) groups[c.principle] = [];
      groups[c.principle].push(c);
    });
    return Object.entries(groups).map(([name, criteria]) => ({ name, criteria, stats: getStats(criteria) }));
  }, []);

  const displayCriteria = showOnlyFails ? WCAG_CRITERIA.filter(c => c.status === "fail") : WCAG_CRITERIA;

  const handleExport = () => {
    setExportLoading(true);
    announce("Generating VPAT report...");
    setTimeout(() => { setExportLoading(false); announce("VPAT report ready for download."); }, 1500);
  };

  const S = { mono: { fontFamily: "'Azeret Mono', 'JetBrains Mono', monospace" }, card: { background: "#0d1424", border: "1px solid #1a2340", borderRadius: 14 } };

  return (
    <div style={{ minHeight: "100vh", background: "#080c18", fontFamily: "'DM Sans', system-ui, sans-serif", color: "#e2e8f0" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Azeret+Mono:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet" />
      <div ref={liveRef} aria-live="polite" aria-atomic="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <header style={{ paddingTop: 40, paddingBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #059669, #047857)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#f8fafc", fontFamily: "'Outfit', sans-serif" }}>Compliance</h1>
              <p style={{ fontSize: 13, color: "#4f5d79", margin: 0 }}>WCAG 2.1 AA · ADA Title III · Section 508 · EN 301 549</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleExport} disabled={exportLoading} style={{ padding: "9px 20px", borderRadius: 8, background: "linear-gradient(135deg, #4f46e5, #6d28d9)", color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: exportLoading ? 0.6 : 1 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {exportLoading ? "Generating..." : "Export VPAT (PDF)"}
            </button>
            <button style={{ padding: "9px 20px", borderRadius: 8, background: "#111a30", color: "#94a3b8", border: "1px solid #1e2d4a", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              Full Audit Report
            </button>
          </div>
        </header>

        {/* Score Overview */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { label: "WCAG 2.1 AA", score: overall.score, icon: "🌐" },
            { label: "ADA Title III", score: 71, icon: "🏛️" },
            { label: "Section 508", score: 65, icon: "📋" },
            { label: "EAA / EN 301 549", score: overall.score, icon: "🇪🇺" },
          ].map((std, i) => (
            <div key={i} style={{ ...S.card, padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <ScoreRing score={std.score} size={90} label={std.label.split(" ")[0]} />
              <p style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", margin: "10px 0 2px", textAlign: "center" }}>{std.icon} {std.label}</p>
              <p style={{ ...S.mono, fontSize: 10, color: "#4f5d79", margin: 0 }}>
                {std.score >= 80 ? "Substantially Conforms" : std.score >= 50 ? "Partially Conforms" : "Does Not Conform"}
              </p>
            </div>
          ))}
        </div>

        {/* Summary Bar */}
        <div style={{ ...S.card, padding: "14px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, background: "#052e16", display: "flex", alignItems: "center", justifyContent: "center", color: "#4ade80", fontSize: 11, fontWeight: 700 }}>✓</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#6ee7b7" }}>{overall.pass} Passed</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, background: "#450a0a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fca5a5", fontSize: 11, fontWeight: 700 }}>✗</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fca5a5" }}>{overall.fail} Failed</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>—</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>{overall.na} Not Applicable</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button onClick={() => setShowOnlyFails(!showOnlyFails)} aria-pressed={showOnlyFails} style={{ padding: "5px 12px", borderRadius: 6, background: showOnlyFails ? "#450a0a" : "transparent", border: `1px solid ${showOnlyFails ? "#7f1d1d" : "#1e2d4a"}`, color: showOnlyFails ? "#fca5a5" : "#4f5d79", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
              {showOnlyFails ? "Showing Failures Only" : "Show Failures Only"}
            </button>
          </div>
        </div>

        {/* Principle Sections */}
        {byPrinciple.map(group => {
          const isExpanded = expandedPrinciple === null || expandedPrinciple === group.name;
          const groupCriteria = showOnlyFails ? group.criteria.filter(c => c.status === "fail") : group.criteria;
          if (showOnlyFails && groupCriteria.length === 0) return null;

          return (
            <section key={group.name} style={{ ...S.card, marginBottom: 12, overflow: "hidden" }}>
              {/* Principle Header */}
              <button
                onClick={() => setExpandedPrinciple(expandedPrinciple === group.name ? null : group.name)}
                aria-expanded={isExpanded}
                style={{ width: "100%", padding: "14px 20px", background: "transparent", border: "none", borderBottom: isExpanded ? "1px solid #1a2340" : "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", color: "inherit", fontFamily: "inherit" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, margin: 0, color: "#f8fafc" }}>{group.name}</h2>
                  <span style={{ ...S.mono, fontSize: 11, color: "#059669", fontWeight: 600 }}>{group.stats.pass}✓</span>
                  <span style={{ ...S.mono, fontSize: 11, color: "#dc2626", fontWeight: 600 }}>{group.stats.fail}✗</span>
                  <span style={{ ...S.mono, fontSize: 11, color: "#64748b" }}>{group.stats.na}—</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Mini progress bar */}
                  <div style={{ width: 80, height: 5, background: "#1a2340", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${group.stats.score}%`, height: "100%", background: group.stats.score >= 80 ? "#059669" : group.stats.score >= 50 ? "#d97706" : "#dc2626", borderRadius: 3 }} />
                  </div>
                  <span style={{ ...S.mono, fontSize: 12, fontWeight: 700, color: group.stats.score >= 80 ? "#059669" : group.stats.score >= 50 ? "#d97706" : "#dc2626" }}>{group.stats.score}%</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f5d79" strokeWidth="2" strokeLinecap="round" style={{ transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </button>

              {/* Criteria Table */}
              {isExpanded && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #111a30" }}>
                      <th style={{ padding: "8px 20px", textAlign: "left", fontSize: 9, fontWeight: 700, color: "#3a4560", textTransform: "uppercase", letterSpacing: "0.06em", width: 50 }}>Status</th>
                      <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 9, fontWeight: 700, color: "#3a4560", textTransform: "uppercase", letterSpacing: "0.06em", width: 60 }}>SC</th>
                      <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 9, fontWeight: 700, color: "#3a4560", textTransform: "uppercase", letterSpacing: "0.06em" }}>Criterion</th>
                      <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 9, fontWeight: 700, color: "#3a4560", textTransform: "uppercase", letterSpacing: "0.06em", width: 50 }}>Level</th>
                      <th style={{ padding: "8px 20px", textAlign: "left", fontSize: 9, fontWeight: 700, color: "#3a4560", textTransform: "uppercase", letterSpacing: "0.06em" }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupCriteria.map((c, idx) => (
                      <tr key={c.id} style={{ borderBottom: idx < groupCriteria.length - 1 ? "1px solid #0d1828" : "none", background: c.status === "fail" ? "#0d0505" : "transparent" }}>
                        <td style={{ padding: "8px 20px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 5, background: statusBg[c.status], color: statusColor[c.status], fontSize: 12, fontWeight: 700 }}>
                            {statusIcon[c.status]}
                          </span>
                        </td>
                        <td style={{ padding: "8px 12px", ...S.mono, fontSize: 11, color: "#64748b" }}>{c.id}</td>
                        <td style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, color: c.status === "fail" ? "#fca5a5" : "#cbd5e1" }}>{c.title}</td>
                        <td style={{ padding: "8px 12px" }}>
                          <span style={{ ...S.mono, fontSize: 10, padding: "2px 6px", borderRadius: 3, background: c.level === "A" ? "#111a30" : "#1e1b4b", color: c.level === "A" ? "#64748b" : "#a5b4fc", fontWeight: 600 }}>{c.level}</span>
                        </td>
                        <td style={{ padding: "8px 20px", fontSize: 11, color: c.status === "fail" ? "#f59e0b" : "#3a4560", fontStyle: c.notes ? "normal" : "italic" }}>
                          {c.notes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          );
        })}

        {/* Compliance Timeline */}
        <section style={{ ...S.card, padding: 24, marginBottom: 40 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, margin: "0 0 16px", color: "#f8fafc" }}>Compliance Timeline</h2>
          <div style={{ display: "flex", gap: 0, position: "relative" }}>
            <div style={{ position: "absolute", top: 14, left: 14, right: 14, height: 2, background: "#1e2d4a" }} />
            {[
              { date: "Feb 15", score: 42, label: "Initial Scan" },
              { date: "Feb 22", score: 48, label: "First Fixes" },
              { date: "Mar 1", score: 55, label: "Contrast Fixed" },
              { date: "Mar 7", score: 62, label: "Current", active: true },
              { date: "Target", score: 90, label: "Goal", future: true },
            ].map((point, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: point.future ? "#1e2d4a" : point.active ? "#4f46e5" : point.score >= 60 ? "#059669" : "#d97706",
                  border: point.active ? "3px solid #818cf8" : "3px solid #0d1424",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  ...S.mono, fontSize: 9, fontWeight: 700, color: "#fff",
                }}>
                  {point.score}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: point.active ? "#a5b4fc" : "#4f5d79", marginTop: 6 }}>{point.date}</span>
                <span style={{ fontSize: 9, color: "#3a4560" }}>{point.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
