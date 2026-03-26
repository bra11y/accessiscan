# Landing Page Redesign + Free Guest Scan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the landing page with a split-hero dashboard preview, add a free guest scan at `/scan` using an in-memory store, and seed a super admin account.

**Architecture:** The landing page is rewritten as a Server Component with no behaviour changes to auth flow. Guest scans bypass the database entirely — results live in a module-level `Map<string, GuestScanResult>` keyed by UUID. The scan page gains client-side `sessionStorage` enforcement and a sticky gate bar + modal for unauthenticated users.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, next/font/google (Atkinson Hyperlegible), Prisma/Supabase, NextAuth JWT, axe-core + Puppeteer (existing scanner), bcryptjs

**Spec:** `docs/superpowers/specs/2026-03-25-landing-freescan-redesign.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `prisma/schema.prisma` | Modify | Add `Role` enum + `role` field to `User` |
| `lib/auth.ts` | Modify | Forward `role` through JWT → session |
| `prisma/seed-admin.ts` | Create | Seed super admin user |
| `package.json` | Modify | Add `seed:admin` script |
| `app/globals.css` | Modify | Add system-adaptive tokens via `prefers-color-scheme` |
| `app/layout.tsx` | Modify | Replace `DM_Sans` with `Atkinson_Hyperlegible` on `--font-body` |
| `app/page.tsx` | Rewrite | New landing page — split hero, stats, features, how-it-works |
| `lib/guest-scans.ts` | Create | In-memory Map, types, `pruneGuestScans`, `runScannerForGuest` |
| `middleware.ts` | Modify | Remove `/scan/:path*` from protected matcher |
| `app/api/scan/route.ts` | Modify | Guest path in POST + GET handlers |
| `app/scan/page.tsx` | Modify | Guest mode: gate bar, second-URL modal, sessionStorage |

---

## Task 1: Add Role enum to Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add `Role` enum and `role` field**

Open `prisma/schema.prisma`. After the `Plan` enum (line 176), add:

```prisma
enum Role {
  USER
  SUPER_ADMIN
}
```

Then on the `User` model, after the `plan` field (line 25), add:

```prisma
  role      Role      @default(USER)
```

The User model's top section should now read:
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  passwordHash  String?
  image         String?
  plan          Plan      @default(FREE)
  role          Role      @default(USER)
  stripeId      String?   @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  // ... relations unchanged
```

- [ ] **Step 2: Push schema to database**

```bash
cd /Users/mac/Downloads/accessiscan
npx prisma db push
```

Expected output: `✓ Your database is now in sync with your Prisma schema.`

If it asks about data loss, the new column has a default — it's safe to proceed.

- [ ] **Step 3: Regenerate Prisma client**

```bash
npx prisma generate
```

Expected: `✓ Generated Prisma Client`

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add Role enum and role field to User model"
```

---

## Task 2: Forward role through NextAuth JWT

**Files:**
- Modify: `lib/auth.ts`

The current JWT callback only selects `plan`. We need to also select and forward `role`.

- [ ] **Step 1: Update the `jwt` callback in `lib/auth.ts`**

Find the `jwt` callback (lines 66–79). Replace it entirely:

```ts
async jwt({ token, user }) {
  if (user) {
    token.id = user.id;
  }
  // Fetch fresh plan + role on every token refresh
  if (token.id) {
    const dbUser = await db.user.findUnique({
      where: { id: token.id as string },
      select: { plan: true, role: true },
    });
    token.plan = dbUser?.plan ?? "FREE";
    token.role = dbUser?.role ?? "USER";
  }
  return token;
},
```

- [ ] **Step 2: Update the `session` callback in `lib/auth.ts`**

Find the `session` callback (lines 81–87). Replace it:

```ts
async session({ session, token }) {
  if (session.user) {
    (session.user as any).id = token.id;
    (session.user as any).plan = token.plan;
    (session.user as any).role = token.role;
  }
  return session;
},
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/mac/Downloads/accessiscan
npx tsc --noEmit
```

Expected: no errors. If you see errors about `token.role` not existing on the type, that's a NextAuth type augmentation issue — it's a type-only problem, not runtime. The app will still work. You can suppress it with `(token as any).role`.

- [ ] **Step 4: Commit**

```bash
git add lib/auth.ts
git commit -m "feat: include role in JWT token and session"
```

---

## Task 3: Seed the super admin account

**Files:**
- Create: `prisma/seed-admin.ts`
- Modify: `package.json`

- [ ] **Step 1: Create `prisma/seed-admin.ts`**

```ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = process.env.ADMIN_SEED_PASSWORD
  if (!password) {
    throw new Error('ADMIN_SEED_PASSWORD environment variable is required.\nUsage: ADMIN_SEED_PASSWORD=yourpassword npx tsx prisma/seed-admin.ts')
  }

  const hash = await bcrypt.hash(password, 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@accessiscan.com' },
    update: {
      plan: 'ENTERPRISE',
      role: 'SUPER_ADMIN',
    },
    create: {
      email: 'admin@accessiscan.com',
      name: 'AccessiScan Admin',
      passwordHash: hash,
      plan: 'ENTERPRISE',
      role: 'SUPER_ADMIN',
    },
  })

  console.log(`✓ Super admin ready: ${admin.email} (plan: ${admin.plan}, role: ${admin.role})`)
}

main()
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 2: Add `seed:admin` script to `package.json`**

Open `package.json`. In the `"scripts"` object, add:

```json
"seed:admin": "tsx prisma/seed-admin.ts"
```

- [ ] **Step 3: Run the seed**

```bash
cd /Users/mac/Downloads/accessiscan
ADMIN_SEED_PASSWORD=YourSecurePassword123! npm run seed:admin
```

Expected output:
```
✓ Super admin ready: admin@accessiscan.com (plan: ENTERPRISE, role: SUPER_ADMIN)
```

Keep the password you chose — you'll use it to log in for testing.

- [ ] **Step 4: Commit**

```bash
git add prisma/seed-admin.ts package.json
git commit -m "feat: add super admin seed script"
```

---

## Task 4: Add system-adaptive CSS tokens

**Files:**
- Modify: `app/globals.css`

The existing globals define dark-only tokens. We add a `prefers-color-scheme: light` block alongside them, plus any new tokens the landing page needs.

- [ ] **Step 1: Read the top of `app/globals.css` to find where `:root` is defined**

```bash
head -60 /Users/mac/Downloads/accessiscan/app/globals.css
```

- [ ] **Step 2: Add the light mode token block**

At the **end** of `app/globals.css`, append (do not replace existing tokens):

```css
/* ── System-adaptive tokens for landing page ── */
/* Dark mode values match existing --color-* tokens */
:root {
  --bg:        #0B0F1A;
  --surface-1: #0F172A;
  --surface-2: #1E293B;
  --border-1:  #1E293B;
  --border-2:  #334155;
  --brand-lp:  #818CF8;   /* 7.1:1 on --bg */
  --brand-lp-subtle: rgba(129, 140, 248, 0.1);
  --brand-lp-border: rgba(129, 140, 248, 0.25);
  --text-lp-1: #E6EDF3;   /* 14.7:1 ✓ */
  --text-lp-2: #C9D1D9;   /* 9.4:1  ✓ */
  --text-lp-3: #8B949E;   /* 4.7:1  ✓ AA */
  --success-lp: #3FB950;
  --warn-lp:    #D29922;
  --danger-lp:  #F85149;
}

@media (prefers-color-scheme: light) {
  :root {
    --bg:        #FFFFFF;
    --surface-1: #FFFFFF;
    --surface-2: #F6F8FA;
    --border-1:  #D0D7DE;
    --border-2:  #AFB8C1;
    --brand-lp:  #4F46E5;   /* 7.2:1 on white ✓ */
    --brand-lp-subtle: rgba(79, 70, 229, 0.08);
    --brand-lp-border: rgba(79, 70, 229, 0.2);
    --text-lp-1: #1F2328;   /* 17.8:1 ✓ */
    --text-lp-2: #24292F;   /* 16.1:1 ✓ */
    --text-lp-3: #57606A;   /* 5.9:1  ✓ */
    --success-lp: #1A7F37;
    --warn-lp:    #9A6700;
    --danger-lp:  #CF222E;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add system-adaptive CSS tokens for landing page"
```

---

## Task 5: Swap body font to Atkinson Hyperlegible

**Files:**
- Modify: `app/layout.tsx`

`DM_Sans` currently owns `--font-body`. We replace it with `Atkinson_Hyperlegible` — designed for low-vision readability, a credibility signal for an accessibility product. The variable name `--font-body` stays the same so all existing Tailwind `font-sans` references continue working.

- [ ] **Step 1: Update `app/layout.tsx` font imports**

Replace the import line for `DM_Sans` and its instantiation:

```ts
// BEFORE (line 2):
import { DM_Sans, JetBrains_Mono, Outfit } from "next/font/google";

// AFTER:
import { Atkinson_Hyperlegible, JetBrains_Mono, Outfit } from "next/font/google";
```

Replace the `fontBody` instantiation (lines 5–9):

```ts
// BEFORE:
const fontBody = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// AFTER:
const fontBody = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
  display: "swap",
});
```

Everything else in `layout.tsx` stays the same.

- [ ] **Step 2: Verify the dev server still starts**

```bash
cd /Users/mac/Downloads/accessiscan
npm run dev
```

Open http://localhost:3000. The font on the existing pages should look slightly different (more rounded, slightly wider letterforms). No layout breakage expected.

Stop the server with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: switch body font to Atkinson Hyperlegible for accessibility"
```

---

## Task 6: Rewrite the landing page

**Files:**
- Rewrite: `app/page.tsx`

This is the largest task. The page is a Server Component — no `'use client'`. Auth redirect for logged-in users stays. Every link to `/signup` becomes `/scan` (the new free scan entry point).

- [ ] **Step 1: Rewrite `app/page.tsx`**

Replace the entire file contents with:

```tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AccessiScan — Know exactly where your site fails accessibility",
  description:
    "Automated WCAG 2.1 AA, ADA, Section 508, and EAA compliance scanning. Full results instantly. No account needed for your first scan.",
  keywords:
    "accessibility audit, WCAG testing, ADA compliance, Section 508, EAA, web accessibility, accessibility scanner, VPAT",
  openGraph: {
    title: "AccessiScan — Know exactly where your site fails accessibility",
    description:
      "Run a free accessibility audit on any URL. Full results, AI fix suggestions, and human expert review.",
    type: "website",
  },
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div style={{ background: "var(--bg)", color: "var(--text-lp-2)", minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <header>
        <nav
          aria-label="Main navigation"
          style={{
            position: "sticky", top: 0, zIndex: 100,
            height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 40px",
            background: "color-mix(in srgb, var(--bg) 88%, transparent)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--border-1)",
          }}
        >
          <Link
            href="/"
            aria-label="AccessiScan home"
            style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "var(--text-lp-1)", fontWeight: 700, fontSize: "1.0625rem" }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 28, height: 28, background: "var(--brand-lp)",
                borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 800, fontSize: "0.875rem",
              }}
            >A</span>
            AccessiScan
          </Link>

          <div style={{ display: "flex", gap: 4 }}>
            {[
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How it works" },
              { href: "/pricing", label: "Pricing" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  color: "var(--text-lp-3)", fontSize: "0.9375rem", fontWeight: 500,
                  textDecoration: "none", padding: "8px 14px", borderRadius: 8,
                  minHeight: 44, display: "inline-flex", alignItems: "center",
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link
              href="/login"
              style={{
                color: "var(--text-lp-2)", fontSize: "0.9375rem", fontWeight: 500,
                padding: "9px 18px", border: "1px solid var(--border-2)", borderRadius: 8,
                background: "transparent", textDecoration: "none",
                minHeight: 44, display: "inline-flex", alignItems: "center",
              }}
            >
              Log in
            </Link>
            <Link
              href="/scan"
              style={{
                background: "var(--brand-lp)", color: "#fff",
                fontSize: "0.9375rem", fontWeight: 600,
                padding: "9px 20px", borderRadius: 8, textDecoration: "none",
                minHeight: 44, display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              Scan free <span aria-hidden="true">→</span>
            </Link>
          </div>
        </nav>
      </header>

      <main id="main-content">

        {/* ── HERO ── */}
        <section
          aria-labelledby="hero-heading"
          style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 48, alignItems: "center",
            padding: "72px 40px 64px", maxWidth: 1200, margin: "0 auto",
            position: "relative",
          }}
        >
          {/* Radial glow behind dashboard preview */}
          <div aria-hidden="true" style={{
            position: "absolute", right: -80, top: "50%", transform: "translateY(-50%)",
            width: 600, height: 600, pointerEvents: "none",
            background: "radial-gradient(circle, rgba(129,140,248,0.07) 0%, transparent 70%)",
          }} />

          {/* Left: copy */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              aria-label="Supports WCAG, ADA, Section 508, and EAA 2025"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                border: "1px solid var(--brand-lp-border)", background: "var(--brand-lp-subtle)",
                color: "var(--brand-lp)", fontSize: "0.8125rem", fontWeight: 600,
                padding: "5px 14px", borderRadius: 100, marginBottom: 20,
              }}
            >
              <span aria-hidden="true" style={{ width: 6, height: 6, background: "var(--brand-lp)", borderRadius: "50%" }} />
              WCAG · ADA · Section 508 · EAA 2025
            </div>

            <h1
              id="hero-heading"
              style={{
                fontSize: "clamp(1.875rem, 3.5vw, 2.875rem)",
                fontWeight: 700, color: "var(--text-lp-1)",
                lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 18,
              }}
            >
              Know exactly where your site fails accessibility.
            </h1>

            <p style={{
              fontSize: "1.0625rem", color: "var(--text-lp-3)",
              lineHeight: 1.7, marginBottom: 32, maxWidth: 460,
            }}>
              AccessiScan audits any URL against WCAG 2.1 AA, ADA, Section 508, and EAA 2025 in seconds — and gives you a prioritised fix list, not a wall of error codes.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
              <Link
                href="/scan"
                style={{
                  background: "var(--brand-lp)", color: "#fff",
                  fontSize: "1rem", fontWeight: 600,
                  padding: "13px 28px", borderRadius: 8, textDecoration: "none",
                  minHeight: 48, display: "inline-flex", alignItems: "center", gap: 8,
                }}
              >
                Scan your site free <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="#preview"
                style={{
                  color: "var(--text-lp-2)", fontSize: "1rem", fontWeight: 500,
                  padding: "13px 28px", border: "1px solid var(--border-2)", borderRadius: 8,
                  textDecoration: "none", minHeight: 48,
                  display: "inline-flex", alignItems: "center", gap: 8,
                }}
              >
                See a sample report
              </Link>
            </div>

            {/* Micro-proof */}
            <ul
              aria-label="What's included"
              style={{ display: "flex", gap: 16, listStyle: "none", padding: 0, flexWrap: "wrap", fontSize: "0.875rem", color: "var(--text-lp-3)" }}
            >
              {["No account needed", "Full results instantly", "1 free scan per session"].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span aria-hidden="true" style={{ color: "var(--success-lp)" }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Dashboard preview */}
          <div
            aria-label="Example scan result: example.com scored 72%, 14 issues found including 3 critical"
            style={{ position: "relative", zIndex: 1 }}
          >
            <div style={{
              border: "1px solid var(--border-1)", borderRadius: 12,
              overflow: "hidden", background: "var(--surface-1)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04)",
            }}>
              {/* Browser chrome */}
              <div aria-hidden="true" style={{
                background: "var(--surface-2)", borderBottom: "1px solid var(--border-1)",
                padding: "10px 14px", display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ display: "flex", gap: 5 }}>
                  {["#FF5F57","#FEBC2E","#28C840"].map((c) => (
                    <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                  ))}
                </div>
                <div style={{
                  flex: 1, background: "var(--surface-1)", border: "1px solid var(--border-1)",
                  borderRadius: 5, padding: "4px 10px", fontSize: "0.75rem", color: "var(--text-lp-3)",
                  fontFamily: "monospace",
                }}>
                  app.accessiscan.com/scan/result
                </div>
              </div>

              <div style={{ padding: 16 }}>
                {/* Progress bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: "0.875rem", color: "var(--text-lp-3)", fontWeight: 500 }}>Compliance</span>
                  <div
                    role="progressbar"
                    aria-valuenow={72} aria-valuemin={0} aria-valuemax={100}
                    aria-label="72% compliant"
                    style={{ flex: 1, height: 6, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}
                  >
                    <div style={{ width: "72%", height: "100%", background: "var(--brand-lp)", borderRadius: 3 }} />
                  </div>
                  <span style={{ fontWeight: 700, color: "var(--warn-lp)", fontSize: "0.875rem" }}>72%</span>
                </div>

                {/* Score cards */}
                <div
                  role="list"
                  aria-label="Scan scores"
                  style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}
                >
                  {[
                    { val: "72", label: "WCAG Score", color: "var(--warn-lp)" },
                    { val: "14", label: "Issues found", color: "var(--danger-lp)" },
                    { val: "3",  label: "Critical",    color: "var(--danger-lp)" },
                  ].map(({ val, label, color }) => (
                    <div key={label} role="listitem" style={{
                      background: "var(--surface-2)", border: "1px solid var(--border-1)",
                      borderRadius: 8, padding: "12px 14px",
                    }}>
                      <div style={{ fontSize: "1.625rem", fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-lp-3)", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Issue list */}
                <ul aria-label="Top accessibility issues" style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                  {[
                    { sev: "Critical", color: "rgba(248,81,73,0.15)", textColor: "var(--danger-lp)", title: "Images missing alt text", meta: "7 instances · WCAG 1.1.1 · ADA Section 508", highlight: true },
                    { sev: "Serious",  color: "rgba(210,153,34,0.15)", textColor: "var(--warn-lp)",   title: "Color contrast fails 4.5:1 minimum", meta: "4 instances · WCAG 1.4.3", highlight: false },
                    { sev: "Moderate", color: "rgba(129,140,248,0.15)", textColor: "var(--brand-lp)", title: "Form inputs missing labels", meta: "3 instances · WCAG 1.3.1", highlight: false },
                  ].map(({ sev, color, textColor, title, meta, highlight }) => (
                    <li key={title} style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      background: highlight ? "var(--brand-lp-subtle)" : "var(--surface-2)",
                      border: `1px solid ${highlight ? "var(--brand-lp-border)" : "var(--border-1)"}`,
                      borderRadius: 6, padding: "10px 12px",
                    }}>
                      <span
                        aria-label={`${sev} severity`}
                        style={{
                          fontSize: "0.6875rem", fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                          whiteSpace: "nowrap", flexShrink: 0, marginTop: 1,
                          background: color, color: textColor,
                          display: "flex", alignItems: "center", gap: 4,
                        }}
                      >
                        <span aria-hidden="true">●</span> {sev}
                      </span>
                      <div>
                        <div style={{ color: "var(--text-lp-1)", fontWeight: 600, fontSize: "0.8125rem" }}>{title}</div>
                        <div style={{ color: "var(--text-lp-3)", fontSize: "0.75rem", marginTop: 1 }}>{meta}</div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Verified badge */}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-1)" }}>
                  <div
                    aria-label="This page is AccessiScan verified with 0 issues"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      background: "rgba(63,185,80,0.1)", border: "1px solid rgba(63,185,80,0.25)",
                      color: "var(--success-lp)", fontSize: "0.75rem", fontWeight: 600,
                      padding: "4px 12px", borderRadius: 100,
                    }}
                  >
                    <span aria-hidden="true" style={{ width: 6, height: 6, background: "var(--success-lp)", borderRadius: "50%" }} />
                    This page is AccessiScan verified — 0 issues
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <div
          role="list"
          aria-label="Accessibility statistics"
          style={{
            display: "flex", borderTop: "1px solid var(--border-1)", borderBottom: "1px solid var(--border-1)",
            background: "var(--surface-2)",
          }}
        >
          {[
            { val: "98%",   label: "of websites fail basic accessibility checks" },
            { val: "€75K",  label: "max fine under the European Accessibility Act" },
            { val: "1 in 6",label: "people worldwide live with a disability" },
            { val: "70%",   label: "of issues require human review to fully catch" },
          ].map(({ val, label }, i, arr) => (
            <div
              key={val}
              role="listitem"
              style={{
                flex: 1, padding: "24px 20px", textAlign: "center",
                borderRight: i < arr.length - 1 ? "1px solid var(--border-1)" : "none",
              }}
            >
              <span style={{ fontSize: "1.625rem", fontWeight: 700, color: "var(--text-lp-1)", display: "block", lineHeight: 1 }}>{val}</span>
              <span style={{ fontSize: "0.875rem", color: "var(--text-lp-3)", marginTop: 6, lineHeight: 1.4, display: "block" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── FEATURES ── */}
        <section id="features" aria-labelledby="features-heading" style={{ padding: "72px 40px", maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--brand-lp)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Features</p>
          <h2 id="features-heading" style={{ fontSize: "clamp(1.5rem, 2.8vw, 2rem)", fontWeight: 700, color: "var(--text-lp-1)", letterSpacing: "-0.01em", lineHeight: 1.25, marginBottom: 12 }}>
            Everything you need to fix accessibility
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--text-lp-3)", maxWidth: 500, lineHeight: 1.7, marginBottom: 40 }}>
            From automated detection to expert human review to legal-grade compliance reports.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--border-1)", border: "1px solid var(--border-1)", borderRadius: 12, overflow: "hidden" }}>
            {[
              { icon: "🔍", title: "Automated scanning",       desc: "axe-core engine checks WCAG 2.1 AA, ADA, Section 508, and EAA 2025 across every page — in seconds.",                                             tier: "Free tier" },
              { icon: "👁️", title: "Vision simulation",        desc: "Preview your site through 8 color blindness and low vision filters. See what 1 in 12 men experience on your pages.",                           tier: "Pro+" },
              { icon: "🧑‍💻", title: "Human expert review",      desc: "Certified specialists review what automation misses — keyboard flows, cognitive load, ARIA context, focus order.",                             tier: "Pro+" },
              { icon: "⚡", title: "AI fix suggestions",        desc: "Every issue includes a ready-to-paste code fix with the exact WCAG criterion and implementation notes.",                                        tier: "All plans" },
              { icon: "📄", title: "VPAT reports",              desc: "Generate audit-ready Voluntary Product Accessibility Templates for legal, procurement, and enterprise compliance.",                             tier: "Business+" },
              { icon: "🌐", title: "Universal Design audit",    desc: "Go beyond WCAG. Evaluate against all 7 Universal Design principles for deeper, more inclusive coverage.",                                      tier: "Pro+" },
            ].map(({ icon, title, desc, tier }) => (
              <div
                key={title}
                style={{ background: "var(--surface-1)", padding: "28px 24px" }}
                className="lp-feat-card"
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: 42, height: 42, background: "var(--brand-lp-subtle)",
                    border: "1px solid var(--brand-lp-border)", borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.125rem", marginBottom: 16,
                  }}
                >{icon}</div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-lp-1)", marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: "0.9375rem", color: "var(--text-lp-3)", lineHeight: 1.65 }}>{desc}</p>
                <span style={{
                  marginTop: 14, display: "inline-block",
                  fontSize: "0.6875rem", fontWeight: 600, padding: "3px 8px", borderRadius: 4,
                  background: "var(--brand-lp-subtle)", color: "var(--brand-lp)",
                  border: "1px solid var(--brand-lp-border)", letterSpacing: "0.03em",
                }}>{tier}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section
          id="how-it-works"
          aria-labelledby="how-heading"
          style={{ background: "var(--surface-2)", borderTop: "1px solid var(--border-1)", borderBottom: "1px solid var(--border-1)", padding: "72px 40px" }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--brand-lp)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>How it works</p>
            <h2 id="how-heading" style={{ fontSize: "clamp(1.5rem, 2.8vw, 2rem)", fontWeight: 700, color: "var(--text-lp-1)", letterSpacing: "-0.01em", marginBottom: 40 }}>
              From URL to compliant in three steps
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
              {[
                { n: "1", title: "Scan", desc: "Enter any URL. Our engine crawls your pages and runs every major accessibility check in seconds. No account or credit card needed for your first scan." },
                { n: "2", title: "Review", desc: "See a prioritised issue list — severity levels, WCAG criterion references, element selectors, and flags for issues that need human review." },
                { n: "3", title: "Fix & report", desc: "Apply AI-generated code fixes, track remediation over time, and export compliance reports your legal team can actually use." },
              ].map(({ n, title, desc }) => (
                <div key={n} style={{ background: "var(--surface-1)", border: "1px solid var(--border-1)", borderRadius: 12, padding: "28px 24px" }}>
                  <div
                    aria-hidden="true"
                    style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: "var(--brand-lp-subtle)", border: "1px solid var(--brand-lp-border)",
                      color: "var(--brand-lp)", fontSize: "0.875rem", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                    }}
                  >{n}</div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-lp-1)", marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: "0.9375rem", color: "var(--text-lp-3)", lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section aria-labelledby="cta-heading" style={{ padding: "72px 40px", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
          <h2 id="cta-heading" style={{ fontSize: "clamp(1.5rem, 2.8vw, 2rem)", fontWeight: 700, color: "var(--text-lp-1)", marginBottom: 16 }}>
            Start with a free scan — no sign-up needed.
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--text-lp-3)", lineHeight: 1.7, marginBottom: 32 }}>
            See your real accessibility issues in under 60 seconds. Create a free account when you're ready to fix them and track progress over time.
          </p>
          <Link
            href="/scan"
            style={{
              background: "var(--brand-lp)", color: "#fff",
              fontSize: "1rem", fontWeight: 600, padding: "13px 32px",
              borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, minHeight: 48,
            }}
          >
            Scan your site free <span aria-hidden="true">→</span>
          </Link>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid var(--border-1)",
        padding: "28px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
        fontSize: "0.9375rem", color: "var(--text-lp-3)",
      }}>
        <span>© {new Date().getFullYear()} AccessiScan. Building a more inclusive web.</span>
        <nav aria-label="Footer links" style={{ display: "flex", gap: 20 }}>
          <Link href="/pricing" style={{ color: "var(--text-lp-3)", textDecoration: "none" }}>Pricing</Link>
          <a href="mailto:hello@accessiscan.com" style={{ color: "var(--text-lp-3)", textDecoration: "none" }}>Contact</a>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            aria-hidden="true"
            style={{
              width: 8, height: 8, background: "var(--success-lp)", borderRadius: "50%",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          <span>All systems operational</span>
        </div>
      </footer>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.75)} }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition-duration: 0.01ms !important; }
        }
        .lp-feat-card:hover { background: var(--surface-2) !important; }
        a:focus-visible, button:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(129,140,248,0.5);
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Start the dev server and verify the landing page**

```bash
npm run dev
```

Open http://localhost:3000. You should see:
- Split hero: headline left, dashboard preview card right
- Stats bar: 98%, €75K, 1 in 6, 70%
- 6-card features grid
- 3-step how it works
- Footer with pulsing dot

Tab through the page and verify all links are reachable and focus rings are visible.

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: redesign landing page with split hero and dashboard preview"
```

---

## Task 7: Create the guest scan in-memory store

**Files:**
- Create: `lib/guest-scans.ts`

This module holds the in-memory state for guest scans and the function that runs the scanner without touching the database.

- [ ] **Step 1: Read `lib/scanner.ts` lines 265–384 to understand `crawlAndScan`**

```bash
sed -n '265,384p' /Users/mac/Downloads/accessiscan/lib/scanner.ts
```

The function signature is `async function crawlAndScan(baseUrl: string): Promise<PageResult[]>`. It is NOT exported. We need to extract its logic or duplicate the scanning call. The simplest approach: re-export `crawlAndScan` from `scanner.ts`.

- [ ] **Step 2: Export `crawlAndScan` from `lib/scanner.ts`**

In `lib/scanner.ts`, find the last line (line 387):

```ts
export { calculateScore, generateFixSuggestion, classifyStandard };
```

Replace with:

```ts
export { calculateScore, generateFixSuggestion, classifyStandard, crawlAndScan };
```

- [ ] **Step 3: Create `lib/guest-scans.ts`**

```ts
import { crawlAndScan, calculateScore } from "@/lib/scanner";

// ── Types ──

export interface GuestIssue {
  severity: "CRITICAL" | "SERIOUS" | "MODERATE" | "MINOR";
  title: string;
  description: string;
  rule: string;
  ruleId: string;
  standard: string;
  element: string;
  htmlSnippet: string;
  needsHuman: boolean;
  fixSuggestion: string;
  pageUrl: string;
}

export interface GuestScanResult {
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  score?: number;
  wcagScore?: number;
  adaScore?: number;
  ariaScore?: number;
  issueCount?: number;
  pagesCount?: number;
  issues?: GuestIssue[];
  error?: string;
  createdAt: number;
}

// ── In-memory store ──
// Module-level Map — persists across requests within one server process.
// Cleared on server restart (acceptable for MVP guest scans).

export const guestScans = new Map<string, GuestScanResult>();

// ── Prune entries older than 1 hour ──
// Call this before each new guest scan to prevent unbounded growth.

export function pruneGuestScans(): void {
  const cutoff = Date.now() - 3_600_000; // 1 hour in ms
  for (const [id, scan] of guestScans) {
    if (scan.createdAt < cutoff) guestScans.delete(id);
  }
}

// ── Run a guest scan ──
// Calls crawlAndScan (the same engine as authenticated scans),
// stores results in guestScans Map. No database writes.

export async function runScannerForGuest(
  guestId: string,
  url: string
): Promise<void> {
  // Mark as running
  guestScans.set(guestId, {
    ...(guestScans.get(guestId) ?? { createdAt: Date.now() }),
    status: "RUNNING",
  });

  try {
    const pages = await crawlAndScan(url);

    const allIssues: GuestIssue[] = pages.flatMap((page) =>
      page.issues.map((issue) => ({
        ...issue,
        pageUrl: page.url,
        standard: issue.standard as string,
      }))
    );

    const totalChecks = allIssues.length + pages.length * 20;
    const wcagIssues = allIssues.filter((i) => i.standard === "WCAG");
    const adaIssues = allIssues.filter(
      (i) => i.standard === "ADA" || i.standard === "SECTION508"
    );
    const ariaIssues = allIssues.filter((i) => i.standard === "ARIA");

    const score = calculateScore(allIssues as any, totalChecks);
    const wcagScore = calculateScore(wcagIssues as any, Math.max(totalChecks * 0.5, 1));
    const adaScore = calculateScore(adaIssues as any, Math.max(totalChecks * 0.3, 1));
    const ariaScore = calculateScore(ariaIssues as any, Math.max(totalChecks * 0.2, 1));

    guestScans.set(guestId, {
      status: "COMPLETED",
      score,
      wcagScore,
      adaScore,
      ariaScore,
      issueCount: allIssues.length,
      pagesCount: pages.length,
      issues: allIssues,
      createdAt: guestScans.get(guestId)?.createdAt ?? Date.now(),
    });
  } catch (err) {
    guestScans.set(guestId, {
      status: "FAILED",
      error: err instanceof Error ? err.message : "Scan failed",
      createdAt: guestScans.get(guestId)?.createdAt ?? Date.now(),
    });
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add lib/guest-scans.ts lib/scanner.ts
git commit -m "feat: add guest scan in-memory store and runner"
```

---

## Task 8: Open /scan to the public

**Files:**
- Modify: `middleware.ts`

- [ ] **Step 1: Remove `/scan/:path*` from the matcher**

Replace the entire `middleware.ts` with:

```ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

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

- [ ] **Step 2: Verify that visiting `/scan` without being logged in no longer redirects to `/login`**

```bash
npm run dev
```

Open http://localhost:3000/scan in an incognito/private browser window. You should see the scan page, not a redirect to `/login`.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: make /scan publicly accessible for guest users"
```

---

## Task 9: Update scan API for guest support

**Files:**
- Modify: `app/api/scan/route.ts`

- [ ] **Step 1: Rewrite `app/api/scan/route.ts`**

Replace the entire file:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { runAccessibilityScan } from "@/lib/scanner";
import { guestScans, pruneGuestScans, runScannerForGuest } from "@/lib/guest-scans";
import { z } from "zod";

const scanSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

// ── POST /api/scan — Start a new scan ──

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = scanSchema.parse(body);

    const session = await getServerSession(authOptions);

    // ── Guest path: no auth, in-memory only ──
    if (!session?.user) {
      pruneGuestScans();
      const guestId = crypto.randomUUID();
      guestScans.set(guestId, { status: "PENDING", createdAt: Date.now() });

      // Fire and forget — do not await
      runScannerForGuest(guestId, url).catch((err) => {
        console.error("Guest scan failed:", err);
      });

      return NextResponse.json({
        scanId: guestId,
        isGuest: true,
        status: "PENDING",
        message: "Guest scan started.",
      });
    }

    // ── Authenticated path: unchanged ──
    const userId = (session.user as any).id;
    const plan = (session.user as any).plan;

    const siteCount = await db.site.count({ where: { userId } });
    const planLimits: Record<string, number> = {
      FREE: 1, PRO: 5, BUSINESS: 25, ENTERPRISE: 999,
    };

    let site = await db.site.findFirst({ where: { url, userId } });

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

    const scan = await db.scan.create({
      data: { siteId: site.id, status: "PENDING" },
    });

    runAccessibilityScan(site.id, scan.id).catch((err) => {
      console.error("Scan failed:", err);
    });

    return NextResponse.json({
      scanId: scan.id,
      siteId: site.id,
      status: "PENDING",
      message: "Scan started.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Scan API error:", error);
    return NextResponse.json({ error: "Failed to start scan" }, { status: 500 });
  }
}

// ── GET /api/scan?scanId=xxx — Check scan status ──

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scanId = searchParams.get("scanId");
    const session = await getServerSession(authOptions);

    // ── Guest lookup: no auth required for known guest scan IDs ──
    if (!session?.user) {
      if (!scanId) {
        return NextResponse.json({ error: "scanId required for guest access" }, { status: 400 });
      }
      const guestScan = guestScans.get(scanId);
      if (!guestScan) {
        return NextResponse.json({ error: "Scan not found" }, { status: 404 });
      }
      // Wrap in same shape as authenticated response for front-end compatibility
      return NextResponse.json({ scan: { ...guestScan, id: scanId, isGuest: true } });
    }

    // ── Authenticated path: unchanged ──
    const userId = (session.user as any).id;

    if (!scanId) {
      const scans = await db.scan.findMany({
        where: { site: { userId } },
        include: {
          site: { select: { url: true, name: true } },
          _count: { select: { issues: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return NextResponse.json({ scans });
    }

    const scan = await db.scan.findUnique({
      where: { id: scanId },
      include: {
        site: { select: { url: true, name: true } },
        issues: { orderBy: [{ severity: "asc" }, { createdAt: "desc" }] },
        pages: { select: { id: true, url: true, title: true, screenshotUrl: true } },
      },
    });

    if (!scan) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    return NextResponse.json({ scan });
  } catch (error) {
    console.error("Scan GET error:", error);
    return NextResponse.json({ error: "Failed to fetch scan data" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/api/scan/route.ts
git commit -m "feat: add guest scan path to POST and GET /api/scan"
```

---

## Task 10: Add guest UI to scan page

**Files:**
- Modify: `app/scan/page.tsx`

The scan page needs three additions:
1. Read session (it already does — check if `session` is available client-side)
2. `sessionStorage` enforcement for single-URL guest limit
3. Sticky gate bar after `COMPLETED` scan for guests
4. Second-URL modal with proper focus trap

First, read the current scan page to understand its structure:

- [ ] **Step 1: Read scan page structure**

```bash
head -80 /Users/mac/Downloads/accessiscan/app/scan/page.tsx
```

Note where `session` is read, where `scanStatus` state lives, and where the scan form is.

- [ ] **Step 2: Add guest session check near the top of the component**

Find where `useSession` or `getServerSession` is used. If the scan page is a Client Component (`'use client'`), it uses `useSession` from `next-auth/react`. Add a null-safe check:

```ts
const { data: session } = useSession();
const isGuest = !session?.user;
```

- [ ] **Step 3: Add sessionStorage logic to the scan submit handler**

In the existing submit/scan handler function, before the API call, add this guest URL guard:

```ts
// Guest single-URL enforcement
if (isGuest) {
  const storedUrl = sessionStorage.getItem('guest_scan_url');
  if (storedUrl && storedUrl !== url) {
    setShowSignupModal(true);
    return; // block the scan
  }
}
```

After a successful guest scan response, store the URL:
```ts
if (data.isGuest) {
  sessionStorage.setItem('guest_scan_id', data.scanId);
  sessionStorage.setItem('guest_scan_url', url);
}
```

- [ ] **Step 4: Add `showSignupModal` state**

Near the top of the component, alongside existing `useState` calls, add:

```ts
const [showSignupModal, setShowSignupModal] = useState(false);
const signupModalTriggerRef = useRef<HTMLButtonElement>(null);
const scanInputRef = useRef<HTMLInputElement>(null); // add ref to URL input if not present
```

- [ ] **Step 5: Add sticky gate bar to the JSX**

At the end of the returned JSX (just before the closing `</div>` or `</main>`), add:

```tsx
{/* ── Sticky gate bar: shown after completed guest scan ── */}
{scanStatus === 'COMPLETED' && isGuest && (
  <div
    role="region"
    aria-label="Free scan complete — sign up to save results"
    aria-live="polite"
    style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
      background: 'var(--color-surface-raised)',
      borderTop: '1px solid var(--color-border)',
      padding: '16px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
    }}
  >
    <div>
      <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, fontSize: '1rem' }}>
        Save your results and scan more sites
      </p>
      <p style={{ color: 'var(--color-text-secondary)', margin: '3px 0 0', fontSize: '0.875rem' }}>
        Free account — no credit card, 30 seconds
      </p>
    </div>
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
      <button
        ref={signupModalTriggerRef}
        onClick={() => setShowSignupModal(true)}
        aria-haspopup="dialog"
        style={{
          background: 'var(--color-brand)', color: '#fff',
          fontSize: '0.9375rem', fontWeight: 600,
          padding: '11px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
          minHeight: 44, fontFamily: 'inherit',
        }}
      >
        Create free account
      </button>
      <button
        onClick={() => window.location.href = '/login'}
        style={{
          color: 'var(--color-text-secondary)', fontSize: '0.9375rem',
          background: 'none', border: 'none', cursor: 'pointer',
          textDecoration: 'underline', minHeight: 44, padding: '0 8px', fontFamily: 'inherit',
        }}
      >
        Log in
      </button>
    </div>
  </div>
)}
```

- [ ] **Step 6: Add the second-URL modal**

After the gate bar JSX, add the modal:

```tsx
{/* ── Second-URL modal: shown when guest tries to scan a new URL ── */}
{showSignupModal && (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="signup-modal-title"
    aria-describedby="signup-modal-desc"
    style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 300, padding: 20,
    }}
    onKeyDown={(e) => {
      if (e.key === 'Escape') {
        setShowSignupModal(false);
        // Return focus to trigger or scan input
        (signupModalTriggerRef.current ?? scanInputRef.current)?.focus();
      }
    }}
  >
    <div
      style={{
        background: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border)',
        borderRadius: 16, padding: 40, maxWidth: 440, width: '100%', position: 'relative',
      }}
      // Focus trap implemented via onKeyDown below
      onKeyDown={(e) => {
        if (e.key !== 'Tab') return;
        const focusable = Array.from(
          e.currentTarget.querySelectorAll<HTMLElement>(
            'button, [href], input, [tabindex]:not([tabindex="-1"])'
          )
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }}
    >
      {/* Close button — receives focus on open */}
      <button
        autoFocus
        onClick={() => {
          setShowSignupModal(false);
          (signupModalTriggerRef.current ?? scanInputRef.current)?.focus();
        }}
        aria-label="Close dialog"
        style={{
          position: 'absolute', top: 16, right: 16,
          background: 'var(--color-surface-overlay)', border: '1px solid var(--color-border)',
          borderRadius: 6, width: 36, height: 36,
          cursor: 'pointer', color: 'var(--color-text-secondary)',
          fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >✕</button>

      <h2 id="signup-modal-title" style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 10 }}>
        You&apos;ve found real issues — now fix them.
      </h2>
      <p id="signup-modal-desc" style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', marginBottom: 24, lineHeight: 1.65 }}>
        Your free scan is complete. Create a free account to scan additional sites, save this report, and start fixing with AI suggestions.
      </p>

      <ul aria-label="What's included in a free account" style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
        {[
          'Scan up to 3 sites per month',
          'Save and share scan reports',
          'AI-generated code fix suggestions',
          'Track remediation progress over time',
          'Vision simulation — 8 color blindness modes',
        ].map((perk) => (
          <li key={perk} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            fontSize: '0.9375rem', color: 'var(--color-text-secondary)',
            padding: '10px 0', borderBottom: '1px solid var(--color-border)',
          }}>
            <span aria-hidden="true" style={{ color: 'var(--color-success)', flexShrink: 0 }}>✓</span>
            {perk}
          </li>
        ))}
      </ul>

      <button
        onClick={() => window.location.href = '/signup'}
        style={{
          width: '100%', background: 'var(--color-brand)', color: '#fff',
          fontSize: '1rem', fontWeight: 600, padding: 14,
          borderRadius: 8, border: 'none', cursor: 'pointer',
          minHeight: 48, fontFamily: 'inherit',
        }}
      >
        Create free account
      </button>
      <p style={{ textAlign: 'center', marginTop: 14, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
        Already have an account?{' '}
        <a href="/login" style={{ color: 'var(--color-brand)', textDecoration: 'none' }}>Log in</a>
      </p>
    </div>
  </div>
)}
```

- [ ] **Step 7: Verify TypeScript**

```bash
npx tsc --noEmit
```

Fix any type errors. Common ones: `useRef` needs explicit type annotation, `sessionStorage` is undefined on server — wrap in `typeof window !== 'undefined'` guards if needed (but this is a Client Component so it should be fine).

- [ ] **Step 8: Test the guest flow end-to-end**

```bash
npm run dev
```

1. Open http://localhost:3000/scan in incognito
2. Enter a URL and click Scan — verify the scan runs and results show
3. After results: verify the sticky gate bar appears at the bottom
4. Try typing a different URL and clicking Scan — verify the modal appears
5. Press `Escape` — verify the modal closes and focus returns
6. Tab through the modal — verify focus is trapped inside

- [ ] **Step 9: Commit**

```bash
git add app/scan/page.tsx
git commit -m "feat: add guest scan gate bar and second-URL modal to scan page"
```

---

## Task 11: Admin badge in dashboard sidebar

**Files:**
- Modify: `app/dashboard/layout.tsx`

- [ ] **Step 1: Read the sidebar to find where the user name is rendered**

```bash
grep -n "user\|name\|email\|session" /Users/mac/Downloads/accessiscan/app/dashboard/layout.tsx | head -30
```

- [ ] **Step 2: Add the admin badge next to the user name**

Find where `session.user.name` or `session.user.email` is displayed. After it, add:

```tsx
{(session?.user as any)?.role === 'SUPER_ADMIN' && (
  <span
    aria-label="Super admin account"
    style={{
      fontSize: '0.625rem', fontWeight: 700, padding: '1px 6px',
      background: 'rgba(129,140,248,0.15)', color: '#818CF8',
      border: '1px solid rgba(129,140,248,0.3)',
      borderRadius: 4, letterSpacing: '0.05em', textTransform: 'uppercase',
    }}
  >
    Admin
  </span>
)}
```

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit
git add app/dashboard/layout.tsx
git commit -m "feat: show Admin badge in sidebar for SUPER_ADMIN users"
```

---

## Task 12: Final verification

- [ ] **Step 1: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: build succeeds. Fix any build errors before proceeding.

- [ ] **Step 3: End-to-end smoke test**

With `npm run dev` running:

1. **Landing page** — http://localhost:3000: split hero visible, dashboard preview correct, light/dark follows system preference
2. **Guest scan** — http://localhost:3000/scan (incognito): scan runs, results show, gate bar appears, second URL triggers modal, Escape closes modal
3. **Auth redirect** — http://localhost:3000 when logged in: redirects to `/dashboard`
4. **Protected routes** — http://localhost:3000/dashboard (not logged in): redirects to `/login`
5. **Admin account** — log in as `admin@accessiscan.com`: sidebar shows "Admin" badge, all Enterprise features accessible

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete landing page redesign, guest scan, and super admin"
```
