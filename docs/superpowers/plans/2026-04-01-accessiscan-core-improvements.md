# AccessiScan Core Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the broken UD scanner, add load speed metrics, open the free tier, add Ko-fi + theme system, and rebuild the dashboard with Recharts data visualizations.

**Architecture:** Async fire-and-forget pattern for UD scanner (matching main scanner), CSS custom-property theme system driven by `data-theme` on `<html>`, Recharts for dashboard charts rendered client-side from the existing `/api/scan` response.

**Tech Stack:** Next.js 14, Prisma/PostgreSQL, Puppeteer, axe-core, Recharts, date-fns, Tailwind CSS, TypeScript

---

## File Map

| File | What changes |
|------|-------------|
| `prisma/schema.prisma` | Add `UDReport` model, `UDScanStatus` enum, `ttfb/domReady/fullLoad` on `Scan` |
| `app/api/scan/route.ts` | Plan limits → 999 |
| `lib/scanner.ts` | Capture `performance.timing` after first page load |
| `app/dashboard/scan/page.tsx` | Add Performance card to results |
| `lib/ud-scanner.ts` | Accept `reportId`, update DB through lifecycle |
| `app/api/ud-scan/route.ts` | Async pattern: POST creates record + fires background, GET polls |
| `hooks/use-api.ts` | Add `useUDScanProgress(reportId)` |
| `app/dashboard/universal-design/page.tsx` | Polling pattern, Tailwind rewrite, overflow fix |
| `app/globals.css` | 4 theme blocks + Apple polish tokens |
| `app/providers.tsx` | Wrap with `ThemeProvider` |
| `app/dashboard/layout.tsx` | Theme switcher + Ko-fi link |
| `app/dashboard/page.tsx` | Card grid + 3 Recharts charts + date filter + last-scanned |

---

## Task 1: Schema — Add UDReport model and load speed fields

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add `UDScanStatus` enum and `UDReport` model to schema**

Open `prisma/schema.prisma`. After the final `enum Standard { ... }` block, add:

```prisma
enum UDScanStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}

model UDReport {
  id           String       @id @default(cuid())
  userId       String
  url          String
  overallScore Int          @default(0)
  data         Json?
  status       UDScanStatus @default(PENDING)
  createdAt    DateTime     @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("ud_reports")
}
```

- [ ] **Step 2: Add `udReports` relation to User model**

In the `model User { ... }` block, add this line after the existing `notificationSetting NotificationSetting?` line:

```prisma
  udReports            UDReport[]
```

- [ ] **Step 3: Add load speed fields to Scan model**

In `model Scan { ... }`, add these three optional fields after `duration Int?`:

```prisma
  ttfb        Int?       // time to first byte (ms)
  domReady    Int?       // DOMContentLoaded (ms)
  fullLoad    Int?       // full page load (ms)
```

- [ ] **Step 4: Push schema to database**

```bash
cd /Users/mac/Downloads/accessiscan
npx prisma db push
```

Expected output: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 5: Regenerate Prisma client**

```bash
npx prisma generate
```

Expected: `Generated Prisma Client ...`

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add UDReport model and load speed fields to schema"
```

---

## Task 2: Free Tier — Remove plan gates

**Files:**
- Modify: `app/api/scan/route.ts`

- [ ] **Step 1: Replace plan limits with unlimited values**

In `app/api/scan/route.ts`, find:

```ts
    const planLimits: Record<string, number> = {
      FREE: 1, PRO: 5, BUSINESS: 25, ENTERPRISE: 999,
    };
```

Replace with:

```ts
    const planLimits: Record<string, number> = {
      FREE: 999, PRO: 999, BUSINESS: 999, ENTERPRISE: 999,
    };
```

- [ ] **Step 2: Remove the upgrade-prompt 403 response**

Find and delete this block (the `if` that returns 403):

```ts
    if (!site) {
      if (siteCount >= (planLimits[plan] ?? 1)) {
        return NextResponse.json(
          { error: `Your ${plan} plan allows ${planLimits[plan]} site(s). Upgrade to scan more sites.` },
          { status: 403 }
        );
      }
      site = await db.site.create({
        data: { url, userId, name: new URL(url).hostname },
      });
    }
```

Replace with:

```ts
    if (!site) {
      site = await db.site.create({
        data: { url, userId, name: new URL(url).hostname },
      });
    }
```

- [ ] **Step 3: Commit**

```bash
git add app/api/scan/route.ts
git commit -m "feat: open free tier — remove all plan limits"
```

---

## Task 3: Theme System — CSS variables + ThemeProvider

**Files:**
- Modify: `app/globals.css`
- Modify: `app/providers.tsx`

- [ ] **Step 1: Add theme variable blocks to `app/globals.css`**

After the existing `:root { ... }` block, add:

```css
/* ─── Theme: High Contrast (WCAG AAA) ─── */
[data-theme="high-contrast"] {
  --color-surface: #000000;
  --color-surface-raised: #0a0a0a;
  --color-surface-overlay: #1a1a1a;
  --color-border: #ffffff;
  --color-text-primary: #ffffff;
  --color-text-secondary: #ffffff;
  --color-text-muted: #cccccc;
  --color-brand: #fbbf24;
  --color-brand-light: #fde68a;
}

/* ─── Theme: Light (Apple Notes aesthetic) ─── */
[data-theme="light"] {
  --color-surface: #f5f5f7;
  --color-surface-raised: #ffffff;
  --color-surface-overlay: #e8e8ed;
  --color-border: #d2d2d7;
  --color-text-primary: #1d1d1f;
  --color-text-secondary: #424245;
  --color-text-muted: #6e6e73;
  --color-brand: #6366F1;
  --color-brand-light: #818cf8;
}

/* ─── Theme: Reduced Motion ─── */
[data-theme="reduced"] * {
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
}

/* ─── Apple Polish (all themes) ─── */
body {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
}

h1, h2, h3, h4 {
  letter-spacing: -0.025em;
}
```

- [ ] **Step 2: Rewrite `app/providers.tsx` to add ThemeProvider**

Replace the entire file content with:

```tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "default" | "high-contrast" | "light" | "reduced";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "default",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("default");

  useEffect(() => {
    // Respect system preferences on first load
    const stored = localStorage.getItem("accessiscan-theme") as Theme | null;
    if (stored) {
      applyTheme(stored);
      setThemeState(stored);
      return;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const initial: Theme = prefersReduced ? "reduced" : prefersDark ? "default" : "light";
    applyTheme(initial);
    setThemeState(initial);
  }, []);

  function applyTheme(t: Theme) {
    if (t === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", t);
    }
  }

  function setTheme(t: Theme) {
    applyTheme(t);
    setThemeState(t);
    localStorage.setItem("accessiscan-theme", t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </SessionProvider>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/globals.css app/providers.tsx
git commit -m "feat: add 4-mode theme system with ThemeProvider and CSS variables"
```

---

## Task 4: Sidebar — Theme switcher + Ko-fi link

**Files:**
- Modify: `app/dashboard/layout.tsx`

- [ ] **Step 1: Import `useTheme` and add theme switcher + Ko-fi to sidebar**

At the top of `app/dashboard/layout.tsx`, add to existing imports:

```tsx
import { useTheme } from "@/app/providers";
```

Inside the component, after `const { data: session } = useSession();`, add:

```tsx
  const { theme, setTheme } = useTheme();
```

- [ ] **Step 2: Replace the `Collapse + Sign Out` section at the bottom of the sidebar nav**

Find the existing `{/* Collapse + Sign Out */}` div and replace the entire block with:

```tsx
        {/* Theme Switcher */}
        {!collapsed && (
          <div
            className="border-t px-3 pt-3 pb-1"
            style={{ borderColor: "var(--color-border)" }}
          >
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 px-1">
              Appearance
            </p>
            <div className="flex gap-1">
              {(
                [
                  { id: "default", label: "Dark", icon: "🌙" },
                  { id: "light", label: "Light", icon: "☀️" },
                  { id: "high-contrast", label: "High contrast", icon: "◑" },
                  { id: "reduced", label: "Reduced motion", icon: "—" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  aria-label={`Switch to ${t.label} theme`}
                  aria-pressed={theme === t.id}
                  title={t.label}
                  className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-sm transition-colors ${
                    theme === t.id
                      ? "bg-brand-600/30 text-brand-300"
                      : "text-slate-500 hover:text-slate-300 hover:bg-surface-overlay/50"
                  }`}
                >
                  <span aria-hidden="true">{t.icon}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Collapse + Sign Out + Ko-fi */}
        <div
          className="border-t p-3 space-y-1"
          style={{ borderColor: "var(--color-border)" }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-surface-overlay/50 w-full min-touch"
          >
            <ChevronLeft
              size={18}
              className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-900/20 w-full min-touch"
          >
            <LogOut size={18} />
            {!collapsed && <span>Sign out</span>}
          </button>
          {!collapsed && (
            <a
              href="https://ko-fi.com/bra11y"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] text-slate-500 hover:text-slate-300 hover:underline transition-colors w-full"
            >
              <span aria-hidden="true">☕</span>
              <span>Buy me a coffee</span>
            </a>
          )}
        </div>
```

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/layout.tsx
git commit -m "feat: add theme switcher and Ko-fi link to sidebar"
```

---

## Task 5: Load Speed — Capture performance.timing in main scanner

**Files:**
- Modify: `lib/scanner.ts`

- [ ] **Step 1: Find where `page.goto` is called in `crawlAndScan`**

Open `lib/scanner.ts`. Search for `page.goto`. You'll find a line like:

```ts
await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
```

- [ ] **Step 2: Add timing capture immediately after the first page's `page.goto` call**

The first URL visited is `baseUrl`. Add a flag so timing only runs once. Before the `while (toVisit.length > 0 && visited.size < MAX_PAGES)` loop, add:

```ts
  let loadMetrics: { ttfb: number; domReady: number; fullLoad: number } | null = null;
```

Then, immediately after `await page.goto(url, ...)` inside the loop, add:

```ts
      // Capture load speed on first page only
      if (!loadMetrics) {
        loadMetrics = await page.evaluate(() => {
          const t = performance.timing;
          return {
            ttfb: t.responseStart - t.navigationStart,
            domReady: t.domContentLoadedEventEnd - t.navigationStart,
            fullLoad: t.loadEventEnd - t.navigationStart,
          };
        }).catch(() => null);
      }
```

- [ ] **Step 3: Return `loadMetrics` from `crawlAndScan`**

Update the `ScanResult` interface at the top of the file — add `loadMetrics`:

```ts
interface ScanResult {
  scanId: string;
  score: number;
  wcagScore: number;
  adaScore: number;
  ariaScore: number;
  totalIssues: number;
  loadMetrics?: { ttfb: number; domReady: number; fullLoad: number } | null;
  pages: PageResult[];
}
```

At the end of `crawlAndScan`, include `loadMetrics` in the return value alongside `results`.

- [ ] **Step 4: Save load metrics to the Scan record**

In `lib/scanner.ts`, find where `db.scan.update` is called to set `status: "COMPLETED"`. Add the three new fields:

```ts
await db.scan.update({
  where: { id: scanId },
  data: {
    status: "COMPLETED",
    score: finalScore.overall,
    wcagScore: finalScore.wcag,
    adaScore: finalScore.ada,
    ariaScore: finalScore.aria,
    pagesCount: results.pages.length,
    issueCount: totalIssues,
    completedAt: new Date(),
    ttfb: results.loadMetrics?.ttfb ?? null,
    domReady: results.loadMetrics?.domReady ?? null,
    fullLoad: results.loadMetrics?.fullLoad ?? null,
  },
});
```

- [ ] **Step 5: Commit**

```bash
git add lib/scanner.ts
git commit -m "feat: capture performance.timing load speed metrics in scanner"
```

---

## Task 6: Load Speed — Display Performance card on scan results page

**Files:**
- Modify: `app/dashboard/scan/page.tsx`

- [ ] **Step 1: Add a helper to color-code load speed values**

Inside `app/dashboard/scan/page.tsx`, before the main component, add:

```tsx
function speedColor(ms: number, thresholds: [number, number]): string {
  if (ms < thresholds[0]) return "#4ade80"; // green
  if (ms < thresholds[1]) return "#fbbf24"; // amber
  return "#f87171"; // red
}
```

- [ ] **Step 2: Add Performance card to the results section**

Find where the WCAG/ADA/ARIA score cards are rendered (the section with `wcagScore`, `adaScore`, `ariaScore`). After those cards, add:

```tsx
{/* Performance Card */}
{(result?.ttfb != null || result?.domReady != null || result?.fullLoad != null) && (
  <div
    className="bg-surface-raised border rounded-2xl p-5 backdrop-blur-sm"
    style={{ borderColor: "var(--color-border)" }}
  >
    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
      Load Speed
    </p>
    <div className="space-y-2">
      {[
        { label: "Time to First Byte", value: result.ttfb, thresholds: [200, 600] as [number, number] },
        { label: "DOM Ready", value: result.domReady, thresholds: [1500, 3000] as [number, number] },
        { label: "Full Load", value: result.fullLoad, thresholds: [3000, 6000] as [number, number] },
      ].map(({ label, value, thresholds }) =>
        value != null ? (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-slate-400">{label}</span>
            <span
              className="text-xs font-mono font-bold px-2 py-0.5 rounded"
              style={{
                color: speedColor(value, thresholds),
                background: speedColor(value, thresholds) + "22",
              }}
            >
              {value}ms
            </span>
          </div>
        ) : null
      )}
    </div>
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/scan/page.tsx
git commit -m "feat: display load speed performance card in scan results"
```

---

## Task 7: UD Scanner — Add DB lifecycle updates to lib/ud-scanner.ts

**Files:**
- Modify: `lib/ud-scanner.ts`

- [ ] **Step 1: Add db import and update `runUDScan` signature**

At the top of `lib/ud-scanner.ts`, add:

```ts
import { db } from "@/lib/db";
```

Change the function signature from:

```ts
export async function runUDScan(url: string): Promise<UDReport>
```

To:

```ts
export async function runUDScan(url: string, reportId?: string): Promise<UDReport>
```

- [ ] **Step 2: Mark report as RUNNING at the start of the function**

After `const page = await browser.newPage();`, add:

```ts
  if (reportId) {
    await db.uDReport.update({
      where: { id: reportId },
      data: { status: "RUNNING" },
    });
  }
```

- [ ] **Step 3: Mark report as COMPLETED with data at the end**

The function returns a `UDReport` object. Before the final `return { url, scannedAt, ... }`, add:

```ts
  const report: UDReport = {
    url,
    scannedAt: new Date().toISOString(),
    overallScore,
    principleResults,
    summary: {
      critical: totalCritical,
      serious: totalSerious,
      moderate: totalModerate,
      minor: totalMinor,
      totalIssues: totalCritical + totalSerious + totalModerate + totalMinor,
    },
  };

  if (reportId) {
    await db.uDReport.update({
      where: { id: reportId },
      data: {
        status: "COMPLETED",
        overallScore,
        data: report as any,
      },
    });
  }

  return report;
```

Remove the old `return { url, scannedAt: ... }` that was there.

- [ ] **Step 4: Wrap the whole function body in try/catch to handle FAILED status**

Wrap the existing function body in:

```ts
  try {
    // ... existing code ...
  } catch (err) {
    if (reportId) {
      await db.uDReport.update({
        where: { id: reportId },
        data: { status: "FAILED" },
      }).catch(() => {});
    }
    throw err;
  }
```

- [ ] **Step 5: Commit**

```bash
git add lib/ud-scanner.ts
git commit -m "feat: add DB lifecycle updates to UD scanner (RUNNING/COMPLETED/FAILED)"
```

---

## Task 8: UD Scan API — Refactor to async pattern

**Files:**
- Modify: `app/api/ud-scan/route.ts`

- [ ] **Step 1: Replace the entire route file**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runUDScan } from "@/lib/ud-scanner";
import { db } from "@/lib/db";

// POST /api/ud-scan — Create a pending report and start background scan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Create a pending report record
    const report = await db.uDReport.create({
      data: {
        userId,
        url: parsedUrl.toString(),
        status: "PENDING",
      },
    });

    // Fire and forget — do NOT await
    runUDScan(parsedUrl.toString(), report.id).catch((err) => {
      console.error("UD scan failed:", err);
    });

    return NextResponse.json({ reportId: report.id, status: "PENDING" }, { status: 200 });
  } catch (error: any) {
    console.error("UD scan POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to start scan" }, { status: 500 });
  }
}

// GET /api/ud-scan?reportId=xxx — Poll for status and results
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const reportId = request.nextUrl.searchParams.get("reportId");
    if (!reportId) {
      return NextResponse.json({ error: "reportId param required" }, { status: 400 });
    }

    const report = await db.uDReport.findUnique({ where: { id: reportId } });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({
      reportId: report.id,
      status: report.status,
      overallScore: report.overallScore,
      report: report.status === "COMPLETED" ? report.data : null,
    });
  } catch (error: any) {
    console.error("UD scan GET error:", error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/ud-scan/route.ts
git commit -m "feat: refactor UD scan API to async fire-and-forget pattern"
```

---

## Task 9: Hook — Add useUDScanProgress to hooks/use-api.ts

**Files:**
- Modify: `hooks/use-api.ts`

- [ ] **Step 1: Add the polling hook at the end of the file, before `export { useFetch }`**

```ts
// ─── UD Scan Progress Polling ───

export function useUDScanProgress(reportId: string | null) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("PENDING");
  const [report, setReport] = useState<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!reportId) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/ud-scan?reportId=${reportId}`);
        const data = await res.json();

        if (data.status === "COMPLETED") {
          setProgress(100);
          setStatus("COMPLETED");
          setReport(data.report);
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else if (data.status === "FAILED") {
          setStatus("FAILED");
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else if (data.status === "RUNNING") {
          setProgress(50);
          setStatus("RUNNING");
        } else {
          setProgress(10);
          setStatus("PENDING");
        }
      } catch (e) {
        console.error("UD poll error:", e);
      }
    };

    // Poll immediately then every 2s
    poll();
    intervalRef.current = setInterval(poll, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reportId]);

  return { progress, status, report };
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/use-api.ts
git commit -m "feat: add useUDScanProgress polling hook"
```

---

## Task 10: UD Page — Polling pattern + Tailwind rewrite + overflow fix

**Files:**
- Modify: `app/dashboard/universal-design/page.tsx`

- [ ] **Step 1: Replace the top of the file — update imports and state**

Replace the existing import block and state declarations at the top with:

```tsx
"use client";

import { useState, useCallback } from "react";
import { useUDScanProgress } from "@/hooks/use-api";
import type { UDReport, UDPrincipleResult, UDCheckResult, Severity, CheckStatus } from "@/types/ud";
import { UD_PRINCIPLES } from "@/lib/ud-principles";
```

In the main component, replace `const [scanning, setScanning] = useState(false)` and `const [report, setReport] = useState<UDReport | null>(null)` with:

```tsx
  const [url, setUrl] = useState("");
  const [reportId, setReportId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { progress, status, report } = useUDScanProgress(reportId);
  const scanning = status === "PENDING" || status === "RUNNING";
```

- [ ] **Step 2: Update the scan submission handler**

Replace the existing `handleScan` / fetch logic with:

```tsx
  const handleScan = useCallback(async () => {
    if (!url.trim()) return;
    setError(null);
    setReportId(null);

    try {
      const res = await fetch("/api/ud-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start scan");
      setReportId(data.reportId);
    } catch (e: any) {
      setError(e.message);
    }
  }, [url]);
```

- [ ] **Step 3: Fix the results container overflow**

Find the outermost results `<div>` that wraps the principle cards. Change it from:

```tsx
<div style={{ ... }}>
```

To:

```tsx
<div className="overflow-y-auto max-h-[calc(100vh-200px)] space-y-4 pr-1">
```

- [ ] **Step 4: Add progress bar while scanning**

After the URL input form and before the results section, add:

```tsx
{scanning && (
  <div
    className="bg-surface-raised border rounded-2xl p-8 text-center"
    style={{ borderColor: "var(--color-border)" }}
    role="status"
    aria-live="polite"
    aria-label={`UD scan in progress, ${progress}% complete`}
  >
    <p className="text-sm text-slate-300 mb-4">
      {status === "PENDING" ? "Starting Universal Design audit…" : "Scanning for UD compliance…"}
    </p>
    <div className="w-full bg-surface-overlay rounded-full h-2 overflow-hidden">
      <div
        className="h-2 rounded-full bg-brand-500 transition-all duration-500"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  </div>
)}

{error && (
  <div
    className="bg-red-950/50 border border-red-800 rounded-2xl p-4 text-sm text-red-300"
    role="alert"
  >
    {error}
  </div>
)}
```

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/universal-design/page.tsx
git commit -m "feat: fix UD page — polling pattern, overflow fix, progress bar"
```

---

## Task 11: Dashboard — Install Recharts

**Files:**
- `package.json` (via npm)

- [ ] **Step 1: Install recharts**

```bash
cd /Users/mac/Downloads/accessiscan
npm install recharts
```

Expected: `added N packages`

- [ ] **Step 2: Commit lockfile**

```bash
git add package.json package-lock.json
git commit -m "chore: install recharts for dashboard data visualizations"
```

---

## Task 12: Dashboard — Card grid + date filter + last-scanned

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Replace the entire dashboard page with the new implementation**

```tsx
"use client";

import { useScans } from "@/hooks/use-api";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from "recharts";

// ─── Helpers ───────────────────────────────────────────────────────────────

function speedColor(ms: number, lo: number, hi: number) {
  if (ms < lo) return "#4ade80";
  if (ms < hi) return "#fbbf24";
  return "#f87171";
}

function scoreColor(n: number) {
  if (n >= 80) return "#4ade80";
  if (n >= 50) return "#fbbf24";
  return "#f87171";
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#f87171",
  SERIOUS: "#fb923c",
  MODERATE: "#fbbf24",
  MINOR: "#60a5fa",
};

// ─── Stat card ──────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, color, href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  href?: string;
}) {
  const inner = (
    <div
      className="bg-surface-raised border rounded-2xl p-5 backdrop-blur-sm transition-all duration-200 hover:bg-surface-overlay/30 h-full"
      style={{ borderColor: "var(--color-border)" }}
    >
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p
        className="font-mono text-3xl font-extrabold mb-1 tracking-tight"
        style={{ color: color ?? "var(--color-text-primary)" }}
      >
        {value}
      </p>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full focus-visible:ring-2 focus-visible:ring-brand-400 rounded-2xl">
      {inner}
    </Link>
  ) : (
    inner
  );
}

// ─── Date preset helpers ────────────────────────────────────────────────────

function getPresetRange(preset: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split("T")[0];
  if (preset === "7d") {
    const from = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];
    return { from, to };
  }
  if (preset === "30d") {
    const from = new Date(now.getTime() - 30 * 86400000).toISOString().split("T")[0];
    return { from, to };
  }
  return { from: "", to: "" };
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, loading } = useScans();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activePreset, setActivePreset] = useState<string>("all");

  function applyPreset(preset: string) {
    setActivePreset(preset);
    if (preset === "all") {
      setFromDate("");
      setToDate("");
    } else {
      const { from, to } = getPresetRange(preset);
      setFromDate(from);
      setToDate(to);
    }
  }

  const allScans = data?.scans ?? [];

  // Filter by date range
  const filteredScans = useMemo(() => {
    return allScans.filter((s: any) => {
      const d = new Date(s.createdAt);
      if (fromDate && d < new Date(fromDate)) return false;
      if (toDate && d > new Date(toDate + "T23:59:59")) return false;
      return true;
    });
  }, [allScans, fromDate, toDate]);

  // Most recent completed scan
  const latestScan = allScans.find((s: any) => s.status === "COMPLETED");

  // Stats from latest scan
  const overallScore = latestScan?.score ?? null;
  const wcagScore = latestScan?.wcagScore ?? null;
  const adaScore = latestScan?.adaScore ?? null;
  const ariaScore = latestScan?.ariaScore ?? null;

  // Group scans by site for the list
  const bySite = useMemo(() => {
    const map = new Map<string, any>();
    for (const s of filteredScans) {
      const key = s.site?.url ?? s.siteId;
      if (!map.has(key) || new Date(s.createdAt) > new Date(map.get(key).createdAt)) {
        map.set(key, s);
      }
    }
    return Array.from(map.values());
  }, [filteredScans]);

  // Score trend data for line chart
  const trendData = useMemo(() => {
    return [...allScans]
      .filter((s: any) => s.status === "COMPLETED" && s.score != null)
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-10)
      .map((s: any) => ({
        date: new Date(s.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" }),
        Overall: s.score,
        WCAG: s.wcagScore,
        ADA: s.adaScore,
      }));
  }, [allScans]);

  // Issue breakdown for donut chart
  const issueBreakdown = useMemo(() => {
    if (!latestScan) return [];
    const counts: Record<string, number> = { CRITICAL: 0, SERIOUS: 0, MODERATE: 0, MINOR: 0 };
    // Use _count from the scan list response
    // We approximate from issueCount until a detailed scan fetch
    // If latestScan has issues array, count by severity
    if (latestScan.issues) {
      for (const issue of latestScan.issues) {
        counts[issue.severity] = (counts[issue.severity] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [latestScan]);

  // Per-standard bar chart
  const standardData = latestScan
    ? [
        { standard: "WCAG", score: latestScan.wcagScore ?? 0 },
        { standard: "ADA", score: latestScan.adaScore ?? 0 },
        { standard: "ARIA", score: latestScan.ariaScore ?? 0 },
      ]
    : [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-50 tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Automated + Human-Powered Accessibility Auditing
        </p>
      </div>

      {/* Stats Card Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Overall Score"
          value={overallScore ?? "—"}
          sub={overallScore == null ? "Run your first scan" : "Latest scan"}
          color={overallScore != null ? scoreColor(overallScore) : "#D97706"}
        />
        <StatCard
          label="WCAG Score"
          value={wcagScore ?? "—"}
          sub="WCAG 2.1 AA"
          color={wcagScore != null ? scoreColor(wcagScore) : "#64748b"}
        />
        <StatCard
          label="ADA Score"
          value={adaScore ?? "—"}
          sub="ADA Title III"
          color={adaScore != null ? scoreColor(adaScore) : "#64748b"}
        />
        <StatCard
          label="ARIA Score"
          value={ariaScore ?? "—"}
          sub="ARIA best practices"
          color={ariaScore != null ? scoreColor(ariaScore) : "#64748b"}
        />
        <StatCard
          label="Critical Issues"
          value={latestScan?.issueCount ?? 0}
          sub="Latest scan"
          color="#f87171"
          href="/dashboard/issues?severity=CRITICAL"
        />
        <StatCard
          label="Pages Scanned"
          value={allScans.reduce((a: number, s: any) => a + (s.pagesCount ?? 0), 0)}
          sub="All time"
          color="#818cf8"
        />
        <StatCard
          label="Human Reviews"
          value="—"
          sub="Pending review"
          color="#6366F1"
          href="/dashboard/reviews"
        />
        <StatCard
          label="Total Scans"
          value={allScans.length}
          sub="All time"
          color="#94a3b8"
        />
      </div>

      {/* Charts Row */}
      {allScans.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Score Trend — full width on small, 2/3 on large */}
          {trendData.length >= 2 && (
            <div
              className="lg:col-span-2 bg-surface-raised border rounded-2xl p-5 backdrop-blur-sm"
              style={{ borderColor: "var(--color-border)" }}
            >
              <h2 className="text-sm font-semibold text-slate-300 mb-4 tracking-tight">
                Score Trend
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: 8,
                      color: "#f8fafc",
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="Overall" stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="WCAG" stroke="#4ade80" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="ADA" stroke="#fbbf24" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Issue Breakdown Donut */}
          {issueBreakdown.length > 0 && (
            <div
              className="bg-surface-raised border rounded-2xl p-5 backdrop-blur-sm"
              style={{ borderColor: "var(--color-border)" }}
            >
              <h2 className="text-sm font-semibold text-slate-300 mb-4 tracking-tight">
                Issue Breakdown
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={issueBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {issueBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: "#94a3b8", fontSize: 11 }}>{value}</span>
                    )}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Per-Standard Bar Chart */}
          {standardData.length > 0 && (
            <div
              className="lg:col-span-3 bg-surface-raised border rounded-2xl p-5 backdrop-blur-sm"
              style={{ borderColor: "var(--color-border)" }}
            >
              <h2 className="text-sm font-semibold text-slate-300 mb-4 tracking-tight">
                Standards Breakdown
              </h2>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={standardData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis dataKey="standard" type="category" tick={{ fill: "#94a3b8", fontSize: 12 }} width={60} />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {standardData.map((entry) => (
                      <Cell key={entry.standard} fill={scoreColor(entry.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {allScans.length === 0 && !loading && (
        <div
          className="bg-surface-raised border border-dashed rounded-2xl p-12 text-center mb-8"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-900/40 mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-slate-100 mb-2 tracking-tight">
            Run your first accessibility scan
          </h2>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            Enter any URL to check it against WCAG 2.1 AA, ADA, and ARIA standards.
          </p>
          <Link
            href="/dashboard/scan"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-sm hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all min-touch"
          >
            Start Scanning
          </Link>
        </div>
      )}

      {/* Date Range Filter + Recent Scans */}
      {allScans.length > 0 && (
        <section
          className="bg-surface-raised border rounded-2xl"
          style={{ borderColor: "var(--color-border)" }}
        >
          {/* Filter bar */}
          <div
            className="px-6 py-4 border-b flex flex-wrap items-center gap-3"
            style={{ borderColor: "var(--color-border)" }}
          >
            <h2 className="text-sm font-semibold text-slate-300 mr-2 tracking-tight">
              Recent Scans
            </h2>
            <div className="flex gap-1.5">
              {[
                { label: "Last 7 days", id: "7d" },
                { label: "Last 30 days", id: "30d" },
                { label: "All time", id: "all" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  aria-pressed={activePreset === p.id}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    activePreset === p.id
                      ? "bg-brand-600/30 text-brand-300 border border-brand-600/50"
                      : "text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <label htmlFor="filter-from" className="sr-only">From date</label>
              <input
                id="filter-from"
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setActivePreset(""); }}
                className="bg-surface-overlay border rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                style={{ borderColor: "var(--color-border)" }}
                aria-label="Filter from date"
              />
              <span className="text-xs text-slate-500">to</span>
              <label htmlFor="filter-to" className="sr-only">To date</label>
              <input
                id="filter-to"
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setActivePreset(""); }}
                className="bg-surface-overlay border rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                style={{ borderColor: "var(--color-border)" }}
                aria-label="Filter to date"
              />
            </div>
          </div>

          {/* Scan list grouped by site */}
          <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
            {bySite.length === 0 ? (
              <p className="px-6 py-8 text-sm text-slate-500 text-center">
                No scans found for this date range.
              </p>
            ) : (
              bySite.map((scan: any) => (
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
                      Last scanned{" "}
                      {formatDistanceToNow(new Date(scan.createdAt), { addSuffix: true })}
                      {" · "}
                      {scan._count?.issues ?? 0} issues
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className="font-mono text-lg font-bold"
                      style={{ color: scan.score != null ? scoreColor(scan.score) : "#64748b" }}
                    >
                      {scan.score ?? "—"}
                    </span>
                    <p className="text-[10px] text-slate-500 uppercase">Score</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: rebuild dashboard with Recharts charts, card grid, date filter, last-scanned"
```

---

## Self-Review Notes

- All 11 files in the spec's File Touch List are covered.
- `UDReport` relation in Task 1 matches `lib/ud-scanner.ts` usage of `db.uDReport` in Task 7.
- `runUDScan(url, reportId?)` signature in Task 7 matches the call in Task 8's API route.
- `useUDScanProgress` in Task 9 matches the import in Task 10's UD page.
- `speedColor` helper in Task 12 dashboard matches the one defined in Task 6 scan page — they are separate functions in separate files (no shared import needed).
- Recharts must be installed (Task 11) before Task 12 runs.
- Task order is sequential — no task depends on a later task.
