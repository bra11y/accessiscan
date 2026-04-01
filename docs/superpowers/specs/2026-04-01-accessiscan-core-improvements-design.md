# AccessiScan Core Improvements — Design Spec
**Date:** 2026-04-01
**Status:** Approved

---

## Overview

Four workstreams to fix broken functionality, open the free tier, add dashboard utility features, and apply light Apple-inspired polish with a built-in theme/contrast system.

Scheduled scans and full UI redesign are explicitly out of scope.

---

## Section 1 — Scanner Fixes

### 1a. UD Scanner (Universal Design)

**Problem:** `runUDScan()` runs synchronously inside the API handler. On Vercel this hits the 60s serverless timeout and returns nothing. DB save is commented out so results are never persisted.

**Fix:**
- Add `UDReport` model to `prisma/schema.prisma`:
  ```
  model UDReport {
    id           String       @id @default(cuid())
    userId       String
    url          String
    overallScore Int          @default(0)
    data         Json?
    status       UDScanStatus @default(PENDING)
    createdAt    DateTime     @default(now())
    user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
    @@map("ud_reports")
  }
  enum UDScanStatus { PENDING RUNNING COMPLETED FAILED }
  // Also add `udReports UDReport[]` to the User model
  ```
- `POST /api/ud-scan` — validates URL, creates a `UDReport` record with `status: PENDING`, fires `runUDScan()` as a background async (fire-and-forget), returns `{ reportId, status: "PENDING" }`
- `GET /api/ud-scan?reportId=xxx` — returns current status + full data when COMPLETED
- `runUDScan()` in `lib/ud-scanner.ts` — updates the DB record through RUNNING → COMPLETED/FAILED
- UD page polls `GET /api/ud-scan?reportId=xxx` every 2s (matching main scan pattern)

**UI fix:**
- Replace all inline styles in `app/dashboard/universal-design/page.tsx` with Tailwind classes
- Add `overflow-y-auto` and proper `max-h` to the results container so content doesn't cut off
- Consistent card structure matching the rest of the dashboard

### 1b. Load Speed Metrics (Main Scanner)

**Problem:** `lib/scanner.ts` uses Puppeteer but never captures performance timing.

**Fix:**
- After each `page.goto()` call, capture via `page.evaluate()`:
  ```js
  const { ttfb, domReady, fullLoad } = await page.evaluate(() => {
    const t = performance.timing;
    return {
      ttfb: t.responseStart - t.navigationStart,
      domReady: t.domContentLoadedEventEnd - t.navigationStart,
      fullLoad: t.loadEventEnd - t.navigationStart,
    };
  });
  ```
- Store on the first page's metrics (homepage load, not averaged across all pages)
- Add 3 new optional fields to `Scan` model: `ttfb Int?`, `domReady Int?`, `fullLoad Int?`
- Display as a "Performance" card on the scan results page with color coding:
  - TTFB: green <200ms, amber <600ms, red ≥600ms
  - DOM Ready: green <1500ms, amber <3000ms, red ≥3000ms
  - Full Load: green <3000ms, amber <6000ms, red ≥6000ms

---

## Section 2 — Business Model

### 2a. Free Tier (Remove All Gates)

- In `app/api/scan/route.ts`, change `planLimits` to:
  ```ts
  const planLimits = { FREE: 999, PRO: 999, BUSINESS: 999, ENTERPRISE: 999 };
  ```
- Remove the 403 upgrade prompt error response for site limit exceeded
- Keep `Plan` enum, Stripe routes, and pricing page intact — infrastructure stays for when payment is re-enabled

### 2b. Buy Me a Coffee — Ko-fi Link

- Add to the sidebar footer (`app/dashboard/layout.tsx`), below the Sign Out button:
  ```tsx
  <a href="https://ko-fi.com/bra11y" target="_blank" rel="noopener noreferrer">
    ☕ Buy me a coffee
  </a>
  ```
- Style: 11px, muted slate color, subtle hover underline — does not compete with nav items

---

## Section 3 — Dashboard Features & Data Visualization

**Chart library:** Recharts (`recharts`) — lightweight, composable, fully styleable to match Apple aesthetic.
Install: `npm install recharts`

### 3a. Dashboard Card Grid

Replace the current 4-stat hardcoded row with a rich card grid:

| Card | Content |
|------|---------|
| **Overall Score** | Large number + color ring, delta vs last scan (↑ +4) |
| **WCAG Score** | Score + mini sparkline of last 5 scans |
| **ADA Score** | Score + mini sparkline |
| **ARIA Score** | Score + mini sparkline |
| **Load Speed** | TTFB / DOM Ready / Full Load — color-coded pills |
| **Critical Issues** | Count + red badge, link to issues filtered by CRITICAL |
| **Pages Scanned** | Count across all scans |
| **Human Reviews** | Pending count + link to review queue |

Cards use `backdrop-blur-sm bg-white/5 rounded-2xl` (Apple frosted glass), Recharts `Sparkline` for mini trend lines.

### 3b. Score Trend Chart

- Full-width `LineChart` (Recharts) below the card grid
- X-axis: scan date, Y-axis: 0–100
- Three lines: Overall (indigo), WCAG (green), ADA (amber)
- Tooltip shows exact scores + date on hover
- Only renders when user has ≥2 scans

### 3c. Issue Breakdown Chart

- `PieChart` (donut variant) — Critical / Serious / Moderate / Minor
- Colors: red / amber / yellow / blue matching existing severity palette
- Legend below with counts
- Renders from most recent completed scan

### 3d. Per-Standard Bar Chart

- `BarChart` — WCAG / ADA / SECTION508 / ARIA scores side by side
- Horizontal bars, color-coded by score (green/amber/red)
- Renders from most recent completed scan

### 3e. Last Scanned Date on Site Cards

- Scans grouped by site in the Recent Scans list
- Under each site name: `"Last scanned {relative time}"` using `date-fns/formatDistanceToNow`
- `date-fns` already in `package.json` — no new dependency

### 3f. Date Range Filter

- Filter bar above Recent Scans list
- "From" / "To" date inputs + pill presets: "Last 7 days", "Last 30 days", "All time"
- Client-side filtering — no API changes needed

---

## Section 4 — Theme & Contrast System

### Four Modes

| Mode | Description |
|------|-------------|
| `default` | Current dark theme (unchanged baseline) |
| `high-contrast` | Pure black bg, white text, yellow accents — targets WCAG AAA |
| `light` | White/gray surfaces, dark text, Apple Notes aesthetic |
| `reduced` | All animations/gradients/shadows removed — for motion sensitivity |

### Implementation

- `data-theme` attribute set on `<html>` drives CSS custom property overrides in `app/globals.css`
- Four CSS blocks: `[data-theme="high-contrast"] { ... }`, `[data-theme="light"] { ... }`, etc.
- Theme switcher: 4 small icon buttons in the sidebar footer (above Ko-fi link)
  - Icons: moon (default), sun (light), circle-half (high contrast), minus (reduced)
- User preference persisted in `localStorage` key `"accessiscan-theme"`
- `ThemeProvider` client component in `app/providers.tsx` reads localStorage on mount, applies `data-theme`, exposes `useTheme()` hook
- On first load: respects `prefers-color-scheme` (light → light mode) and `prefers-reduced-motion` (true → reduced mode)

### Apple-Inspired Polish (Applied Across All Themes)

Applied as we touch each file — not a separate pass:
- Font stack: `-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`
- Cards: `backdrop-blur-sm` + `bg-white/5` frosted glass effect on dark theme
- Corners: `rounded-2xl` consistently (replace `rounded-xl` where adjacent)
- Headings: `tracking-tight` letter-spacing
- Transitions: `transition-all duration-200` on interactive elements

---

## File Touch List

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `UDReport` model + `UDScanStatus` enum; add `ttfb`, `domReady`, `fullLoad` to `Scan` |
| `lib/ud-scanner.ts` | Add DB update calls through scan lifecycle |
| `app/api/ud-scan/route.ts` | Refactor to async pattern (POST creates record, GET polls) |
| `app/api/scan/route.ts` | Set plan limits to 999 |
| `lib/scanner.ts` | Add `performance.timing` capture after page load |
| `app/dashboard/universal-design/page.tsx` | Polling pattern, Tailwind refactor, overflow fix |
| `app/dashboard/page.tsx` | Card grid, Recharts charts, site grouping, last scanned date, date range filter |
| `app/dashboard/layout.tsx` | Theme switcher + Ko-fi link in sidebar footer |
| `app/providers.tsx` | Add `ThemeProvider` |
| `app/globals.css` | Add 4 `data-theme` CSS blocks + Apple polish tokens |
| `hooks/use-api.ts` | Add `useUDScanProgress(reportId)` hook |

---

## Out of Scope

- Scheduled/automated scans
- Full UI redesign
- Stripe payment changes
- New authentication flows
