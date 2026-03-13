"use client";

import { useScans } from "@/hooks/use-api";
import Link from "next/link";

export default function DashboardPage() {
  const { data, loading } = useScans();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-50">
          Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Automated + Human-Powered Accessibility Auditing
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Overall Score", value: "—", sub: "Run your first scan", color: "#D97706" },
          { label: "Critical Issues", value: "0", sub: "None found yet", color: "#DC2626" },
          { label: "Human Reviews", value: "0", sub: "Pending your review", color: "#6366F1" },
          { label: "Pages Scanned", value: "0", sub: "Start scanning", color: "#059669" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-surface-raised border rounded-xl p-5"
            style={{ borderColor: "var(--color-border)" }}
          >
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {stat.label}
            </p>
            <p
              className="font-mono text-3xl font-extrabold mb-1"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
            <p className="text-[11px] text-slate-500">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Empty State — Get Started */}
      {(!data?.scans || data.scans.length === 0) && (
        <div
          className="bg-surface-raised border border-dashed rounded-2xl p-12 text-center"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-900/40 mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-slate-100 mb-2">
            Run your first accessibility scan
          </h2>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            Enter any URL to check it against WCAG 2.1 AA, ADA, and ARIA standards.
            Issues flagged for human review will appear in your review queue.
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-sm hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all min-touch"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <circle cx="12" cy="12" r="4" />
            </svg>
            Start Scanning
          </Link>
        </div>
      )}

      {/* Recent Scans */}
      {data?.scans && data.scans.length > 0 && (
        <section
          className="bg-surface-raised border rounded-xl"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
            <h2 className="text-sm font-semibold text-slate-300">Recent Scans</h2>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
            {data.scans.map((scan: any) => (
              <Link
                key={scan.id}
                href={`/issues?scanId=${scan.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-surface-overlay/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {scan.site?.name || scan.site?.url}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(scan.createdAt).toLocaleDateString()} · {scan._count?.issues || 0} issues
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className="font-mono text-lg font-bold"
                    style={{
                      color:
                        scan.score >= 80 ? "#059669" :
                        scan.score >= 50 ? "#D97706" : "#DC2626",
                    }}
                  >
                    {scan.score ?? "—"}
                  </span>
                  <p className="text-[10px] text-slate-500 uppercase">Score</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
