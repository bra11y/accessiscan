"use client";

import { useState, useEffect } from "react";
import { Bell, Slack, Mail, Check, Loader2 } from "lucide-react";

export default function NotificationsPage() {
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing settings
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          if (data.setting) {
            setSlackWebhookUrl(data.setting.slackWebhookUrl || "");
            setEmailAddress(data.setting.emailAddress || "");
            setEnabled(data.setting.enabled ?? true);
          }
        }
      } catch {
        // No settings yet — that's fine
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slackWebhookUrl, emailAddress, enabled }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save settings");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-slate-500">
        <Loader2 size={18} className="animate-spin" />
        Loading notification settings...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center">
            <Bell size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-50 tracking-tight">
              Notifications
            </h1>
            <p className="text-xs text-slate-500">
              Get alerted when scans complete or accessibility issues change
            </p>
          </div>
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <div
        className="bg-surface-raised border rounded-2xl p-6 mb-5"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100">
              Enable notifications
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Receive alerts when scans finish and when accessibility score changes
            </p>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            role="switch"
            aria-checked={enabled}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              enabled ? "bg-brand-600" : "bg-surface-overlay"
            }`}
            style={{ border: `1px solid ${enabled ? "transparent" : "var(--color-border)"}` }}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                enabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Slack Webhook */}
      <div
        className="bg-surface-raised border rounded-2xl p-6 mb-5"
        style={{ borderColor: "var(--color-border)", opacity: enabled ? 1 : 0.5 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-surface-overlay flex items-center justify-center">
            <Slack size={16} className="text-slate-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">Slack</h2>
            <p className="text-xs text-slate-500">
              Send scan results to a Slack channel via webhook
            </p>
          </div>
        </div>
        <label htmlFor="slack-webhook" className="block text-xs font-semibold text-slate-400 mb-2">
          Webhook URL
        </label>
        <input
          id="slack-webhook"
          type="url"
          placeholder="https://hooks.slack.com/services/..."
          value={slackWebhookUrl}
          onChange={(e) => setSlackWebhookUrl(e.target.value)}
          disabled={!enabled}
          className="w-full px-4 py-3 rounded-xl bg-surface-overlay border text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
          style={{ borderColor: "var(--color-border)" }}
        />
        <p className="text-[11px] text-slate-500 mt-2">
          Create an incoming webhook in your Slack workspace settings, then paste the URL here.
        </p>
      </div>

      {/* Email Address */}
      <div
        className="bg-surface-raised border rounded-2xl p-6 mb-6"
        style={{ borderColor: "var(--color-border)", opacity: enabled ? 1 : 0.5 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-surface-overlay flex items-center justify-center">
            <Mail size={16} className="text-slate-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">Email</h2>
            <p className="text-xs text-slate-500">
              Send scan summaries to an email address
            </p>
          </div>
        </div>
        <label htmlFor="notify-email" className="block text-xs font-semibold text-slate-400 mb-2">
          Email address
        </label>
        <input
          id="notify-email"
          type="email"
          placeholder="team@example.com"
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
          disabled={!enabled}
          className="w-full px-4 py-3 rounded-xl bg-surface-overlay border text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderColor: "var(--color-border)" }}
        />
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-7 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-purple-700 text-white text-sm font-bold flex items-center gap-2 hover:from-brand-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-touch"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check size={16} />
              Saved
            </>
          ) : (
            "Save Settings"
          )}
        </button>

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
