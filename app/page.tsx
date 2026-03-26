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
  Shield,
  Crown,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AccessiScan — Know exactly where your site fails accessibility",
  description:
    "Automated WCAG 2.1 AA, ADA, Section 508, and EAA compliance scanning. Full results instantly. No account needed for your first scan.",
  keywords:
    "accessibility audit, WCAG testing, ADA compliance, Section 508, EAA, web accessibility, accessibility scanner, VPAT",
  openGraph: {
    title: "AccessiScan — Know exactly where your site fails accessibility",
    description:
      "Run a free accessibility audit on any URL. Full results, AI fix suggestions, and human expert review.",
    type: "website",
  },
};

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
            padding: "0 40px",
            background: "color-mix(in srgb, var(--bg) 88%, transparent)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--border-1)",
          }}
        >
          <Link
            href="/"
            aria-label="AccessiScan home"
            style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "var(--text-lp-1)", fontWeight: 700, fontSize: "1.0625rem" }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 28, height: 28, background: "var(--brand-lp)",
                borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 800, fontSize: "0.875rem",
              }}
            >A</span>
            AccessiScan
          </Link>

          <div style={{ display: "flex", gap: 4 }}>
            {[
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How it works" },
              { href: "#pricing", label: "Pricing" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  color: "var(--text-lp-3)", fontSize: "0.9375rem", fontWeight: 500,
                  textDecoration: "none", padding: "8px 14px", borderRadius: 8,
                  minHeight: 44, display: "inline-flex", alignItems: "center",
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link
              href="/login"
              style={{
                color: "var(--text-lp-2)", fontSize: "0.9375rem", fontWeight: 500,
                padding: "9px 18px", border: "1px solid var(--border-2)", borderRadius: 8,
                background: "transparent", textDecoration: "none",
                minHeight: 44, display: "inline-flex", alignItems: "center",
              }}
            >
              Log in
            </Link>
            <Link
              href="/scan"
              style={{
                background: "var(--brand-lp)", color: "#fff",
                fontSize: "0.9375rem", fontWeight: 600,
                padding: "9px 20px", borderRadius: 8, textDecoration: "none",
                minHeight: 44, display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              Scan free <span aria-hidden="true">→</span>
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
            gap: 48, alignItems: "center",
            padding: "72px 40px 64px", maxWidth: 1200, margin: "0 auto",
            position: "relative",
          }}
        >


          {/* Left: copy */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              aria-label="Supports WCAG, ADA, Section 508, and EAA 2025"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                border: "1px solid var(--brand-lp-border)", background: "var(--brand-lp-subtle)",
                color: "var(--brand-lp)", fontSize: "0.8125rem", fontWeight: 600,
                padding: "5px 14px", borderRadius: 100, marginBottom: 20,
              }}
            >
              <span aria-hidden="true" style={{ width: 6, height: 6, background: "var(--brand-lp)", borderRadius: "50%" }} />
              WCAG · ADA · Section 508 · EAA 2025
            </div>

            <h1
              id="hero-heading"
              style={{
                fontSize: "clamp(1.875rem, 3.5vw, 2.875rem)",
                fontWeight: 700, color: "var(--text-lp-1)",
                lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 18,
              }}
            >
              Know exactly where your site fails accessibility.
            </h1>

            <p style={{
              fontSize: "1.0625rem", color: "var(--text-lp-3)",
              lineHeight: 1.7, marginBottom: 32, maxWidth: 460,
            }}>
              AccessiScan audits any URL against WCAG 2.1 AA, ADA, Section 508, and EAA 2025 in seconds — and gives you a prioritised fix list, not a wall of error codes.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
              <Link
                href="/scan"
                style={{
                  background: "var(--brand-lp)", color: "#fff",
                  fontSize: "1rem", fontWeight: 600,
                  padding: "13px 28px", borderRadius: 8, textDecoration: "none",
                  minHeight: 48, display: "inline-flex", alignItems: "center", gap: 8,
                }}
              >
                Scan your site free <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="#preview"
                style={{
                  color: "var(--text-lp-2)", fontSize: "1rem", fontWeight: 500,
                  padding: "13px 28px", border: "1px solid var(--border-2)", borderRadius: 8,
                  textDecoration: "none", minHeight: 48,
                  display: "inline-flex", alignItems: "center", gap: 8,
                }}
              >
                See a sample report
              </Link>
            </div>

            {/* Micro-proof */}
            <ul
              aria-label="What's included"
              style={{ display: "flex", gap: 16, listStyle: "none", padding: 0, flexWrap: "wrap", fontSize: "0.875rem", color: "var(--text-lp-3)" }}
            >
              {["No account needed", "Full results instantly", "1 free scan per session"].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Check size={14} aria-hidden="true" style={{ color: "var(--success-lp)", flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Dashboard preview */}
          <div
            id="preview"
            aria-label="Example scan result: example.com scored 72%, 14 issues found including 3 critical"
            style={{ position: "relative", zIndex: 1 }}
          >
            <div style={{
              border: "1px solid var(--border-1)", borderRadius: 12,
              overflow: "hidden", background: "var(--surface-1)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04)",
            }}>
              {/* Browser chrome */}
              <div aria-hidden="true" style={{
                background: "var(--surface-2)", borderBottom: "1px solid var(--border-1)",
                padding: "10px 14px", display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {["#FF5F57","#FEBC2E","#28C840"].map((c) => (
                    <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                  ))}
                </div>
                <div style={{
                  flex: 1, background: "var(--surface-1)", border: "1px solid var(--border-1)",
                  borderRadius: 5, padding: "4px 10px", fontSize: "0.75rem", color: "var(--text-lp-3)",
                  fontFamily: "monospace",
                }}>
                  app.accessiscan.com/scan/result
                </div>
              </div>

              <div style={{ padding: 16 }}>
                {/* Progress bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: "0.875rem", color: "var(--text-lp-3)", fontWeight: 500 }}>Compliance</span>
                  <div
                    role="progressbar"
                    aria-valuenow={72} aria-valuemin={0} aria-valuemax={100}
                    aria-label="72% compliant"
                    style={{ flex: 1, height: 6, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}
                  >
                    <div style={{ width: "72%", height: "100%", background: "var(--brand-lp)", borderRadius: 3 }} />
                  </div>
                  <span style={{ fontWeight: 700, color: "var(--warn-lp)", fontSize: "0.875rem" }}>72%</span>
                </div>

                {/* Score cards */}
                <div
                  role="list"
                  aria-label="Scan scores"
                  style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}
                >
                  {[
                    { val: "72", label: "WCAG Score", color: "var(--warn-lp)" },
                    { val: "14", label: "Issues found", color: "var(--danger-lp)" },
                    { val: "3",  label: "Critical",    color: "var(--danger-lp)" },
                  ].map(({ val, label, color }) => (
                    <div key={label} role="listitem" style={{
                      background: "var(--surface-2)", border: "1px solid var(--border-1)",
                      borderRadius: 8, padding: "12px 14px",
                    }}>
                      <div style={{ fontSize: "1.625rem", fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-lp-3)", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Issue list */}
                <ul aria-label="Top accessibility issues" style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                  {[
                    { sev: "Critical", color: "rgba(248,81,73,0.15)", textColor: "var(--danger-lp)", title: "Images missing alt text", meta: "7 instances · WCAG 1.1.1 · ADA Section 508", highlight: true },
                    { sev: "Serious",  color: "rgba(210,153,34,0.15)", textColor: "var(--warn-lp)",   title: "Color contrast fails 4.5:1 minimum", meta: "4 instances · WCAG 1.4.3", highlight: false },
                    { sev: "Moderate", color: "rgba(129,140,248,0.15)", textColor: "var(--brand-lp)", title: "Form inputs missing labels", meta: "3 instances · WCAG 1.3.1", highlight: false },
                  ].map(({ sev, color, textColor, title, meta, highlight }) => (
                    <li key={title} style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      background: highlight ? "var(--brand-lp-subtle)" : "var(--surface-2)",
                      border: `1px solid ${highlight ? "var(--brand-lp-border)" : "var(--border-1)"}`,
                      borderRadius: 6, padding: "10px 12px",
                    }}>
                      <span
                        aria-label={`${sev} severity`}
                        style={{
                          fontSize: "0.6875rem", fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                          whiteSpace: "nowrap", flexShrink: 0, marginTop: 1,
                          background: color, color: textColor,
                          display: "flex", alignItems: "center", gap: 4,
                        }}
                      >
                        <span aria-hidden="true">●</span> {sev}
                      </span>
                      <div>
                        <div style={{ color: "var(--text-lp-1)", fontWeight: 600, fontSize: "0.8125rem" }}>{title}</div>
                        <div style={{ color: "var(--text-lp-3)", fontSize: "0.75rem", marginTop: 1 }}>{meta}</div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Verified badge */}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-1)" }}>
                  <div
                    aria-label="This page is AccessiScan verified with 0 issues"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      background: "rgba(63,185,80,0.1)", border: "1px solid rgba(63,185,80,0.25)",
                      color: "var(--success-lp)", fontSize: "0.75rem", fontWeight: 600,
                      padding: "4px 12px", borderRadius: 100,
                    }}
                  >
                    <span aria-hidden="true" style={{ width: 6, height: 6, background: "var(--success-lp)", borderRadius: "50%" }} />
                    This page is AccessiScan verified — 0 issues
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <div
          role="list"
          aria-label="Accessibility statistics"
          style={{
            display: "flex", borderTop: "1px solid var(--border-1)", borderBottom: "1px solid var(--border-1)",
            background: "var(--surface-2)",
          }}
        >
          {[
            { val: "98%",    label: "of websites fail basic accessibility checks" },
            { val: "€75K",   label: "max fine under the European Accessibility Act" },
            { val: "1 in 6", label: "people worldwide live with a disability" },
            { val: "70%",    label: "of issues require human review to fully catch" },
          ].map(({ val, label }, i, arr) => (
            <div
              key={val}
              role="listitem"
              style={{
                flex: 1, padding: "24px 20px", textAlign: "center",
                borderRight: i < arr.length - 1 ? "1px solid var(--border-1)" : "none",
              }}
            >
              <span style={{ fontSize: "1.625rem", fontWeight: 700, color: "var(--text-lp-1)", display: "block", lineHeight: 1 }}>{val}</span>
              <span style={{ fontSize: "0.875rem", color: "var(--text-lp-3)", marginTop: 6, lineHeight: 1.4, display: "block" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── FEATURES ── */}
        <section id="features" aria-labelledby="features-heading" style={{ padding: "72px 40px", maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--brand-lp)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Features</p>
          <h2 id="features-heading" style={{ fontSize: "clamp(1.5rem, 2.8vw, 2rem)", fontWeight: 700, color: "var(--text-lp-1)", letterSpacing: "-0.01em", lineHeight: 1.25, marginBottom: 12 }}>
            Everything you need to fix accessibility
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--text-lp-3)", maxWidth: 500, lineHeight: 1.7, marginBottom: 40 }}>
            From automated detection to expert human review to legal-grade compliance reports.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--border-1)", border: "1px solid var(--border-1)", borderRadius: 12, overflow: "hidden" }}>
            {[
              { icon: <Search size={20} />, title: "Automated scanning",    desc: "axe-core engine checks WCAG 2.1 AA, ADA, Section 508, and EAA 2025 across every page — in seconds.",                                      tier: "Free tier" },
              { icon: <Eye size={20} />, title: "Vision simulation",     desc: "Preview your site through 8 color blindness and low vision filters. See what 1 in 12 men experience on your pages.",                    tier: "Pro+" },
              { icon: <Users size={20} />, title: "Human expert review",   desc: "Certified specialists review what automation misses — keyboard flows, cognitive load, ARIA context, focus order.",                      tier: "Pro+" },
              { icon: <Zap size={20} />, title: "AI fix suggestions",     desc: "Every issue includes a ready-to-paste code fix with the exact WCAG criterion and implementation notes.",                                 tier: "All plans" },
              { icon: <FileText size={20} />, title: "VPAT reports",           desc: "Generate audit-ready Voluntary Product Accessibility Templates for legal, procurement, and enterprise compliance.",                      tier: "Business+" },
              { icon: <Globe size={20} />, title: "Universal Design audit", desc: "Go beyond WCAG. Evaluate against all 7 Universal Design principles for deeper, more inclusive coverage.",                               tier: "Pro+" },
            ].map(({ icon, title, desc, tier }) => (
              <div
                key={title}
                style={{ background: "var(--surface-1)", padding: "28px 24px" }}
                className="lp-feat-card"
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: 42, height: 42, background: "var(--brand-lp-subtle)",
                    border: "1px solid var(--brand-lp-border)", borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--brand-lp)", marginBottom: 16,
                  }}
                >{icon}</div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-lp-1)", marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: "0.9375rem", color: "var(--text-lp-3)", lineHeight: 1.65 }}>{desc}</p>
                <span style={{
                  marginTop: 14, display: "inline-block",
                  fontSize: "0.6875rem", fontWeight: 600, padding: "3px 8px", borderRadius: 4,
                  background: "var(--brand-lp-subtle)", color: "var(--brand-lp)",
                  border: "1px solid var(--brand-lp-border)", letterSpacing: "0.03em",
                }}>{tier}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section
          id="how-it-works"
          aria-labelledby="how-heading"
          style={{ background: "var(--surface-2)", borderTop: "1px solid var(--border-1)", borderBottom: "1px solid var(--border-1)", padding: "72px 40px" }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--brand-lp)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>How it works</p>
            <h2 id="how-heading" style={{ fontSize: "clamp(1.5rem, 2.8vw, 2rem)", fontWeight: 700, color: "var(--text-lp-1)", letterSpacing: "-0.01em", marginBottom: 40 }}>
              From URL to compliant in three steps
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
              {[
                { n: "1", title: "Scan",         desc: "Enter any URL. Our engine crawls your pages and runs every major accessibility check in seconds. No account or credit card needed for your first scan." },
                { n: "2", title: "Review",        desc: "See a prioritised issue list — severity levels, WCAG criterion references, element selectors, and flags for issues that need human review." },
                { n: "3", title: "Fix & report",  desc: "Apply AI-generated code fixes, track remediation over time, and export compliance reports your legal team can actually use." },
              ].map(({ n, title, desc }) => (
                <div key={n} style={{ background: "var(--surface-1)", border: "1px solid var(--border-1)", borderRadius: 12, padding: "28px 24px" }}>
                  <div
                    aria-hidden="true"
                    style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: "var(--brand-lp-subtle)", border: "1px solid var(--brand-lp-border)",
                      color: "var(--brand-lp)", fontSize: "0.875rem", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                    }}
                  >{n}</div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-lp-1)", marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: "0.9375rem", color: "var(--text-lp-3)", lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section
          id="pricing"
          aria-labelledby="pricing-heading"
          style={{ padding: "72px 40px", maxWidth: 1100, margin: "0 auto" }}
        >
          <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--brand-lp)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Pricing</p>
          <h2 id="pricing-heading" style={{ fontSize: "clamp(1.5rem, 2.8vw, 2rem)", fontWeight: 700, color: "var(--text-lp-1)", letterSpacing: "-0.01em", lineHeight: 1.25, marginBottom: 12 }}>
            Simple, transparent pricing
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--text-lp-3)", maxWidth: 500, lineHeight: 1.7, marginBottom: 40 }}>
            Start free. Upgrade when you need human expert reviews, vision simulations, and compliance reports.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[
              {
                name: "Free", price: "$0", period: "", desc: "Try AccessiScan on one site",
                icon: <Zap size={18} />, cta: "Get Started", ctaHref: "/signup", ctaStyle: "ghost" as const,
                features: ["1 website", "5 pages per scan", "3 scans per month", "WCAG 2.1 AA checks", "Basic issue reports"],
              },
              {
                name: "Pro", price: "$49", period: "/mo", desc: "For freelancers and small teams",
                icon: <Shield size={18} />, cta: "Start 14-Day Trial", ctaHref: "/signup", ctaStyle: "primary" as const, popular: true,
                features: ["5 websites", "50 pages per scan", "30 scans per month", "Human expert review", "Vision simulations"],
              },
              {
                name: "Business", price: "$149", period: "/mo", desc: "For agencies and enterprise compliance",
                icon: <Crown size={18} />, cta: "Start 14-Day Trial", ctaHref: "/signup", ctaStyle: "primary" as const,
                features: ["25 websites", "200 pages per scan", "Unlimited scans", "VPAT + audit reports", "Dedicated support"],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                style={{
                  background: "var(--surface-1)",
                  border: plan.popular ? "2px solid var(--brand-lp)" : "1px solid var(--border-1)",
                  borderRadius: 12, padding: 28, position: "relative",
                  display: "flex", flexDirection: "column",
                }}
              >
                {plan.popular && (
                  <span style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    background: "var(--brand-lp)", color: "#fff",
                    fontSize: "0.625rem", fontWeight: 700, padding: "4px 12px", borderRadius: 100,
                    letterSpacing: "0.05em", textTransform: "uppercase",
                  }}>Most Popular</span>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: plan.popular ? "var(--brand-lp)" : "var(--surface-2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: plan.popular ? "#fff" : "var(--text-lp-3)",
                  }}>{plan.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-lp-1)", fontSize: "1rem" }}>{plan.name}</div>
                    <div style={{ fontSize: "0.6875rem", color: "var(--text-lp-3)" }}>{plan.desc}</div>
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--text-lp-1)", fontFamily: "monospace" }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: "0.875rem", color: "var(--text-lp-3)" }}>{plan.period}</span>}
                </div>
                <Link
                  href={plan.ctaHref}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "12px 20px", borderRadius: 8, textDecoration: "none",
                    fontSize: "0.875rem", fontWeight: 600, minHeight: 44, marginBottom: 20,
                    ...(plan.ctaStyle === "primary"
                      ? { background: "var(--brand-lp)", color: "#fff" }
                      : { background: "transparent", color: "var(--text-lp-2)", border: "1px solid var(--border-2)" }),
                  }}
                >{plan.cta}</Link>
                <ul style={{ listStyle: "none", padding: 0, flex: 1 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8125rem", color: "var(--text-lp-3)", padding: "6px 0" }}>
                      <Check size={14} aria-hidden="true" style={{ color: "var(--success-lp)", flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 28, fontSize: "0.875rem", color: "var(--text-lp-3)" }}>
            Need enterprise compliance?{" "}
            <a href="mailto:hello@accessiscan.com" style={{ color: "var(--brand-lp)", textDecoration: "none" }}>Contact sales</a>
            {" · "}
            <Link href="/pricing" style={{ color: "var(--brand-lp)", textDecoration: "none" }}>View full plan comparison</Link>
          </p>
        </section>

        {/* ── FINAL CTA ── */}
        <section aria-labelledby="cta-heading" style={{ padding: "72px 40px", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
          <h2 id="cta-heading" style={{ fontSize: "clamp(1.5rem, 2.8vw, 2rem)", fontWeight: 700, color: "var(--text-lp-1)", marginBottom: 16 }}>
            Start with a free scan — no sign-up needed.
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--text-lp-3)", lineHeight: 1.7, marginBottom: 32 }}>
            See your real accessibility issues in under 60 seconds. Create a free account when you&apos;re ready to fix them and track progress over time.
          </p>
          <Link
            href="/scan"
            style={{
              background: "var(--brand-lp)", color: "#fff",
              fontSize: "1rem", fontWeight: 600, padding: "13px 32px",
              borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, minHeight: 48,
            }}
          >
            Scan your site free <span aria-hidden="true">→</span>
          </Link>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid var(--border-1)",
        padding: "28px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
        fontSize: "0.9375rem", color: "var(--text-lp-3)",
      }}>
        <span>© {new Date().getFullYear()} AccessiScan. Building a more inclusive web.</span>
        <nav aria-label="Footer links" style={{ display: "flex", gap: 20 }}>
          <Link href="/pricing" style={{ color: "var(--text-lp-3)", textDecoration: "none" }}>Pricing</Link>
          <a href="mailto:hello@accessiscan.com" style={{ color: "var(--text-lp-3)", textDecoration: "none" }}>Contact</a>
        </nav>
        <span>All systems operational</span>
      </footer>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition-duration: 0.01ms !important; }
        }
        .lp-feat-card:hover { background: var(--surface-2) !important; }
        a:focus-visible, button:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(129,140,248,0.5);
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
