"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X, Zap, Shield, Users, Crown } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    key: "FREE",
    monthly: 0,
    yearly: 0,
    description: "Try AccessiScan on one site",
    cta: "Get Started",
    ctaStyle: "border",
    features: [
      { text: "1 website", included: true },
      { text: "5 pages per scan", included: true },
      { text: "3 scans per month", included: true },
      { text: "WCAG 2.1 AA checks", included: true },
      { text: "Basic issue reports", included: true },
      { text: "Human expert review", included: false },
      { text: "Vision simulations", included: false },
      { text: "VPAT export", included: false },
      { text: "Priority support", included: false },
    ],
    icon: <Zap size={20} />,
  },
  {
    name: "Pro",
    key: "PRO",
    monthly: 49,
    yearly: 39,
    description: "For freelancers and small teams",
    cta: "Start 14-Day Trial",
    ctaStyle: "primary",
    popular: true,
    features: [
      { text: "5 websites", included: true },
      { text: "50 pages per scan", included: true },
      { text: "30 scans per month", included: true },
      { text: "WCAG 2.1 AA + ADA checks", included: true },
      { text: "Detailed fix suggestions", included: true },
      { text: "Human expert review", included: true },
      { text: "Vision simulations", included: true },
      { text: "VPAT export", included: false },
      { text: "Priority support", included: true },
    ],
    icon: <Shield size={20} />,
  },
  {
    name: "Business",
    key: "BUSINESS",
    monthly: 149,
    yearly: 119,
    description: "For agencies and enterprise compliance",
    cta: "Start 14-Day Trial",
    ctaStyle: "primary",
    features: [
      { text: "25 websites", included: true },
      { text: "200 pages per scan", included: true },
      { text: "Unlimited scans", included: true },
      { text: "Full compliance suite", included: true },
      { text: "Code-level fix suggestions", included: true },
      { text: "Priority human review", included: true },
      { text: "All vision simulations", included: true },
      { text: "VPAT + audit reports", included: true },
      { text: "Dedicated support", included: true },
    ],
    icon: <Crown size={20} />,
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async (planKey: string) => {
    if (planKey === "FREE") {
      router.push("/signup");
      return;
    }

    setLoading(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, billing }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        // Not logged in — redirect to signup
        router.push("/signup");
      }
    } catch {
      router.push("/signup");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <header className="border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display text-base font-bold text-slate-50">AccessiScan</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-400 hover:text-slate-200">Sign in</Link>
            <Link href="/signup" className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg">
              Start free
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-extrabold text-slate-50 tracking-tight mb-3">
            Simple, transparent pricing
          </h1>
          <p className="text-base text-slate-400 max-w-lg mx-auto mb-8">
            Start free. Upgrade when you need human expert reviews, vision simulations, and compliance reports.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-surface-raised border rounded-xl p-1.5" style={{ borderColor: "var(--color-border)" }}>
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                billing === "monthly"
                  ? "bg-brand-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                billing === "yearly"
                  ? "bg-brand-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Yearly
              <span className="text-[10px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {PLANS.map((plan) => {
            const price = billing === "yearly" ? plan.yearly : plan.monthly;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.key}
                className={`relative bg-surface-raised border rounded-2xl p-7 flex flex-col ${
                  isPopular ? "border-brand-600 ring-1 ring-brand-600/30" : ""
                }`}
                style={{ borderColor: isPopular ? undefined : "var(--color-border)" }}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center gap-2.5 mb-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isPopular ? "bg-brand-600 text-white" : "bg-surface-overlay text-slate-400"
                  }`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{plan.name}</h3>
                    <p className="text-[11px] text-slate-500">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-4xl font-extrabold text-slate-50">
                      ${price}
                    </span>
                    {price > 0 && (
                      <span className="text-sm text-slate-500">/mo</span>
                    )}
                  </div>
                  {billing === "yearly" && price > 0 && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Billed ${price * 12}/year
                    </p>
                  )}
                  {price === 0 && (
                    <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
                      Free forever
                    </p>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleCheckout(plan.key)}
                  disabled={loading === plan.key}
                  className={`w-full py-3 rounded-xl text-sm font-bold mb-6 transition-all min-touch ${
                    plan.ctaStyle === "primary"
                      ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700"
                      : "border text-slate-300 hover:bg-surface-overlay"
                  } ${loading === plan.key ? "opacity-50 cursor-not-allowed" : ""}`}
                  style={plan.ctaStyle === "border" ? { borderColor: "var(--color-border)" } : undefined}
                >
                  {loading === plan.key ? "Redirecting..." : plan.cta}
                </button>

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px]">
                      {f.included ? (
                        <Check size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X size={14} className="text-slate-600 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={f.included ? "text-slate-300" : "text-slate-600"}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Enterprise CTA */}
        <div
          className="bg-surface-raised border rounded-2xl p-8 text-center"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h3 className="font-display text-xl font-bold text-slate-100 mb-2">
            Need enterprise compliance?
          </h3>
          <p className="text-sm text-slate-400 mb-5 max-w-md mx-auto">
            Dedicated accessibility expert, custom integrations, SLA guarantee, and white-label reports.
          </p>
          <Link
            href="mailto:hello@accessiscan.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-overlay border text-slate-200 font-semibold text-sm hover:bg-brand-900/30 transition-all"
            style={{ borderColor: "var(--color-border)" }}
          >
            <Users size={16} />
            Contact Sales
          </Link>
        </div>
      </main>
    </div>
  );
}
