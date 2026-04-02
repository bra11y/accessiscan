import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import type { Metadata } from "next";
import { Search, Eye, Users, Zap, FileText, Globe, Check, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "AccessiScan — Find every accessibility failure on your site in 60 seconds",
  description:
    "Paste a URL. Get a complete list of accessibility failures — severity levels, WCAG criteria, and ready-to-paste code fixes. Covers WCAG 2.1 AA, ADA, Section 508, and EAA 2025.",
  openGraph: {
    title: "AccessiScan — Find every accessibility failure on your site in 60 seconds",
    description: "98% of websites fail basic accessibility checks. Find out where yours fails — and exactly how to fix it.",
    type: "website",
  },
};

const G = "var(--font-grotesk, 'Space Grotesk', sans-serif)";

// Glassmorphism card style
const glass = {
  background: "rgba(15,23,42,0.65)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  boxShadow: "0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 32px rgba(0,0,0,0.3)",
} as const;

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div style={{ background: "var(--bg)", color: "var(--text-lp-2)", minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <header>
        <nav
          aria-label="Main navigation"
          style={{
            position: "sticky", top: 0, zIndex: 100, height: 60,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 clamp(16px, 4vw, 48px)",
            background: "rgba(11,15,26,0.8)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Link href="/" aria-label="AccessiScan home" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", color: "var(--text-lp-1)", fontWeight: 700, fontSize: "1rem", fontFamily: G }}>
            <span aria-hidden="true" style={{ width: 28, height: 28, background: "var(--brand-lp)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "0.875rem", flexShrink: 0 }}>A</span>
            AccessiScan
          </Link>
          <div className="lp-nav-links" style={{ display: "flex", gap: 2 }}>
            {[{ href: "#bento", label: "Features" }, { href: "#how-it-works", label: "How it works" }].map(({ href, label }) => (
              <Link key={href} href={href} style={{ color: "var(--text-lp-3)", fontSize: "0.875rem", fontWeight: 500, textDecoration: "none", padding: "8px 12px", borderRadius: 8, minHeight: 44, display: "inline-flex", alignItems: "center" }}>{label}</Link>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/login" className="lp-login-btn" style={{ color: "var(--text-lp-3)", fontSize: "0.875rem", fontWeight: 500, padding: "8px 14px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, background: "transparent", textDecoration: "none", minHeight: 44, display: "inline-flex", alignItems: "center" }}>
              Log in
            </Link>
            <Link href="/signup" style={{ background: "var(--brand-lp)", color: "#fff", fontSize: "0.875rem", fontWeight: 600, padding: "8px 18px", borderRadius: 8, textDecoration: "none", minHeight: 44, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: G }}>
              Get started →
            </Link>
          </div>
        </nav>
      </header>

      <main id="main-content">

        {/* ── HERO ── */}
        <section
          aria-labelledby="hero-heading"
          style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 40, alignItems: "center",
            padding: "56px clamp(16px, 4vw, 48px) 56px",
            maxWidth: 1100, margin: "0 auto",
          }}
          className="lp-hero-grid"
        >
          {/* Left: copy */}
          <div>
            <div
              aria-label="Supports WCAG, ADA, Section 508, and EAA 2025"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                border: "1px solid rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)",
                color: "var(--brand-lp)", fontSize: "0.6875rem", fontWeight: 700,
                padding: "4px 14px", borderRadius: 100, marginBottom: 20,
                fontFamily: G, letterSpacing: "0.07em", textTransform: "uppercase",
              }}
            >
              <span aria-hidden="true" style={{ width: 5, height: 5, background: "var(--brand-lp)", borderRadius: "50%" }} />
              WCAG · ADA · 508 · EAA 2025
            </div>

            <h1
              id="hero-heading"
              style={{
                fontFamily: G,
                fontSize: "clamp(1.875rem, 3.5vw, 3rem)",
                fontWeight: 700, color: "#E6EDF3",
                lineHeight: 1.1, letterSpacing: "-0.03em",
                marginBottom: 16,
              }}
            >
              Most websites exclude 1 in 6 visitors. Is yours one of them?
            </h1>

            <p style={{ fontSize: "1rem", color: "#8B949E", lineHeight: 1.7, marginBottom: 28, maxWidth: 420 }}>
              Accessibility failures cost you customers and carry fines up to €75,000 in Europe. Find every issue in seconds — with the exact fix for each one.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
              <Link href="/signup" style={{ background: "var(--brand-lp)", color: "#fff", fontFamily: G, fontSize: "0.9rem", fontWeight: 600, padding: "11px 24px", borderRadius: 9, textDecoration: "none", minHeight: 44, display: "inline-flex", alignItems: "center", gap: 7 }}>
                Scan your site free →
              </Link>
              <Link href="#how-it-works" style={{ color: "#C9D1D9", fontSize: "0.9rem", fontWeight: 500, padding: "11px 24px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, textDecoration: "none", minHeight: 44, display: "inline-flex", alignItems: "center" }}>
                See how it works
              </Link>
            </div>

            <ul aria-label="What's included" style={{ display: "flex", gap: 14, listStyle: "none", padding: 0, flexWrap: "wrap", fontSize: "0.8125rem", color: "#8B949E" }}>
              {["No account needed", "Full results instantly", "1 free scan"].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Check size={11} aria-hidden="true" style={{ color: "#3FB950", flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: live scan result mockup */}
          <div
            aria-label="Example scan result: 72% compliance, 14 issues found including 3 critical"
            style={{ ...glass, overflow: "hidden" }}
          >
            {/* Browser chrome */}
            <div aria-hidden="true" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "9px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 5 }}>
                {["#FF5F57","#FEBC2E","#28C840"].map((c) => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 5, padding: "3px 10px", fontSize: "0.6875rem", color: "#8B949E", fontFamily: "monospace", maxWidth: 260 }}>
                app.accessiscan.com/scan/result
              </div>
            </div>
            <div style={{ padding: 18 }}>
              {/* Score row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: "0.75rem", color: "#8B949E", fontWeight: 500, whiteSpace: "nowrap" }}>Compliance</span>
                <div role="progressbar" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100} aria-label="72% compliant" style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: "72%", height: "100%", background: "linear-gradient(90deg, var(--brand-lp), #a78bfa)", borderRadius: 3 }} />
                </div>
                <span style={{ fontFamily: G, fontWeight: 700, color: "#D29922", fontSize: "0.875rem", flexShrink: 0 }}>72%</span>
              </div>
              {/* Score chips */}
              <div role="list" aria-label="Scan scores" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 12 }}>
                {[{ val: "72", label: "WCAG", color: "#D29922" }, { val: "14", label: "Issues", color: "#F85149" }, { val: "3", label: "Critical", color: "#F85149" }].map(({ val, label, color }) => (
                  <div key={label} role="listitem" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ fontFamily: G, fontSize: "1.5rem", fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: "0.5625rem", color: "#8B949E", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                  </div>
                ))}
              </div>
              {/* Issues */}
              <ul aria-label="Top issues" style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                {[
                  { sev: "Critical", c: "#F85149", bg: "rgba(248,81,73,0.12)", title: "Images missing alt text", meta: "7 instances · WCAG 1.1.1" },
                  { sev: "Serious",  c: "#D29922", bg: "rgba(210,153,34,0.12)", title: "Colour contrast fails 4.5:1", meta: "4 instances · WCAG 1.4.3" },
                  { sev: "Moderate", c: "#818CF8", bg: "rgba(129,140,248,0.12)", title: "Form inputs missing labels", meta: "3 instances · WCAG 1.3.1" },
                ].map(({ sev, c, bg, title, meta }) => (
                  <li key={title} style={{ display: "flex", alignItems: "flex-start", gap: 7, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 7, padding: "7px 9px" }}>
                    <span aria-label={`${sev} severity`} style={{ fontSize: "0.5625rem", fontWeight: 700, padding: "2px 5px", borderRadius: 3, whiteSpace: "nowrap", flexShrink: 0, marginTop: 1, background: bg, color: c }}>{sev}</span>
                    <div>
                      <div style={{ color: "#E6EDF3", fontWeight: 600, fontSize: "0.75rem" }}>{title}</div>
                      <div style={{ color: "#8B949E", fontSize: "0.625rem", marginTop: 1 }}>{meta}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── BENTO GRID ── */}
        <section
          id="bento"
          aria-label="Product features"
          style={{
            padding: "0 clamp(16px, 4vw, 48px) 80px",
            maxWidth: 1100, margin: "0 auto",
          }}
        >
          {/* Ambient glow behind bento */}
          <div aria-hidden="true" style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: -120, left: "25%", width: 500, height: 500, background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 65%)", pointerEvents: "none", borderRadius: "50%" }} />
            <div style={{ position: "absolute", top: 200, right: "15%", width: 400, height: 400, background: "radial-gradient(ellipse, rgba(129,140,248,0.07) 0%, transparent 60%)", pointerEvents: "none", borderRadius: "50%" }} />
          </div>

          <div className="lp-bento" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "auto", gap: 12, position: "relative" }}>

            {/* ── Card A: Scan results (spans 2 cols, 2 rows) ── */}
            <div
              style={{ ...glass, gridColumn: "span 2", gridRow: "span 2", padding: 24, display: "flex", flexDirection: "column" }}
              aria-label="Scan results preview"
            >
              <p style={{ fontFamily: G, fontSize: "0.6875rem", fontWeight: 700, color: "var(--brand-lp)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Scan result</p>

              {/* Score row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: "0.8125rem", color: "var(--text-lp-3)", fontWeight: 500 }}>Compliance</span>
                <div role="progressbar" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100} aria-label="72% compliant" style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: "72%", height: "100%", background: "linear-gradient(90deg, var(--brand-lp), #a78bfa)", borderRadius: 3 }} />
                </div>
                <span style={{ fontFamily: G, fontWeight: 700, color: "var(--warn-lp)", fontSize: "0.9rem" }}>72%</span>
              </div>

              {/* Score cards */}
              <div role="list" aria-label="Scores" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 18 }}>
                {[{ val: "72", label: "WCAG", color: "var(--warn-lp)" }, { val: "14", label: "Issues", color: "var(--danger-lp)" }, { val: "3", label: "Critical", color: "var(--danger-lp)" }].map(({ val, label, color }) => (
                  <div key={label} role="listitem" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 10px", textAlign: "center" }}>
                    <div style={{ fontFamily: G, fontSize: "1.75rem", fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: "0.625rem", color: "var(--text-lp-3)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Issue list */}
              <ul aria-label="Issues" style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                {[
                  { sev: "Critical", c: "var(--danger-lp)", bg: "rgba(248,81,73,0.12)", title: "Images missing alt text", meta: "7 instances · WCAG 1.1.1", fix: 'Add alt="…" to 7 img elements' },
                  { sev: "Serious",  c: "var(--warn-lp)",   bg: "rgba(210,153,34,0.12)", title: "Colour contrast fails 4.5:1", meta: "4 instances · WCAG 1.4.3", fix: "Change text color from #888 to #555" },
                  { sev: "Moderate", c: "var(--brand-lp)",  bg: "rgba(129,140,248,0.12)", title: "Form inputs missing labels", meta: "3 instances · WCAG 1.3.1", fix: 'Add <label for="…"> to each input' },
                ].map(({ sev, c, bg, title, meta, fix }) => (
                  <li key={title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 9, padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                      <span aria-label={`${sev} severity`} style={{ fontSize: "0.625rem", fontWeight: 700, padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap", flexShrink: 0, marginTop: 1, background: bg, color: c }}>{sev}</span>
                      <div>
                        <div style={{ color: "var(--text-lp-1)", fontWeight: 600, fontSize: "0.8125rem" }}>{title}</div>
                        <div style={{ color: "var(--text-lp-3)", fontSize: "0.6875rem", marginTop: 1 }}>{meta}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(63,185,80,0.07)", border: "1px solid rgba(63,185,80,0.15)", borderRadius: 6, padding: "5px 9px" }}>
                      <Zap size={10} aria-hidden="true" style={{ color: "var(--success-lp)", flexShrink: 0 }} />
                      <code style={{ fontSize: "0.6875rem", color: "var(--success-lp)", fontFamily: "monospace" }}>{fix}</code>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Card B: URL input ── */}
            <div style={{ ...glass, padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontFamily: G, fontSize: "0.6875rem", fontWeight: 700, color: "var(--brand-lp)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Step 01 — Enter URL</p>
              <p style={{ fontFamily: G, fontSize: "1rem", fontWeight: 700, color: "var(--text-lp-1)", letterSpacing: "-0.015em", lineHeight: 1.3 }}>Paste any URL. We do the rest.</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(129,140,248,0.35)", borderRadius: 8, padding: "0 12px", height: 40 }}>
                <Search size={13} style={{ color: "var(--brand-lp)", flexShrink: 0 }} aria-hidden="true" />
                <span style={{ fontSize: "0.8125rem", color: "var(--text-lp-2)", fontFamily: "monospace", flex: 1 }}>https://yoursite.com</span>
                <span aria-hidden="true" style={{ width: 2, height: 14, background: "var(--brand-lp)", borderRadius: 1, animation: "blink 1s step-end infinite" }} />
              </div>
              <Link href="/signup" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 36, background: "var(--brand-lp)", borderRadius: 8, fontFamily: G, fontSize: "0.8125rem", fontWeight: 600, color: "#fff", textDecoration: "none" }}>
                Start free scan →
              </Link>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                {["No setup required", "Up to 5 pages free", "Results in 60 seconds"].map((t) => (
                  <li key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "var(--text-lp-3)" }}>
                    <Check size={11} aria-hidden="true" style={{ color: "var(--success-lp)", flexShrink: 0 }} />{t}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Card C: Scan progress ── */}
            <div style={{ ...glass, padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontFamily: G, fontSize: "0.6875rem", fontWeight: 700, color: "var(--brand-lp)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Step 02 — Live scan</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: G, fontSize: "0.875rem", fontWeight: 600, color: "var(--text-lp-1)" }}>Scanning…</span>
                <span style={{ fontFamily: "monospace", fontSize: "0.8125rem", color: "var(--brand-lp)", fontWeight: 700 }}>64%</span>
              </div>
              <div role="progressbar" aria-valuenow={64} aria-valuemin={0} aria-valuemax={100} aria-label="64% complete" style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: "64%", height: "100%", background: "linear-gradient(90deg, var(--brand-lp), #a78bfa)", borderRadius: 2 }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[{ page: "/", s: "done", i: 3 }, { page: "/about", s: "done", i: 0 }, { page: "/products", s: "active" }, { page: "/contact", s: "queued" }].map(({ page, s, i }) => (
                  <div key={page} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 9px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 7 }}>
                    <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: s === "done" ? "var(--success-lp)" : s === "active" ? "var(--brand-lp)" : "rgba(255,255,255,0.15)" }} />
                    <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--text-lp-2)", flex: 1 }}>{page}</span>
                    {i !== undefined ? (
                      <span style={{ fontSize: "0.625rem", fontWeight: 600, color: (i as number) > 0 ? "var(--danger-lp)" : "var(--success-lp)" }}>{(i as number) > 0 ? `${i} issues` : "✓"}</span>
                    ) : (
                      <span style={{ fontSize: "0.625rem", color: s === "active" ? "var(--brand-lp)" : "var(--text-lp-3)" }}>{s === "active" ? "Checking…" : "Queued"}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Card D: Vision simulation ── */}
            <div style={{ ...glass, padding: 24 }}>
              <div aria-hidden="true" style={{ width: 38, height: 38, background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.25)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-lp)", marginBottom: 14 }}>
                <Eye size={17} />
              </div>
              <h3 style={{ fontFamily: G, fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-lp-1)", marginBottom: 8, letterSpacing: "-0.01em" }}>Vision simulation</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-lp-3)", lineHeight: 1.65 }}>See your site through the eyes of 300 million colour-blind people before they do.</p>
            </div>

            {/* ── Card E: Human expert review ── */}
            <div style={{ ...glass, padding: 24 }}>
              <div aria-hidden="true" style={{ width: 38, height: 38, background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.25)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-lp)", marginBottom: 14 }}>
                <Users size={17} />
              </div>
              <h3 style={{ fontFamily: G, fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-lp-1)", marginBottom: 8, letterSpacing: "-0.01em" }}>Human expert review</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-lp-3)", lineHeight: 1.65 }}>Certified specialists catch the 60% of failures automation misses — keyboard traps, ARIA misuse, cognitive load.</p>
            </div>

            {/* ── Card F: Scan error state ── */}
            <div style={{ ...glass, padding: 24 }}>
              <div aria-hidden="true" style={{ width: 38, height: 38, background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--danger-lp)", marginBottom: 14 }}>
                <AlertCircle size={17} />
              </div>
              <h3 style={{ fontFamily: G, fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-lp-1)", marginBottom: 8, letterSpacing: "-0.01em" }}>What a scan failure looks like</h3>
              <div style={{ background: "rgba(248,81,73,0.06)", border: "1px solid rgba(248,81,73,0.18)", borderRadius: 8, padding: "10px 12px" }}>
                <p style={{ fontSize: "0.6875rem", color: "var(--danger-lp)", fontWeight: 600, marginBottom: 4 }}>Scan could not complete</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-lp-3)", lineHeight: 1.55 }}>The page returned a 403 or blocked our crawler. Try disabling bot protection or scanning a public URL.</p>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-lp-3)", marginTop: 10, lineHeight: 1.5 }}>Errors are explained in plain language — never just an error code.</p>
            </div>

            {/* ── Card G: VPAT + compliance (spans 2 cols) ── */}
            <div style={{ ...glass, gridColumn: "span 2", padding: 24, display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div aria-hidden="true" style={{ width: 38, height: 38, background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.25)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-lp)", marginBottom: 14 }}>
                  <FileText size={17} />
                </div>
                <h3 style={{ fontFamily: G, fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-lp-1)", marginBottom: 8, letterSpacing: "-0.01em" }}>VPAT &amp; compliance reports</h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-lp-3)", lineHeight: 1.65 }}>Close enterprise deals and meet procurement requirements with audit-ready VPAT exports. Legally defensible. Immediately sendable.</p>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div aria-hidden="true" style={{ width: 38, height: 38, background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.25)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-lp)", marginBottom: 14 }}>
                  <Globe size={17} />
                </div>
                <h3 style={{ fontFamily: G, fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-lp-1)", marginBottom: 8, letterSpacing: "-0.01em" }}>Universal Design audit</h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-lp-3)", lineHeight: 1.65 }}>WCAG is the legal floor, not the ceiling. UD audits surface exclusions that compliance standards never mention — but real users experience every day.</p>
              </div>
            </div>

            {/* ── Card H: AI fix suggestions ── */}
            <div style={{ ...glass, padding: 24 }}>
              <div aria-hidden="true" style={{ width: 38, height: 38, background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.25)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-lp)", marginBottom: 14 }}>
                <Zap size={17} />
              </div>
              <h3 style={{ fontFamily: G, fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-lp-1)", marginBottom: 8, letterSpacing: "-0.01em" }}>AI fix suggestions</h3>
              <div style={{ background: "rgba(63,185,80,0.06)", border: "1px solid rgba(63,185,80,0.15)", borderRadius: 8, padding: "8px 10px", marginBottom: 10 }}>
                <p style={{ fontSize: "0.625rem", color: "var(--success-lp)", fontWeight: 700, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Suggested fix</p>
                <code style={{ fontSize: "0.6875rem", color: "var(--success-lp)", fontFamily: "monospace" }}>{`<img src="…" alt="Product photo of…" />`}</code>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-lp-3)", lineHeight: 1.65 }}>Every issue. Ready-to-paste code. Exact WCAG criterion.</p>
            </div>

          </div>
        </section>

        {/* ── STATS BAR ── */}
        <div role="list" aria-label="Accessibility statistics" style={{ display: "flex", flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(15,23,42,0.5)" }}>
          {[
            { val: "98%",    label: "of sites fail — most have no idea" },
            { val: "€75K",   label: "max EAA fine for non-compliance" },
            { val: "1 in 6", label: "visitors you may be turning away" },
            { val: "70%",    label: "of failures automated tools alone miss" },
          ].map(({ val, label }, i, arr) => (
            <div key={val} role="listitem" style={{ flex: "1 1 160px", padding: "28px 20px", textAlign: "center", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <span style={{ fontFamily: G, fontSize: "clamp(1.5rem, 3vw, 1.875rem)", fontWeight: 700, color: "var(--text-lp-1)", display: "block", lineHeight: 1, letterSpacing: "-0.025em" }}>{val}</span>
              <span style={{ fontSize: "0.8125rem", color: "var(--text-lp-3)", marginTop: 7, lineHeight: 1.45, display: "block" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" aria-labelledby="how-heading" style={{ padding: "80px clamp(16px, 4vw, 48px)", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 52 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--brand-lp)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, fontFamily: G }}>How it works</p>
            <h2 id="how-heading" style={{ fontFamily: G, fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 700, color: "var(--text-lp-1)", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              From URL to full report in three steps.
            </h2>
          </div>
          <div className="lp-how-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {[
              { n: "01", title: "Scan", desc: "Paste any URL. Our engine checks every page against WCAG 2.1 AA, ADA, Section 508, and EAA 2025 in under 60 seconds. No account. No credit card." },
              { n: "02", title: "Review", desc: "See a prioritised issue list. Each failure shows severity, the exact element, a screenshot in context, and a flag when human eyes are needed to confirm." },
              { n: "03", title: "Fix & report", desc: "Apply AI-generated code fixes. Track your progress scan over scan. Export compliance reports your legal and procurement teams can actually use." },
            ].map(({ n, title, desc }) => (
              <div key={n} style={{ ...glass, padding: "28px 24px" }}>
                <div style={{ fontFamily: G, fontSize: "0.75rem", fontWeight: 700, color: "var(--brand-lp)", letterSpacing: "0.08em", marginBottom: 14 }} aria-hidden="true">{n}</div>
                <h3 style={{ fontFamily: G, fontSize: "1.0625rem", fontWeight: 600, color: "var(--text-lp-1)", marginBottom: 10, letterSpacing: "-0.01em" }}>{title}</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-lp-3)", lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section aria-labelledby="cta-heading" style={{ margin: "0 clamp(16px, 4vw, 48px) 80px" }}>
          <div style={{ ...glass, padding: "64px clamp(24px, 5vw, 80px)", textAlign: "center", background: "rgba(99,102,241,0.08)", borderColor: "rgba(129,140,248,0.2)" }}>
            <h2 id="cta-heading" style={{ fontFamily: G, fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", fontWeight: 700, color: "var(--text-lp-1)", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 18, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
              Don&apos;t wait for a complaint to find out your site excludes people.
            </h2>
            <p style={{ fontSize: "1rem", color: "var(--text-lp-3)", lineHeight: 1.75, marginBottom: 36, maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
              One free scan. Full picture. Under 60 seconds. No account, no credit card — just the truth about your site.
            </p>
            <Link href="/signup" style={{ background: "var(--brand-lp)", color: "#fff", fontFamily: G, fontSize: "0.9375rem", fontWeight: 600, padding: "13px 32px", borderRadius: 10, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, minHeight: 48 }}>
              Scan your site free →
            </Link>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px clamp(16px, 4vw, 48px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: "0.875rem", color: "var(--text-lp-3)" }}>
        <span style={{ fontFamily: G, fontWeight: 500 }}>© {new Date().getFullYear()} AccessiScan — Making the web work for everyone.</span>
        <nav aria-label="Footer links" style={{ display: "flex", gap: 20 }}>
          <a href="mailto:hello@accessiscan.com" style={{ color: "var(--text-lp-3)", textDecoration: "none" }}>Contact</a>
        </nav>
        <span>All systems operational</span>
      </footer>

      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition-duration: 0.01ms !important; }
        }
        a:focus-visible, button:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(129,140,248,0.5);
          border-radius: 6px;
        }
        /* Mobile: hide nav links + login */
        @media (max-width: 600px) {
          .lp-nav-links { display: none !important; }
          .lp-login-btn { display: none !important; }
        }
        /* Mobile: hero stacks to 1 col */
        @media (max-width: 768px) {
          .lp-hero-grid { grid-template-columns: 1fr !important; }
          .lp-hero-grid > *:last-child { display: none; }
        }
        /* Mobile: bento + how-it-works collapse to single column */
        @media (max-width: 700px) {
          .lp-bento { grid-template-columns: 1fr !important; }
          .lp-bento > * { grid-column: 1 !important; grid-row: auto !important; }
          .lp-how-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
