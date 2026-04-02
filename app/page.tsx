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
            padding: "0 clamp(20px, 5vw, 48px)",
            background: "color-mix(in srgb, var(--bg) 88%, transparent)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--border-1)",
          }}
        >
          <Link
            href="/"
            aria-label="AccessiScan home"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              textDecoration: "none", color: "var(--text-lp-1)",
              fontWeight: 700, fontSize: "1rem",
              fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)",
            }}
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
                  color: "var(--text-lp-3)", fontSize: "0.9rem", fontWeight: 500,
                  textDecoration: "none", padding: "8px 12px", borderRadius: 8,
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
                color: "var(--text-lp-2)", fontSize: "0.9rem", fontWeight: 500,
                padding: "8px 16px", border: "1px solid var(--border-2)", borderRadius: 8,
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
                fontSize: "0.9rem", fontWeight: 600,
                padding: "8px 18px", borderRadius: 8, textDecoration: "none",
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
          style={{ padding: "88px clamp(20px, 5vw, 48px) 0", maxWidth: 820, margin: "0 auto", textAlign: "center" }}
        >
          {/* Eyebrow */}
          <div
            aria-label="Supports WCAG, ADA, Section 508, and EAA 2025"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              border: "1px solid var(--brand-lp-border)", background: "var(--brand-lp-subtle)",
              color: "var(--brand-lp)", fontSize: "0.75rem", fontWeight: 600,
              padding: "4px 14px", borderRadius: 100, marginBottom: 28,
              fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)",
              letterSpacing: "0.04em", textTransform: "uppercase",
            }}
          >
            <span aria-hidden="true" style={{ width: 5, height: 5, background: "var(--brand-lp)", borderRadius: "50%" }} />
            WCAG · ADA · Section 508 · EAA 2025
          </div>

          {/* H1 */}
          <h1
            id="hero-heading"
            style={{
              fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)",
              fontSize: "clamp(2.4rem, 6vw, 4.25rem)",
              fontWeight: 700,
              color: "var(--text-lp-1)",
              lineHeight: 1.08,
              letterSpacing: "-0.035em",
              marginBottom: 24,
            }}
          >
            Most websites exclude<br />
            1 in 6 visitors.{" "}
            <span style={{ color: "var(--brand-lp)" }}>Find out<br />if yours does.</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: "1.0625rem", color: "var(--text-lp-3)",
            lineHeight: 1.75, marginBottom: 36,
            maxWidth: 520, marginLeft: "auto", marginRight: "auto",
          }}>
            Accessibility failures cost you customers, damage your reputation, and in Europe carry fines up to €75,000. AccessiScan finds every issue in seconds — and tells you exactly what to fix.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
            <Link
              href="/scan"
              style={{
                background: "var(--brand-lp)", color: "#fff",
                fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)",
                fontSize: "0.9375rem", fontWeight: 600,
                padding: "13px 28px", borderRadius: 9, textDecoration: "none",
                minHeight: 48, display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              Scan your site free <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="#preview"
              style={{
                color: "var(--text-lp-2)", fontSize: "0.9375rem", fontWeight: 500,
                padding: "13px 28px", border: "1px solid var(--border-2)", borderRadius: 9,
                textDecoration: "none", minHeight: 48,
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              See a sample report
            </Link>
          </div>

          {/* Micro-trust */}
          <ul
            aria-label="What's included"
            style={{
              display: "flex", gap: 20, justifyContent: "center",
              listStyle: "none", padding: 0, flexWrap: "wrap",
              fontSize: "0.8125rem", color: "var(--text-lp-3)",
              marginBottom: 0,
            }}
          >
            {["No account needed", "Full results instantly", "1 free scan per session"].map((item) => (
              <li key={item} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Check size={13} aria-hidden="true" style={{ color: "var(--success-lp)", flexShrink: 0 }} />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* ── HERO MOCKUP (full-width, below headline) ── */}
        <div
          id="preview"
          style={{ padding: "48px clamp(20px, 5vw, 48px) 0", maxWidth: 1100, margin: "0 auto" }}
        >
          <div
            aria-label="Example scan result: example.com scored 72%, 14 issues found including 3 critical"
            style={{
              border: "1px solid var(--border-1)", borderRadius: 14,
              overflow: "hidden", background: "var(--surface-1)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* Browser chrome */}
            <div aria-hidden="true" style={{
              background: "var(--surface-2)", borderBottom: "1px solid var(--border-1)",
              padding: "10px 16px", display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#FF5F57","#FEBC2E","#28C840"].map((c) => (
                  <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
                ))}
              </div>
              <div style={{
                flex: 1, background: "var(--surface-1)", border: "1px solid var(--border-1)",
                borderRadius: 6, padding: "4px 12px", fontSize: "0.75rem", color: "var(--text-lp-3)",
                fontFamily: "monospace", maxWidth: 300,
              }}>
                app.accessiscan.com/scan/result
              </div>
            </div>

            {/* Scan content */}
            <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Left: score + issues */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: "0.875rem", color: "var(--text-lp-3)", fontWeight: 500 }}>Compliance score</span>
                  <div
                    role="progressbar" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100}
                    aria-label="72% compliant"
                    style={{ flex: 1, height: 6, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}
                  >
                    <div style={{ width: "72%", height: "100%", background: "var(--brand-lp)", borderRadius: 3 }} />
                  </div>
                  <span style={{ fontWeight: 700, color: "var(--warn-lp)", fontSize: "0.9375rem", fontFamily: "monospace" }}>72%</span>
                </div>

                <div role="list" aria-label="Scan scores" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
                  {[
                    { val: "72", label: "WCAG Score", color: "var(--warn-lp)" },
                    { val: "14", label: "Issues found", color: "var(--danger-lp)" },
                    { val: "3",  label: "Critical", color: "var(--danger-lp)" },
                  ].map(({ val, label, color }) => (
                    <div key={label} role="listitem" style={{
                      background: "var(--surface-2)", border: "1px solid var(--border-1)",
                      borderRadius: 8, padding: "12px 14px",
                    }}>
                      <div style={{
                        fontSize: "1.75rem", fontWeight: 700, color, lineHeight: 1,
                        fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)",
                      }}>{val}</div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-lp-3)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
                    </div>
                  ))}
                </div>

                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  background: "rgba(63,185,80,0.1)", border: "1px solid rgba(63,185,80,0.25)",
                  color: "var(--success-lp)", fontSize: "0.75rem", fontWeight: 600,
                  padding: "5px 12px", borderRadius: 100,
                }}>
                  <span aria-hidden="true" style={{ width: 6, height: 6, background: "var(--success-lp)", borderRadius: "50%" }} />
                  AccessiScan verified — 0 issues on this page
                </div>
              </div>

              {/* Right: issue list */}
              <ul aria-label="Top accessibility issues" style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                {[
                  { sev: "Critical", color: "rgba(248,81,73,0.15)", textColor: "var(--danger-lp)", title: "Images missing alt text", meta: "7 instances · WCAG 1.1.1 · ADA Section 508" },
                  { sev: "Serious",  color: "rgba(210,153,34,0.15)", textColor: "var(--warn-lp)",   title: "Color contrast fails 4.5:1 minimum", meta: "4 instances · WCAG 1.4.3" },
                  { sev: "Moderate", color: "rgba(129,140,248,0.15)", textColor: "var(--brand-lp)", title: "Form inputs missing labels", meta: "3 instances · WCAG 1.3.1" },
                  { sev: "Minor",    color: "rgba(107,114,128,0.15)", textColor: "#9CA3AF",           title: "Links missing descriptive text", meta: "2 instances · WCAG 2.4.6" },
                ].map(({ sev, color, textColor, title, meta }) => (
                  <li key={title} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    background: "var(--surface-2)", border: "1px solid var(--border-1)",
                    borderRadius: 7, padding: "9px 12px",
                  }}>
                    <span
                      aria-label={`${sev} severity`}
                      style={{
                        fontSize: "0.625rem", fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                        whiteSpace: "nowrap", flexShrink: 0, marginTop: 2,
                        background: color, color: textColor,
                      }}
                    >
                      {sev}
                    </span>
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
        <div
          role="list"
          aria-label="Accessibility statistics"
          style={{
            display: "flex", flexWrap: "wrap",
            borderTop: "1px solid var(--border-1)", borderBottom: "1px solid var(--border-1)",
            background: "var(--surface-2)", marginTop: 72,
          }}
        >
          {[
            { val: "98%",    label: "of sites fail — most have no idea" },
            { val: "€75K",   label: "max EAA fine for non-compliance in Europe" },
            { val: "1 in 6", label: "visitors you may be turning away" },
            { val: "70%",    label: "of real failures automated tools alone miss" },
          ].map(({ val, label }, i, arr) => (
            <div
              key={val}
              role="listitem"
              style={{
                flex: "1 1 160px", padding: "28px 24px", textAlign: "center",
                borderRight: i < arr.length - 1 ? "1px solid var(--border-1)" : "none",
              }}
            >
              <span style={{
                fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)",
                fontSize: "clamp(1.5rem, 3vw, 1.875rem)",
                fontWeight: 700, color: "var(--text-lp-1)",
                display: "block", lineHeight: 1, letterSpacing: "-0.02em",
              }}>{val}</span>
              <span style={{ fontSize: "0.8125rem", color: "var(--text-lp-3)", marginTop: 7, lineHeight: 1.45, display: "block" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── FEATURES ── */}
        <section id="features" aria-labelledby="features-heading" style={{ padding: "80px clamp(20px, 5vw, 48px)", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--brand-lp)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)" }}>Features</p>
            <h2
              id="features-heading"
              style={{
                fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)",
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                fontWeight: 700, color: "var(--text-lp-1)",
                letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 14,
              }}
            >
              Stop flying blind<br />on accessibility
            </h2>
            <p style={{ fontSize: "1rem", color: "var(--text-lp-3)", maxWidth: 460, lineHeight: 1.75 }}>
              Automated scans catch the obvious. Human experts catch the rest. We give you both.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 1, background: "var(--border-1)", border: "1px solid var(--border-1)", borderRadius: 14, overflow: "hidden" }}>
            {[
              {
                icon: <Search size={18} />, title: "Automated scanning",
                desc: "Paste any URL and get a complete failure list in seconds. Every issue maps to the exact WCAG criterion, ADA provision, and EAA article it violates — not just an error code.",
                tier: "Free tier",
              },
              {
                icon: <Eye size={18} />, title: "Vision simulation",
                desc: "See your site through the eyes of 300 million colour-blind people. Catch contrast failures and layout issues your own eyes can't detect.",
                tier: "Pro+",
              },
              {
                icon: <Users size={18} />, title: "Human expert review",
                desc: "Automated tools catch roughly 40% of accessibility failures. Certified specialists find the rest — keyboard traps, focus order errors, ARIA misuse, cognitive load issues.",
                tier: "Pro+",
              },
              {
                icon: <Zap size={18} />, title: "AI fix suggestions",
                desc: "Every issue comes with a ready-to-paste code fix. Not a vague recommendation — the exact change, the exact criterion, the exact line to fix.",
                tier: "All plans",
              },
              {
                icon: <FileText size={18} />, title: "VPAT reports",
                desc: "Close enterprise contracts and meet procurement requirements with audit-ready VPAT exports. Legally defensible. Immediately sendable.",
                tier: "Business+",
              },
              {
                icon: <Globe size={18} />, title: "Universal Design audit",
                desc: "WCAG is the legal floor, not the ceiling. UD audits surface exclusions that compliance standards never mention — but real users experience every day.",
                tier: "Pro+",
              },
            ].map(({ icon, title, desc, tier }) => (
              <div key={title} style={{ background: "var(--surface-1)", padding: "28px 26px" }} className="lp-feat-card">
                <div
                  aria-hidden="true"
                  style={{
                    width: 40, height: 40, background: "var(--brand-lp-subtle)",
                    border: "1px solid var(--brand-lp-border)", borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--brand-lp)", marginBottom: 16,
                  }}
                >{icon}</div>
                <h3 style={{
                  fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)",
                  fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-lp-1)",
                  marginBottom: 8, letterSpacing: "-0.01em",
                }}>{title}</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-lp-3)", lineHeight: 1.7 }}>{desc}</p>
                <span style={{
                  marginTop: 16, display: "inline-block",
                  fontSize: "0.6875rem", fontWeight: 600, padding: "3px 8px", borderRadius: 4,
                  background: "var(--brand-lp-subtle)", color: "var(--brand-lp)",
                  border: "1px solid var(--brand-lp-border)", letterSpacing: "0.03em",
                  fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)",
                }}>{tier}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section
          id="how-it-works"
          aria-labelledby="how-heading"
          style={{
            background: "var(--surface-2)",
            borderTop: "1px solid var(--border-1)",
            borderBottom: "1px solid var(--border-1)",
            padding: "80px clamp(20px, 5vw, 48px)",
          }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ marginBottom: 56 }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--brand-lp)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)" }}>How it works</p>
              <h2
                id="how-heading"
                style={{
                  fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)",
                  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                  fontWeight: 700, color: "var(--text-lp-1)",
                  letterSpacing: "-0.03em", lineHeight: 1.15,
                }}
              >
                Most accessibility audits take weeks.<br />This takes three steps.
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {[
                {
                  n: "01",
                  title: "Scan",
                  desc: "Paste any URL. Our engine checks every page against WCAG 2.1 AA, ADA, Section 508, and EAA 2025 in under 60 seconds. No account needed. No credit card.",
                },
                {
                  n: "02",
                  title: "Review",
                  desc: "See a prioritised issue list — not a wall of error codes. Each failure shows severity, which users it affects, the exact element, and a flag when human eyes are needed to confirm.",
                },
                {
                  n: "03",
                  title: "Fix & report",
                  desc: "Apply AI-generated code fixes directly. Track your progress scan over scan. Export compliance reports your legal and procurement teams can actually use.",
                },
              ].map(({ n, title, desc }) => (
                <div key={n} style={{ background: "var(--surface-1)", border: "1px solid var(--border-1)", borderRadius: 12, padding: "28px 26px" }}>
                  <div style={{
                    fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)",
                    fontSize: "0.75rem", fontWeight: 700, color: "var(--brand-lp)",
                    letterSpacing: "0.08em", marginBottom: 16,
                  }} aria-hidden="true">{n}</div>
                  <h3 style={{
                    fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)",
                    fontSize: "1.0625rem", fontWeight: 600, color: "var(--text-lp-1)",
                    marginBottom: 10, letterSpacing: "-0.01em",
                  }}>{title}</h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-lp-3)", lineHeight: 1.7 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section
          id="pricing"
          aria-labelledby="pricing-heading"
          style={{ padding: "80px clamp(20px, 5vw, 48px)", maxWidth: 1100, margin: "0 auto" }}
        >
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--brand-lp)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)" }}>Pricing</p>
            <h2
              id="pricing-heading"
              style={{
                fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)",
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                fontWeight: 700, color: "var(--text-lp-1)",
                letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 14,
              }}
            >
              Start free. Scale when<br />compliance gets serious.
            </h2>
            <p style={{ fontSize: "1rem", color: "var(--text-lp-3)", maxWidth: 460, lineHeight: 1.75 }}>
              The free plan catches more than most paid tools. Upgrade for human expert review, vision simulations, and the reports your legal team will ask for.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {[
              {
                name: "Free", price: "$0", period: "", desc: "See what you're missing — no card needed",
                icon: <Zap size={16} />, cta: "Get started free", ctaHref: "/signup", featured: false,
                features: ["1 website", "5 pages per scan", "3 scans per month", "WCAG 2.1 AA checks", "Basic issue reports"],
              },
              {
                name: "Pro", price: "$49", period: "/mo", desc: "For developers who take accessibility seriously",
                icon: <Shield size={16} />, cta: "Start 14-day trial", ctaHref: "/signup", featured: true,
                features: ["5 websites", "50 pages per scan", "30 scans per month", "Human expert review", "Vision simulations"],
              },
              {
                name: "Business", price: "$149", period: "/mo", desc: "For agencies that need to prove compliance",
                icon: <Crown size={16} />, cta: "Start 14-day trial", ctaHref: "/signup", featured: false,
                features: ["25 websites", "200 pages per scan", "Unlimited scans", "VPAT + audit reports", "Dedicated support"],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                style={{
                  background: plan.featured ? "var(--brand-lp-subtle)" : "var(--surface-1)",
                  border: plan.featured ? "1px solid var(--brand-lp-border)" : "1px solid var(--border-1)",
                  borderRadius: 14, padding: 28,
                  display: "flex", flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: plan.featured ? "var(--brand-lp)" : "var(--surface-2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: plan.featured ? "#fff" : "var(--text-lp-3)",
                  }}>{plan.icon}</div>
                  <div>
                    <div style={{
                      fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)",
                      fontWeight: 700, color: "var(--text-lp-1)", fontSize: "0.9375rem",
                      letterSpacing: "-0.01em",
                    }}>{plan.name}</div>
                    <div style={{ fontSize: "0.6875rem", color: "var(--text-lp-3)" }}>{plan.desc}</div>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <span style={{
                    fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)",
                    fontSize: "2.5rem", fontWeight: 700,
                    color: "var(--text-lp-1)", letterSpacing: "-0.03em",
                  }}>{plan.price}</span>
                  {plan.period && (
                    <span style={{ fontSize: "0.875rem", color: "var(--text-lp-3)", marginLeft: 2 }}>{plan.period}</span>
                  )}
                </div>

                <Link
                  href={plan.ctaHref}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "11px 20px", borderRadius: 9, textDecoration: "none",
                    fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)",
                    fontSize: "0.875rem", fontWeight: 600, minHeight: 44, marginBottom: 24,
                    ...(plan.featured
                      ? { background: "var(--brand-lp)", color: "#fff" }
                      : { background: "transparent", color: "var(--text-lp-2)", border: "1px solid var(--border-2)" }),
                  }}
                >{plan.cta}</Link>

                <ul style={{ listStyle: "none", padding: 0, flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8125rem", color: "var(--text-lp-3)", padding: "5px 0" }}>
                      <Check size={13} aria-hidden="true" style={{ color: "var(--success-lp)", flexShrink: 0 }} />
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
        <section
          aria-labelledby="cta-heading"
          style={{
            margin: "0 clamp(20px, 5vw, 48px) 80px",
            borderRadius: 16,
            background: "var(--surface-2)",
            border: "1px solid var(--border-1)",
            padding: "64px clamp(24px, 5vw, 80px)",
            textAlign: "center",
          }}
        >
          <h2
            id="cta-heading"
            style={{
              fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)",
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              fontWeight: 700, color: "var(--text-lp-1)",
              letterSpacing: "-0.03em", lineHeight: 1.15,
              marginBottom: 18, maxWidth: 560, marginLeft: "auto", marginRight: "auto",
            }}
          >
            Don&apos;t wait for a complaint to find out your site excludes people.
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--text-lp-3)", lineHeight: 1.75, marginBottom: 36, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            Most teams discover accessibility failures from a user complaint — or worse, a lawsuit. One free scan gives you the full picture in under 60 seconds. No account. No credit card. Just the truth about your site.
          </p>
          <Link
            href="/scan"
            style={{
              background: "var(--brand-lp)", color: "#fff",
              fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)",
              fontSize: "0.9375rem", fontWeight: 600,
              padding: "13px 32px", borderRadius: 9,
              textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, minHeight: 48,
            }}
          >
            Scan your site free <span aria-hidden="true">→</span>
          </Link>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid var(--border-1)",
        padding: "24px clamp(20px, 5vw, 48px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
        fontSize: "0.875rem", color: "var(--text-lp-3)",
      }}>
        <span style={{ fontFamily: "var(--font-grotesk, 'Space Grotesk', sans-serif)", fontWeight: 500 }}>
          © {new Date().getFullYear()} AccessiScan — Making the web work for everyone.
        </span>
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
        .lp-feat-card:hover { background: var(--surface-2) !important; transition: background 0.15s; }
        a:focus-visible, button:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(129,140,248,0.5);
          border-radius: 6px;
        }
        @media (max-width: 640px) {
          #preview > div { margin: 0 !important; border-radius: 10px !important; }
        }
      `}</style>
    </div>
  );
}
