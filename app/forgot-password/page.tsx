"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Always show success to prevent email enumeration
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-50 tracking-tight">
            Reset your password
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            {sent ? "Check your inbox" : "Enter your email and we'll send a reset link"}
          </p>
        </div>

        <div className="bg-surface-raised border rounded-xl p-8" style={{ borderColor: "var(--color-border)" }}>
          {sent ? (
            <div className="text-center">
              {/* Success icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-900/40 border border-emerald-700/50 mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed mb-2">
                If <strong className="text-slate-100">{email}</strong> is registered, you'll receive a reset link within a minute.
              </p>
              <p className="text-slate-500 text-xs leading-relaxed mb-6">
                Check your spam folder if it doesn't arrive. The link expires in 1 hour.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full py-3 px-4 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-sm hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div role="alert" className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-5">
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-surface-overlay border text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  style={{ borderColor: "var(--color-border)" }}
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-sm hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}

          {!sent && (
            <p className="mt-6 text-center text-sm text-slate-400">
              Remembered it?{" "}
              <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
