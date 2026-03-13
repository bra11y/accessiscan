import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AccessiScan — Accessibility Auditing That Actually Works",
  description:
    "Automated WCAG scanning + real human expert review. Not an overlay. Not just automation. Get ADA, Section 508, and EAA compliance with actionable fix reports.",
  keywords:
    "accessibility audit, WCAG testing, ADA compliance, Section 508, web accessibility, accessibility scanner, VPAT, human accessibility review",
  openGraph: {
    title: "AccessiScan — Your Website Is Excluding People. Let's Fix That.",
    description:
      "Automated scanning + human expert review. WCAG 2.1 AA, ADA, Section 508 compliance with real fix suggestions.",
    type: "website",
  },
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* ─── Nav ─── */}
      <header className="border-b sticky top-0 bg-surface/90 backdrop-blur-sm z-50" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><circle cx="12" cy="12" r="4" /></svg>
            </div>
            <span className="font-display text-base font-bold text-slate-50">AccessiScan</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400" aria-label="Main">
            <a href="#features" className="hover:text-slate-200 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-200 transition-colors">How It Works</a>
            <Link href="/pricing" className="hover:text-slate-200 transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-400 hover:text-slate-200">Sign in</Link>
            <Link href="/signup" className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg transition-colors">
              Start free
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* ─── Hero ─── */}
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-900/30 border border-brand-700/40 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-brand-300 tracking-wide">
              Not an overlay. Real accessibility testing.
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-extrabold text-slate-50 tracking-tight leading-[1.1] mb-6 text-balance">
            Your website is{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">
              excluding people
            </span>
            .<br />
            Let&apos;s fix that.
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            AccessiScan combines automated WCAG scanning with real human expert review.
            Every issue comes with a specific code fix — not vague recommendations.
            ADA, Section 508, and EAA compliance in one platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-base hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all shadow-lg shadow-brand-500/20"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><circle cx="12" cy="12" r="4" /></svg>
              Start scanning free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl border text-slate-300 font-medium text-base hover:bg-surface-overlay transition-all"
              style={{ borderColor: "var(--color-border)" }}
            >
              View pricing →
            </Link>
          </div>

          <p className="text-xs text-slate-600">
            Free plan available. No credit card required. 14-day trial on paid plans.
          </p>
        </section>

        {/* ─── Social Proof Stats ─── */}
        <section className="border-y py-10" style={{ borderColor: "var(--color-border)" }}>
          <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "98%", label: "of websites fail basic accessibility" },
              { value: "€75k", label: "EAA fine per violation, per country" },
              { value: "70%", label: "of issues missed by automation alone" },
              { value: "$13B", label: "accessibility testing market (2025)" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="font-mono text-2xl md:text-3xl font-bold text-brand-400">{stat.value}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Features ─── */}
        <section id="features" className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-extrabold text-slate-50 tracking-tight mb-3">
              Everything overlays can&apos;t do
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Overlays address 30-40% of issues and often introduce new barriers.
              We test the actual DOM with real assistive technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🔍", title: "Automated Scanning",
                desc: "axe-core engine checks every page against 50+ WCAG 2.1 AA, ADA, and Section 508 criteria. CI/CD integration ready.",
              },
              {
                icon: "👁️", title: "Human Expert Review",
                desc: "Screenshots reviewed by CPACC-certified professionals using VoiceOver, JAWS, and keyboard navigation. Not AI guesses.",
              },
              {
                icon: "🎯", title: "Code Fix Suggestions",
                desc: "Every issue includes the exact HTML/CSS fix following the First Rule of ARIA. Copy, paste, ship.",
              },
              {
                icon: "👓", title: "Vision Simulations",
                desc: "See your site through 8 vision conditions: color blindness, low vision, cataracts, tunnel vision. Real empathy, not theory.",
              },
              {
                icon: "📋", title: "VPAT + Compliance Reports",
                desc: "Professional PDF reports for procurement. WCAG conformance tables, remediation priorities, and compliance timeline.",
              },
              {
                icon: "⚡", title: "Actionable Dashboard",
                desc: "Score tracking, issue triage with bulk actions, severity filtering, and export. Built for teams that ship fast.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-surface-raised border rounded-2xl p-7 hover:border-brand-700/40 transition-colors"
                style={{ borderColor: "var(--color-border)" }}
              >
                <span className="text-2xl mb-3 block" aria-hidden="true">{f.icon}</span>
                <h3 className="font-display text-base font-bold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section id="how-it-works" className="bg-surface-raised border-y py-20" style={{ borderColor: "var(--color-border)" }}>
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="font-display text-3xl font-extrabold text-slate-50 tracking-tight mb-3">
                Three steps to compliance
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Scan", desc: "Enter your URL. We crawl every page, run axe-core, and capture screenshots in under 60 seconds." },
                { step: "02", title: "Review", desc: "Issues flagged for human judgment get expert review with real assistive technology. You get detailed feedback." },
                { step: "03", title: "Fix & Report", desc: "Follow the code fix suggestions. Export your VPAT for procurement. Track your compliance score over time." },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-900/50 border border-brand-700/40 mb-4">
                    <span className="font-mono text-sm font-bold text-brand-400">{s.step}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-100 mb-2">{s.title}</h3>
                  <p className="text-[13px] text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display text-3xl font-extrabold text-slate-50 tracking-tight mb-4">
            Stop guessing. Start knowing.
          </h2>
          <p className="text-base text-slate-400 mb-8 max-w-lg mx-auto">
            Your first scan is free. See exactly what&apos;s broken, how to fix it,
            and prove compliance — all in one dashboard.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-base hover:from-brand-600 hover:to-brand-700 shadow-lg shadow-brand-500/20 transition-all"
          >
            Start your free scan →
          </Link>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t py-8" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} AccessiScan. Accessibility is not a feature — it&apos;s a right.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link href="/pricing" className="hover:text-slate-300">Pricing</Link>
            <a href="mailto:hello@accessiscan.com" className="hover:text-slate-300">Contact</a>
            <span>Built with CPACC expertise</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
