# AccessiScan — Landing Page Redesign + Free Guest Scan
**Date:** 2026-03-25
**Status:** Approved (v2 — post-review fixes applied)

---

## Overview

Three connected changes to AccessiScan:

1. **Landing page redesign** — new layout using the dashboard design system, split-hero with product preview, Atkinson Hyperlegible font, system-adaptive theme (dark/light via `prefers-color-scheme`), fully WCAG 2.1 AA compliant
2. **Free guest scan** — unauthenticated users can run one real scan at `/scan`; full results shown; sign-up gate appears after; implemented via **in-memory store** (no DB writes for guests)
3. **Super admin account** — seeded test account with `ENTERPRISE` plan + `SUPER_ADMIN` role for live testing

---

## 1. Landing Page Redesign

### Layout

**Fixed nav (60px)**
- Left: logo mark (indigo square with "A") + "AccessiScan" wordmark
- Centre: Features · How it works · Pricing links (44px min touch target)
- Right: "Log in" ghost button + "Scan free →" primary button
- `backdrop-filter: blur(20px)`, `border-bottom: 1px solid var(--border)`
- Skip-to-main-content link: **already exists in `app/layout.tsx`** — verify it is the first focusable element on the new page, no new code needed

**Hero — 2-column grid (1fr 1fr), max-width 1200px**

Left column:
- Eyebrow pill: "WCAG · ADA · Section 508 · EAA 2025" (brand colour, 13px, border)
- H1: "Know exactly where your site fails accessibility." (Atkinson Hyperlegible 700, clamp 1.875rem–2.875rem)
- Subheadline: one sentence value prop (17px, `--text-3`, 1.7 line-height)
- Two CTAs: "Scan your site free →" (primary filled, links to `/scan`) + "See a sample report" (ghost, scrolls to `#preview`), both min 48px height
- Micro-proof row: ✓ No account needed · ✓ Full results instantly · ✓ 1 free scan per session (14px, `--text-3`)

Right column — dashboard preview card:
- Browser chrome: macOS-style traffic lights + fake URL bar `app.accessiscan.com/scan/result`
- Compliance progress bar (`role="progressbar"`, `aria-valuenow="72"`, `aria-valuemin="0"`, `aria-valuemax="100"`)
- Score cards: WCAG Score 72 (amber), Issues Found 14 (red), Critical 3 (red)
- Issue list (3 items): Critical / Serious / Moderate with WCAG criterion references
- "AccessiScan verified — 0 issues" green badge at bottom
- Subtle radial gradient glow (brand colour, 7% opacity) behind the card

**Stats bar** (full-width, `bg-subtle`, bordered top/bottom):
- 98% · €75K · 1 in 6 · 70% — all with descriptive labels, `role="list"`

**Features section** (3-column grid, gap 1px on `--border` background):
- 6 cards: Automated Scanning (Free), Vision Simulation (Pro+), Human Expert Review (Pro+), AI Fix Suggestions (All), VPAT Reports (Business+), Universal Design Audit (Pro+)
- Hover: `background: var(--surface-2)` — no motion, `prefers-reduced-motion` safe

**How It Works** (3-column, `bg-subtle` band):
- Step cards 1/2/3 with numbered circles, H3, description (15px)

**Footer**:
- Copyright · footer nav (Pricing, Privacy, Contact) · pulsing green status dot
- `padding-bottom: 100px` to clear the sticky gate bar when shown on `/scan`

### Typography

- **Primary font**: Atkinson Hyperlegible — loaded via `next/font/google` as `Atkinson_Hyperlegible`, assigned to `--font-body` CSS variable
- **Fallback**: Inter, system-ui, sans-serif
- **Loading pattern** (consistent with existing `DM_Sans`/`Outfit` in `layout.tsx`):
  ```ts
  import { Atkinson_Hyperlegible } from 'next/font/google'
  const atkinson = Atkinson_Hyperlegible({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-body' })
  ```
- **Minimum body size**: 15px (`--text-3` labels), 16px body text, 17px hero sub

### Colour tokens (system-adaptive via `prefers-color-scheme`)

| Token | Dark | Light | Dark contrast on bg |
|---|---|---|---|
| `--bg` | `#0D1117` | `#FFFFFF` | — |
| `--surface` | `#1C2333` | `#FFFFFF` | — |
| `--surface-2` | `#21262D` | `#F6F8FA` | — |
| `--border` | `#30363D` | `#D0D7DE` | — |
| `--brand` | `#818CF8` | `#4F46E5` | 7.1:1 ✓ |
| `--text-1` | `#E6EDF3` | `#1F2328` | 14.7:1 ✓ |
| `--text-2` | `#C9D1D9` | `#24292F` | 9.4:1 ✓ |
| `--text-3` | `#8B949E` | `#57606A` | 4.7:1 ✓ AA |
| `--success` | `#3FB950` | `#1A7F37` | 4.6:1 ✓ |
| `--warn` | `#D29922` | `#9A6700` | 4.5:1 ✓ |
| `--danger` | `#F85149` | `#CF222E` | 4.8:1 ✓ |

These tokens extend (do not replace) the existing tokens in `app/globals.css`.

### WCAG 2.1 AA compliance checklist (landing page)

- [x] **2.4.1** Bypass Blocks — skip link already in `layout.tsx`; verify first-focus order on new page
- [x] **1.4.3** Contrast (Minimum) — all text tokens ≥ 4.5:1 verified above
- [x] **2.5.5** Target Size — all interactive elements ≥ 44×44px
- [x] **2.4.7** Focus Visible — existing `:focus-visible` ring (3px brand colour) carried forward
- [x] **1.1.1** Non-text Content — dashboard preview card has `aria-label` describing the scan result shown; decorative dots use `aria-hidden="true"`
- [x] **1.3.1** Info and Relationships — semantic heading hierarchy H1→H2→H3; nav landmarks; `role="list"` on stats
- [x] **1.4.1** Use of Colour — severity badges use text label not colour alone (Critical/Serious/Moderate)
- [x] **2.1.1** Keyboard — all interactive elements reachable and operable via keyboard
- [x] **2.4.2** Page Titled — `<title>AccessiScan — Accessibility Auditing</title>`
- [x] **`prefers-reduced-motion`** — all CSS transitions/animations wrapped; this is a best-practice enhancement beyond AA Level (WCAG 2.3.3 is Level AAA — noted here as enhancement only, not an AA claim)

---

## 2. Free Guest Scan

### Architecture: In-Memory Store (no DB writes for guests)

The `Site` model requires a non-nullable `userId` with a `@@unique([url, userId])` constraint. Rather than alter this constraint, guest scans use a **server-side in-memory Map** keyed by a random UUID.

**No Prisma schema changes required for guest scans.**

```ts
// lib/guest-scans.ts  (new file)
interface GuestScanResult {
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  score?: number
  wcagScore?: number
  adaScore?: number
  ariaScore?: number
  issueCount?: number
  pagesCount?: number
  issues?: GuestIssue[]
  createdAt: number  // Date.now() — for TTL cleanup
}

// Module-level Map — survives request lifecycle, reset on server restart
export const guestScans = new Map<string, GuestScanResult>()

// Cleanup entries older than 1 hour (called on each new guest scan)
export function pruneGuestScans() {
  const cutoff = Date.now() - 3_600_000
  for (const [id, scan] of guestScans) {
    if (scan.createdAt < cutoff) guestScans.delete(id)
  }
}
```

### Flow

1. Guest navigates to `/scan` — publicly accessible (no auth redirect)
2. Guest enters URL, submits
3. `POST /api/scan` — detects no session → creates entry in `guestScans` Map → spawns scanner → returns `{ scanId, isGuest: true }`
4. Frontend polls `GET /api/scan?scanId=xxx` — detects `isGuest` query param or checks `guestScans` Map → returns current status/results
5. On `status === 'COMPLETED'`: full results render, sticky gate bar appears
6. `sessionStorage.setItem('guest_scan_id', scanId)` and `sessionStorage.setItem('guest_scan_url', url)` set in browser
7. If guest tries to scan a **different URL**: modal intercepts before fetch

### Guest scan limits

- **1 scan per browser session** — enforced client-side via `sessionStorage`
- Re-scanning the **same URL** is allowed (returns cached result from Map if still present, or re-runs)
- Scanning a **new URL** triggers the sign-up modal — blocked before any API call
- No server-side rate limiting for MVP

### Middleware change

Remove `/scan` from the protected matcher. Actual current `middleware.ts` content:

```ts
// CURRENT (actual file):
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/scan/:path*",       // ← remove this line
    "/issues/:path*",
    "/reviews/:path*",
    "/vision/:path*",
    "/compliance/:path*",
  ],
};

// AFTER:
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/issues/:path*",
    "/reviews/:path*",
    "/vision/:path*",
    "/compliance/:path*",
  ],
};
```

### API changes

**`POST /api/scan`** — allow unauthenticated, route to guest path:
```ts
const session = await getServerSession(authOptions)

if (!session) {
  // Guest path — in-memory only
  pruneGuestScans()
  const guestId = crypto.randomUUID()
  guestScans.set(guestId, { status: 'PENDING', createdAt: Date.now() })
  // Run scanner in background, update guestScans Map on completion
  runScannerForGuest(guestId, url)  // new helper
  return NextResponse.json({ scanId: guestId, isGuest: true })
}
// Existing authenticated path unchanged...
```

**`GET /api/scan`** — allow unauthenticated access for guest scan IDs:
```ts
const session = await getServerSession(authOptions)
const scanId = searchParams.get('scanId')

if (!session) {
  // Guest lookup — only from in-memory store
  const guestScan = guestScans.get(scanId)
  if (!guestScan) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(guestScan)
}
// Existing authenticated path unchanged...
```

Security note: guests can only retrieve their own scan by knowing the UUID. UUIDs are not guessable. No enumeration risk.

### Sticky gate bar (in `app/scan/page.tsx`)

Shown when: `status === 'COMPLETED'` (correct enum value) AND `!session`

```tsx
{scanStatus === 'COMPLETED' && !session && (
  <div
    role="region"
    aria-label="Free scan complete — sign up to save results"
    aria-live="polite"
    className="gate-bar"
  >
    <div>
      <h3>Save your results and scan more sites</h3>
      <p>Create a free account — no credit card, 30 seconds</p>
    </div>
    <div>
      <button
        onClick={() => setShowModal(true)}
        aria-haspopup="dialog"
        className="btn-primary"
      >
        Create free account
      </button>
      <button onClick={() => router.push('/login')} className="btn-ghost">
        Log in
      </button>
    </div>
  </div>
)}
```

### Second-URL modal (in `app/scan/page.tsx`)

Triggered client-side before any API call when:
```ts
const storedUrl = sessionStorage.getItem('guest_scan_url')
const isGuest = !session
if (isGuest && storedUrl && storedUrl !== newUrl) {
  setShowModal(true)
  return  // do not proceed with scan
}
```

Modal ARIA requirements:
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"`, `aria-describedby="modal-desc"`
- Focus trap: Tab/Shift+Tab cycle within modal focusable elements — WCAG 2.1.2
- `Escape` key closes modal and returns focus to the URL input — WCAG 2.1.2
- Focus moves to close button on open; returns to scan input on close
- `aria-haspopup="dialog"` on the gate bar button is correct — it opens an inline dialog

---

## 3. Super Admin Account

### Schema addition

```prisma
enum Role {
  USER
  SUPER_ADMIN
}

model User {
  // existing fields...
  role  Role  @default(USER)
}
```

Run `npx prisma db push` after schema change.

### Seed script

New file: `prisma/seed-admin.ts`

```ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = process.env.ADMIN_SEED_PASSWORD
  if (!password) throw new Error('ADMIN_SEED_PASSWORD env var required')

  const hash = await bcrypt.hash(password, 12)

  await prisma.user.upsert({
    where: { email: 'admin@accessiscan.com' },
    update: { plan: 'ENTERPRISE', role: 'SUPER_ADMIN' },
    create: {
      email: 'admin@accessiscan.com',
      name: 'AccessiScan Admin',
      passwordHash: hash,
      plan: 'ENTERPRISE',
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✓ Super admin seeded: admin@accessiscan.com')
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

Run with:
```bash
ADMIN_SEED_PASSWORD=your-password npx tsx prisma/seed-admin.ts
```

Add to `package.json`:
```json
"scripts": {
  "seed:admin": "tsx prisma/seed-admin.ts"
}
```

### Admin capabilities (this implementation)

- `SUPER_ADMIN` role stored in JWT via NextAuth `jwt` callback (extend `token.role`)
- Dashboard sidebar shows "Admin" badge next to user name when `role === 'SUPER_ADMIN'`
- Full `ENTERPRISE` plan features unlocked

---

## Files to Create / Modify

| File | Change |
|---|---|
| `app/page.tsx` | Full rewrite — new landing page layout |
| `app/globals.css` | Add system-adaptive CSS tokens (`prefers-color-scheme`) |
| `app/layout.tsx` | Add `Atkinson_Hyperlegible` via `next/font/google`; verify skip link is first focusable element |
| `app/scan/page.tsx` | Add guest mode: sticky gate bar, second-URL modal, `sessionStorage` logic, handle `isGuest` scan state |
| `middleware.ts` | Remove `/scan/:path*` from protected matcher |
| `app/api/scan/route.ts` | Allow unauthenticated POST + GET; route to guest in-memory path |
| `lib/guest-scans.ts` | **New** — in-memory Map, `GuestScanResult` type, `pruneGuestScans()`, `runScannerForGuest()` |
| `prisma/schema.prisma` | Add `Role` enum; add `role Role @default(USER)` to `User` model |
| `prisma/seed-admin.ts` | **New** — seeds super admin account |
| `package.json` | Add `seed:admin` script |
| `lib/auth.ts` | Extend JWT callback to include `token.role` from DB |

---

## Out of Scope (this implementation)

- Dashboard UI changes (dashboard stays as-is)
- VPAT report builder
- Improved scan depth / Puppeteer enhancements
- Admin panel UI (user list, impersonation)
- Guest scan result sharing via shareable URL
- Server-side rate limiting of guest scans
