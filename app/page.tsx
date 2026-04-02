import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Search,
  Eye,
  Users,
  Zap,
  FileText,
  Globe,
  Check,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AccessiScan — Find every accessibility failure on your site in 60 seconds",
  description:
    "Paste a URL. Get a complete list of accessibility failures — severity levels, WCAG criteria, and ready-to-paste code fixes. Covers WCAG 2.1 AA, ADA, Section 508, and EAA 2025.",
  keywords:
    "accessibility audit, WCAG testing, ADA compliance, Section 508, EAA, web accessibility, accessibility scanner, VPAT",
  openGraph: {
    title: "AccessiScan — Find every accessibility failure on your site in 60 seconds",
    description:
      "98% of websites fail basic accessibility checks. Find out where yours fails — and exactly how to fix it. Free scan, no account needed.",
    type: "website",
  },
};

// ── Shared font style ──
const G = "var(--font-grotesk, 'Space Grotesk', sans-serif)";

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
            position: "sticky", top: 0, zIndex: 100,
            height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 clamp(16px, 4vw, 48px)",
            background: "color-mix(in srgb, var(--bg) 88%, transparent)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--border-1)",
          }}
        >
          <Link
            href="/"
            aria-label="AccessiScan home"
            style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", color: "var(--text-lp-1)", fontWeight: 700, fontSize: "1rem", fontFamily: G }}
          >
            <span aria-hidden="true" style={{ width: 28, height: 28, background: "var(--brand-lp)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "0.875rem", flexShrink: 0 }}>A</span>
            AccessiScan
          </Link>

          {/* Desktop nav links — hidden on mobile */}
          <div className="lp-nav-links" style={{ display: "flex", gap: 4 }}>
            {[
              { href: "#how-it-works", label: "How it works" },
              { href: "#features", label: "Features" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ color: "var(--text-lp-3)", fontSize: "0.9rem", fontWeight: 500, textDecoration: "none", padding: "8px 12px", borderRadius: 8, minHeight: 44, display: "inline-flex", alignItems: "center" }}>
                {label}
              </Link>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/login" className="lp-login-btn" style={{ color: "var(--text-lp-2)", fontSize: "0.9rem", fontWeight: 500, padding: "8px 16px", border: "1px solid var(--border-2)", borderRadius: 8, background: "transparent", textDecoration: "none", minHeight: 44, display: "inline-flex", alignItems: "center" }}>
              Log in
            </Link>
            <Link href="/signup" style={{ background: "var(--brand-lp)", color: "#fff", fontSize: "0.9rem", fontWeight: 600, padding: "8px 18px", borderRadius: 8, textDecoration: "none", minHeight: 44, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: G }}>
              Get started <span aria-hidden="true">→</span>
            </Link>
          </div>
        </nav>
      </header>

      <main id="main-content">

        {/* ── HERO ── */}
        <section
          aria-labelledby="hero-heading"
          style={{ padding: "80px clamp(16px, 4vw, 48px) 0", maxWidth: 800, margin: "0 auto", textAlign: "center" }}
        >
          <div
            aria-label="Supports WCAG, ADA, Section 508, and EAA 2025"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              border: "1px solid var(--brand-lp-border)", background: "var(--brand-lp-subtle)",
              color: "var(--brand-lp)", fontSize: "0.6875rem", fontWeight: 700,
              padding: "4px 14px", borderRadius: 100, marginBottom: 28,
              fontFamily: G, letterSpacing: "0.06em", textTransform: "uppercase",
            }}
          >
            <span aria-hidden="true" style={{ width: 5, height: 5, background: "var(--brand-lp)", borderRadius: "50%" }} />
            WCAG · ADA · Section 508 · EAA 2025
          </div>

          <h1
            id="hero-heading"
            style={{
              fontFamily: G,
              fontSize: "clamp(2.25rem, 6vw, 4.25rem)",
              fontWeight: 700, color: "var(--text-lp-1)",
              lineHeight: 1.08, letterSpacing: "-0.035em", marginBottom: 22,
            }}
          >
            Most websites exclude<br />
            1 in 6 visitors.{" "}
            <span style={{ color: "var(--brand-lp)" }}>Is yours one of them?</span>
          </h1>

          <p style={{ fontSize: "1.0625rem", color: "var(--text-lp-3)", lineHeight: 1.75, marginBottom: 36, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
            Accessibility failures cost you customers, damage your reputation, and in Europe carry fines up to €75,000. AccessiScan finds every issue in seconds — and tells you exactly what to fix.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 22 }}>
            <Link href="/signup" style={{ background: "var(--brand-lp)", color: "#fff", fontFamily: G, fontSize: "0.9375rem", fontWeight: 600, padding: "13px 28px", borderRadius: 9, textDecoration: "none", minHeight: 48, display: "inline-flex", alignItems: "center", gap: 8 }}>
              Scan your site free <span aria-hidden="true">→</span>
            </Link>
            <Link href="#how-it-works" style={{ color: "var(--text-lp-2)", fontSize: "0.9375rem", fontWeight: 500, padding: "13px 28px", border: "1px solid var(--border-2)", borderRadius: 9, textDecoration: "none", minHeight: 48, display: "inline-flex", alignItems: "center", gap: 8 }}>
              See how it works
            </Link>
          </div>

          <ul aria-label="What's included" style={{ display: "flex", gap: 20, justifyContent: "center", listStyle: "none", padding: 0, flexWrap: "wrap", fontSize: "0.8125rem", color: "var(--text-lp-3)" }}>
            {["No account needed", "Full results instantly", "1 free scan per session"].map((item) => (
              <li key={item} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Check size={13} aria-hidden="true" style={{ color: "var(--success-lp)", flexShrink: 0 }} />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* ── HERO MOCKUP ── */}
        <div style={{ padding: "48px clamp(16px, 4vw, 48px) 0", maxWidth: 1100, margin: "0 auto" }}>
          <div
            aria-label="Example scan result: example.com scored 72%, 14 issues found including 3 critical"
            style={{ border: "1px solid var(--border-1)", borderRadius: 14, overflow: "hidden", background: "var(--surface-1)", boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)" }}
          >
            {/* Browser chrome */}
            <div aria-hidden="true" style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border-1)", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#FF5F57","#FEBC2E","#28C840"].map((c) => (
                  <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
                ))}
              </div>
              <div style={{ flex: 1, background: "var(--surface-1)", border: "1px solid var(--border-1)", borderRadius: 6, padding: "4px 12px", fontSize: "0.75rem", color: "var(--text-lp-3)", fontFamily: "monospace", maxWidth: 300 }}>
                app.accessiscan.com/scan/result
              </div>
            </div>

            <div className="lp-mockup-grid" style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Left: scores */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: "0.8125rem", color: "var(--text-lp-3)", fontWeight: 500, whiteSpace: "nowrap" }}>Compliance score</span>
                  <div role="progressbar" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100} aria-label="72% compliant" style={{ flex: 1, height: 6, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: "72%", height: "100%", background: "var(--brand-lp)", borderRadius: 3 }} />
                  </div>
                  <span style={{ fontWeight: 700, color: "var(--warn-lp)", fontSize: "0.9375rem", fontFamily: "monospace", flexShrink: 0 }}>72%</span>
                </div>
                <div role="list" aria-label="Scan scores" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
                  {[
                    { val: "72", label: "WCAG Score", color: "var(--warn-lp)" },
                    { val: "14", label: "Issues", color: "var(--danger-lp)" },
                    { val: "3",  label: "Critical", color: "var(--danger-lp)" },
                  ].map(({ val, label, color }) => (
                    <div key={label} role="listitem" style={{ background: "var(--surface-2)", border: "1px solid var(--border-1)", borderRadius: 8, padding: "12px 10px" }}>
                      <div style={{ fontFamily: G, fontSize: "1.625rem", fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
                      <div style={{ fontSize: "0.625rem", color: "var(--text-lp-3)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(63,185,80,0.1)", border: "1px solid rgba(63,185,80,0.25)", color: "var(--success-lp)", fontSize: "0.6875rem", fontWeight: 600, padding: "4px 10px", borderRadius: 100 }}>
                  <span aria-hidden="true" style={{ width: 6, height: 6, background: "var(--success-lp)", borderRadius: "50%" }} />
                  0 issues on /about
                </div>
              </div>
              {/* Right: issue list */}
              <ul aria-label="Top accessibility issues" style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                {[
                  { sev: "Critical", bg: "rgba(248,81,73,0.15)", c: "var(--danger-lp)", title: "Images missing alt text", meta: "7 instances · WCAG 1.1.1" },
                  { sev: "Serious",  bg: "rgba(210,153,34,0.15)", c: "var(--warn-lp)",   title: "Colour contrast fails 4.5:1", meta: "4 instances · WCAG 1.4.3" },
                  { sev: "Moderate", bg: "rgba(129,140,248,0.15)", c: "var(--brand-lp)", title: "Form inputs missing labels", meta: "3 instances · WCAG 1.3.1" },
                  { sev: "Minor",    bg: "rgba(107,114,128,0.15)", c: "#9CA3AF",          title: "Links missing descriptive text", meta: "2 instances · WCAG 2.4.6" },
                ].map(({ sev, bg, c, title, meta }) => (
                  <li key={title} style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "var(--surface-2)", border: "1px solid var(--border-1)", borderRadius: 7, padding: "8px 10px" }}>
                    <span aria-label={`${sev} severity`} style={{ fontSize: "0.6rem", fontWeight: 700, padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap", flexShrink: 0, marginTop: 2, background: bg, color: c }}>{sev}</span>
                    <div>
                      <div style={{ color: "var(--text-lp-1)", fontWeight: 600, fontSize: "0.8125rem" }}>{title}</div>
                      <div style={{ color: "var(--text-lp-3)", fontSize: "0.6875rem", marginTop: 2 }}>{meta}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── STATS BAR ── */}
        <div role="list" aria-label="Accessibility statistics" style={{ display: "flex", flexWrap: "wrap", borderTop: "1px solid var(--border-1)", borderBottom: "1px solid var(--border-1)", background: "var(--surface-2)", marginTop: 72 }}>
          {[
            { val: "98%",    label: "of sites fail — most have no idea" },
            { val: "€75K",   label: "max EAA fine for non-compliance" },
            { val: "1 in 6", label: "visitors you may be turning away" },
            { val: "70%",    label: "of failures automated tools alone miss" },
          ].map(({ val, label }, i, arr) => (
            <div key={val} role="listitem" style={{ flex: "1 1 160px", padding: "28px 20px", textAlign: "center", borderRight: i < arr.length - 1 ? "1px solid var(--border-1)" : "none" }}>
              <span style={{ fontFamily: G, fontSize: "clamp(1.5rem, 3vw, 1.875rem)", fontWeight: 700, color: "var(--text-lp-1)", display: "block", lineHeight: 1, letterSpacing: "-0.02em" }}>{val}</span>
              <span style={{ fontSize: "0.8125rem", color: "var(--text-lp-3)", marginTop: 7, lineHeight: 1.45, display: "block" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── HOW IT WORKS (walkthrough) ── */}
        <section id="how-it-works" aria-labelledby="how-heading" style={{ padding: "80px clamp(16px, 4vw, 48px)", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 52 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--brand-lp)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, fontFamily: G }}>How it works</p>
            <h2 id="how-heading" style={{ fontFamily: G, fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 700, color: "var(--text-lp-1)", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              From URL to full report<br />in three steps.
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Step 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, background: "var(--surface-1)", border: "1px solid var(--border-1)", borderRadius: 14, overflow: "hidden" }} className="lp-step-grid">
              <div style={{ padding: "36px 36px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontFamily: G, fontSize: "0.75rem", fontWeight: 700, color: "var(--brand-lp)", letterSpacing: "0.08em", marginBottom: 14 }} aria-hidden="true">STEP 01</div>
                <h3 style={{ fontFamily: G, fontSize: "1.25rem", fontWeight: 700, color: "var(--text-lp-1)", letterSpacing: "-0.02em", marginBottom: 12 }}>Enter any URL</h3>
                <p style={{ fontSize: "0.9375rem", color: "var(--text-lp-3)", lineHeight: 1.7 }}>
                  Paste any public URL — your homepage, a product page, or an entire site. No setup, no account, no credit card. Hit scan and we do the rest.
                </p>
              </div>
              {/* URL input mockup */}
              <div style={{ background: "var(--surface-2)", borderLeft: "1px solid var(--border-1)", padding: "32px 28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: 360 }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-lp-3)", marginBottom: 10, fontFamily: G, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Website URL</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "var(--surface-1)", border: "1px solid var(--brand-lp-border)", borderRadius: 8, padding: "0 12px", height: 44 }}>
                      <Search size={14} style={{ color: "var(--brand-lp)", flexShrink: 0 }} aria-hidden="true" />
                      <span style={{ fontSize: "0.875rem", color: "var(--text-lp-2)", fontFamily: "monospace" }}>https://yoursite.com</span>
                      <span style={{ width: 2, height: 16, background: "var(--brand-lp)", borderRadius: 1, marginLeft: "auto", animation: "blink 1s step-end infinite" }} aria-hidden="true" />
                    </div>
                    <div style={{ height: 44, padding: "0 16px", background: "var(--brand-lp)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: G, fontSize: "0.875rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                      Scan free
                    </div>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                    {["Scans up to 5 pages on free tier", "WCAG 2.1 AA · ADA · Section 508 · EAA", "Results ready in under 60 seconds"].map((t) => (
                      <li key={t} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.75rem", color: "var(--text-lp-3)" }}>
                        <Check size={11} aria-hidden="true" style={{ color: "var(--success-lp)", flexShrink: 0 }} />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, background: "var(--surface-1)", border: "1px solid var(--border-1)", borderRadius: 14, overflow: "hidden" }} className="lp-step-grid">
              <div style={{ padding: "36px 36px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontFamily: G, fontSize: "0.75rem", fontWeight: 700, color: "var(--brand-lp)", letterSpacing: "0.08em", marginBottom: 14 }} aria-hidden="true">STEP 02</div>
                <h3 style={{ fontFamily: G, fontSize: "1.25rem", fontWeight: 700, color: "var(--text-lp-1)", letterSpacing: "-0.02em", marginBottom: 12 }}>Watch it scan in real time</h3>
                <p style={{ fontSize: "0.9375rem", color: "var(--text-lp-3)", lineHeight: 1.7 }}>
                  Our engine crawls every page, runs axe-core, captures element screenshots, and checks against WCAG, ADA, Section 508, and EAA 2025 simultaneously. Watch the progress live.
                </p>
              </div>
              {/* Scan progress mockup */}
              <div style={{ background: "var(--surface-2)", borderLeft: "1px solid var(--border-1)", padding: "32px 28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: 360 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: "0.8125rem", color: "var(--text-lp-2)", fontFamily: G, fontWeight: 600 }}>Scanning yoursite.com…</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--brand-lp)", fontFamily: "monospace", fontWeight: 700 }}>64%</span>
                  </div>
                  <div role="progressbar" aria-valuenow={64} aria-valuemin={0} aria-valuemax={100} aria-label="Scan 64% complete" style={{ height: 6, background: "var(--surface-1)", borderRadius: 3, overflow: "hidden", marginBottom: 18 }}>
                    <div style={{ width: "64%", height: "100%", background: "var(--brand-lp)", borderRadius: 3 }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { page: "/", status: "done", issues: 3 },
                      { page: "/about", status: "done", issues: 0 },
                      { page: "/products", status: "scanning", issues: null },
                      { page: "/contact", status: "queued", issues: null },
                    ].map(({ page, status, issues }) => (
                      <div key={page} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: "var(--surface-1)", border: "1px solid var(--border-1)", borderRadius: 6 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: status === "done" ? "var(--success-lp)" : status === "scanning" ? "var(--brand-lp)" : "var(--border-2)", flexShrink: 0 }} aria-hidden="true" />
                        <span style={{ fontFamily: "monospace", fontSize: "0.8125rem", color: "var(--text-lp-2)", flex: 1 }}>{page}</span>
                        {issues !== null && (
                          <span style={{ fontSize: "0.6875rem", color: issues > 0 ? "var(--danger-lp)" : "var(--success-lp)", fontWeight: 600 }}>
                            {issues > 0 ? `${issues} issues` : "✓ Clean"}
                          </span>
                        )}
                        {status === "scanning" && <span style={{ fontSize: "0.6875rem", color: "var(--brand-lp)" }}>Scanning…</span>}
                        {status === "queued" && <span style={{ fontSize: "0.6875rem", color: "var(--text-lp-3)" }}>Queued</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, background: "var(--surface-1)", border: "1px solid var(--border-1)", borderRadius: 14, overflow: "hidden" }} className="lp-step-grid">
              <div style={{ padding: "36px 36px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontFamily: G, fontSize: "0.75rem", fontWeight: 700, color: "var(--brand-lp)", letterSpacing: "0.08em", marginBottom: 14 }} aria-hidden="true">STEP 03</div>
                <h3 style={{ fontFamily: G, fontSize: "1.25rem", fontWeight: 700, color: "var(--text-lp-1)", letterSpacing: "-0.02em", marginBottom: 12 }}>Get a prioritised fix list</h3>
                <p style={{ fontSize: "0.9375rem", color: "var(--text-lp-3)", lineHeight: 1.7 }}>
                  Every issue comes with its severity level, the exact element that failed, a screenshot in context, and a ready-to-paste code fix. Track remediation over time and export compliance reports.
                </p>
                <Link href="/signup" style={{ marginTop: 24, display: "inline-flex", alignItems: "center", gap: 8, color: "var(--brand-lp)", fontFamily: G, fontSize: "0.9rem", fontWeight: 600, textDecoration: "none" }}>
                  Try it on your site <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
              {/* Results mockup */}
              <div style={{ background: "var(--surface-2)", borderLeft: "1px solid var(--border-1)", padding: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: 360 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontFamily: G, fontSize: "0.875rem", fontWeight: 700, color: "var(--text-lp-1)" }}>14 issues found</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-lp-3)" }}>3 pages scanned</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                    {[{ n: "3", label: "Critical", c: "var(--danger-lp)", bg: "rgba(248,81,73,0.12)" }, { n: "4", label: "Serious", c: "var(--warn-lp)", bg: "rgba(210,153,34,0.12)" }, { n: "5", label: "Moderate", c: "var(--brand-lp)", bg: "rgba(129,140,248,0.12)" }, { n: "2", label: "Minor", c: "#9CA3AF", bg: "rgba(107,114,128,0.12)" }].map(({ n, label, c, bg }) => (
                      <div key={label} style={{ flex: 1, textAlign: "center", background: bg, borderRadius: 6, padding: "8px 4px" }}>
                        <div style={{ fontFamily: G, fontSize: "1.125rem", fontWeight: 700, color: c }}>{n}</div>
                        <div style={{ fontSize: "0.5625rem", color: c, textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 2 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  {[
                    { sev: "Critical", c: "var(--danger-lp)", bg: "rgba(248,81,73,0.12)", title: "Images missing alt text", fix: "Add alt=\"…\" to 7 img elements" },
                    { sev: "Serious", c: "var(--warn-lp)", bg: "rgba(210,153,34,0.12)", title: "Colour contrast fails 4.5:1", fix: "Change text from #888 to #555" },
                  ].map(({ sev, c, bg, title, fix }) => (
                    <div key={title} style={{ background: "var(--surface-1)", border: "1px solid var(--border-1)", borderRadius: 7, padding: "10px 10px", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                        <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: bg, color: c, textTransform: "uppercase" }}>{sev}</span>
                        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-lp-1)" }}>{title}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", background: "rgba(63,185,80,0.08)", border: "1px solid rgba(63,185,80,0.15)", borderRadius: 5 }}>
                        <Zap size={10} style={{ color: "var(--success-lp)", flexShrink: 0 }} aria-hidden="true" />
                        <span style={{ fontSize: "0.6875rem", color: "var(--success-lp)", fontFamily: "monospace" }}>{fix}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" aria-labelledby="features-heading" style={{ padding: "80px clamp(16px, 4vw, 48px)", maxWidth: 1100, margin: "0 auto", background: "var(--bg)" }}>
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--brand-lp)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, fontFamily: G }}>Features</p>
            <h2 id="features-heading" style={{ fontFamily: G, fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 700, color: "var(--text-lp-1)", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 14 }}>
              Everything you need<br />to stay compliant
            </h2>
            <p style={{ fontSize: "1rem", color: "var(--text-lp-3)", maxWidth: 440, lineHeight: 1.75 }}>
              Automated scans catch the obvious. Human experts catch the rest.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1, background: "var(--border-1)", border: "1px solid var(--border-1)", borderRadius: 14, overflow: "hidden" }}>
            {[
              { icon: <Search size={18} />, title: "Automated scanning", desc: "Paste any URL and get a complete failure list in seconds — mapped to the exact WCAG criterion, ADA provision, and EAA article, not just an error code.", tier: "Free tier" },
              { icon: <Eye size={18} />, title: "Vision simulation", desc: "See your site through the eyes of 300 million colour-blind people. Catch contrast failures and layout issues your own eyes can't detect.", tier: "Pro+" },
              { icon: <Users size={18} />, title: "Human expert review", desc: "Automated tools catch roughly 40% of failures. Certified specialists find the rest — keyboard traps, focus order errors, ARIA misuse, cognitive load.", tier: "Pro+" },
              { icon: <Zap size={18} />, title: "AI fix suggestions", desc: "Every issue comes with a ready-to-paste code fix. Not vague advice — the exact change, the exact criterion, the exact line.", tier: "All plans" },
              { icon: <FileText size={18} />, title: "VPAT reports", desc: "Close enterprise contracts and meet procurement requirements with audit-ready VPAT exports. Legally defensible. Immediately sendable.", tier: "Business+" },
              { icon: <Globe size={18} />, title: "Universal Design audit", desc: "WCAG is the legal floor, not the ceiling. UD audits surface exclusions compliance standards never mention — but real users experience every day.", tier: "Pro+" },
            ].map(({ icon, title, desc, tier }) => (
              <div key={title} style={{ background: "var(--surface-1)", padding: "28px 26px" }} className="lp-feat-card">
                <div aria-hidden="true" style={{ width: 40, height: 40, background: "var(--brand-lp-subtle)", border: "1px solid var(--brand-lp-border)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-lp)", marginBottom: 16 }}>{icon}</div>
                <h3 style={{ fontFamily: G, fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-lp-1)", marginBottom: 8, letterSpacing: "-0.01em" }}>{title}</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-lp-3)", lineHeight: 1.7 }}>{desc}</p>
                <span style={{ marginTop: 16, display: "inline-block", fontSize: "0.6875rem", fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: "var(--brand-lp-subtle)", color: "var(--brand-lp)", border: "1px solid var(--brand-lp-border)", letterSpacing: "0.03em", fontFamily: G }}>{tier}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section
          aria-labelledby="cta-heading"
          style={{ margin: "0 clamp(16px, 4vw, 48px) 80px", borderRadius: 16, background: "var(--surface-2)", border: "1px solid var(--border-1)", padding: "64px clamp(24px, 5vw, 80px)", textAlign: "center" }}
        >
          <h2 id="cta-heading" style={{ fontFamily: G, fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", fontWeight: 700, color: "var(--text-lp-1)", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 18, maxWidth: 540, marginLeft: "auto", marginRight: "auto" }}>
            Don&apos;t wait for a complaint to find out your site excludes people.
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--text-lp-3)", lineHeight: 1.75, marginBottom: 36, maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}>
            Most teams discover accessibility failures from a user complaint — or worse, a lawsuit. One free scan gives you the full picture in under 60 seconds.
          </p>
          <Link href="/signup" style={{ background: "var(--brand-lp)", color: "#fff", fontFamily: G, fontSize: "0.9375rem", fontWeight: 600, padding: "13px 32px", borderRadius: 9, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, minHeight: 48 }}>
            Scan your site free <span aria-hidden="true">→</span>
          </Link>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid var(--border-1)", padding: "24px clamp(16px, 4vw, 48px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: "0.875rem", color: "var(--text-lp-3)" }}>
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

        .lp-feat-card:hover { background: var(--surface-2) !important; transition: background 0.15s; }

        a:focus-visible, button:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(129,140,248,0.5);
          border-radius: 6px;
        }

        /* Mobile: hide nav links, login button */
        @media (max-width: 600px) {
          .lp-nav-links { display: none !important; }
          .lp-login-btn { display: none !important; }
        }

        /* Mobile: stack mockup grid to single column */
        @media (max-width: 700px) {
          .lp-mockup-grid { grid-template-columns: 1fr !important; }
          .lp-step-grid   { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
