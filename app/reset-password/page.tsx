"use client";

import { useState, FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const mismatch = confirm.length > 0 && password !== confirm;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Invalid link — no token or email in URL
  if (!token || !email) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-900/40 border border-red-700/50 mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <p className="text-slate-200 text-sm mb-5">This reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="inline-flex items-center justify-center w-full py-3 px-4 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-900/40 border border-emerald-700/50 mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-slate-200 text-sm mb-2">Password updated successfully.</p>
        <p className="text-slate-500 text-xs mb-5">Redirecting you to sign in…</p>
        <Link href="/login" className="inline-flex items-center justify-center w-full py-3 px-4 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
          Sign in now
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div role="alert" className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
          {error}
          {error.includes("expired") && (
            <> {" "}
              <Link href="/forgot-password" className="underline text-red-200 hover:text-white">
                Request a new link
              </Link>
            </>
          )}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="new-password" className="block text-sm font-medium text-slate-300 mb-1.5">
          New password
        </label>
        <input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-surface-overlay border text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          style={{ borderColor: "var(--color-border)" }}
          placeholder="Minimum 8 characters"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-1.5">
          Confirm new password
        </label>
        <input
          id="confirm-password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-surface-overlay border text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          style={{ borderColor: mismatch ? "#f87171" : "var(--color-border)" }}
          placeholder="Repeat your new password"
          aria-describedby={mismatch ? "pw-mismatch" : undefined}
        />
        {mismatch && (
          <p id="pw-mismatch" className="mt-1 text-xs text-red-400" role="alert">
            Passwords don't match
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !password || !confirm || mismatch}
        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-sm hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-50 tracking-tight">
            Choose a new password
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Make it strong — you only do this once
          </p>
        </div>

        <div className="bg-surface-raised border rounded-xl p-8" style={{ borderColor: "var(--color-border)" }}>
          <Suspense fallback={<div className="text-slate-400 text-sm text-center">Loading…</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
