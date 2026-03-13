"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create account
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      // Auto sign in after signup
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created but sign in failed. Please try logging in.");
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

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
            Create your AccessiScan account
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Start auditing accessibility in minutes. Free forever.
          </p>
        </div>

        <div className="bg-surface-raised border border-surface-border rounded-xl p-8" style={{ borderColor: "var(--color-border)" }}>
          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <div role="alert" className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
                Full name
              </label>
              <input
                id="name" name="name" type="text" autoComplete="name" required
                value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-surface-overlay border text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                style={{ borderColor: "var(--color-border)" }}
                placeholder="Your name"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="signup-email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                id="signup-email" name="email" type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-surface-overlay border text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                style={{ borderColor: "var(--color-border)" }}
                placeholder="you@example.com"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="signup-password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                id="signup-password" name="password" type="password" autoComplete="new-password" required
                minLength={8}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-surface-overlay border text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                style={{ borderColor: "var(--color-border)" }}
                placeholder="Minimum 8 characters"
              />
              <p className="mt-1 text-xs text-slate-500">Must be at least 8 characters</p>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-sm hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-touch"
            >
              {loading ? "Creating account..." : "Create free account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
