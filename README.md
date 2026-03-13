# AccessiScan — Accessibility Auditing SaaS

> "Accessibility is not a feature you add, it's a way you build."

**The hybrid accessibility platform that combines automated scanning with real human expert review.**

Not an overlay. Not just automation. Real accessibility testing.

---

## 2-Week MVP Sprint Plan

### Week 1: Foundation (Days 1-7)
- **Day 1-2:** Project setup, auth (NextAuth + Supabase), database schema
- **Day 3-4:** Scanning engine (axe-core integration), URL crawler
- **Day 5-6:** Dashboard UI, issue display, severity classification
- **Day 7:** Human review queue (you reviewing screenshots manually)

### Week 2: Ship It (Days 8-14)
- **Day 8-9:** Vision simulation page, compliance scoring
- **Day 10-11:** Stripe integration (free tier + paid plans)
- **Day 12:** Landing page with value proposition
- **Day 13:** Testing, bug fixes, accessibility audit of YOUR OWN app
- **Day 14:** Deploy to Vercel, launch on Product Hunt

---

## Tech Stack (All Free Tier)

| Layer | Tool | Free Tier |
|-------|------|-----------|
| Framework | Next.js 14 (App Router) | Unlimited |
| Database | Supabase (Postgres) | 500MB, 50k rows |
| Auth | NextAuth.js + Supabase | Unlimited |
| Scanning | axe-core (open source) | Unlimited |
| Screenshots | Puppeteer / Playwright | Self-hosted |
| Payments | Stripe | Pay-as-you-go |
| Hosting | Vercel | 100GB bandwidth |
| Email | Resend | 100 emails/day |

**Total cost: $0/month** until you hit scale.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Client (Next.js)            │
│  ┌──────────┬──────────┬──────────────────┐  │
│  │Dashboard │ Scanner  │ Vision Simulator │  │
│  │          │          │                  │  │
│  │ Score    │ URL Input│ Color Blindness  │  │
│  │ Issues   │ Progress │ Low Vision       │  │
│  │ History  │ Results  │ Screen Reader    │  │
│  └──────────┴──────────┴──────────────────┘  │
├─────────────────────────────────────────────┤
│              API Routes (Next.js)            │
│  /api/scan   /api/issues   /api/reviews     │
│  /api/auth   /api/stripe   /api/reports     │
├─────────────────────────────────────────────┤
│              Services Layer                  │
│  ┌──────────────────────────────────────┐   │
│  │ axe-core Scanner → Issue Classifier  │   │
│  │ Puppeteer Screenshots → Review Queue │   │
│  │ Scoring Engine → Compliance Reports  │   │
│  └──────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│         Database (Supabase / Postgres)       │
│  users │ sites │ scans │ issues │ reviews   │
└─────────────────────────────────────────────┘
```

---

## Getting Started

```bash
# Clone and install
git clone <your-repo>
cd accessiscan
npm install

# Set up environment
cp .env.example .env.local
# Fill in your Supabase + Stripe keys

# Set up database
npx prisma generate
npx prisma db push

# Run dev server
npm run dev
```

---

## Pricing Model

| Plan | Price | Features |
|------|-------|----------|
| Free | $0/mo | 1 site, 5 pages/scan, auto-only |
| Pro | $49/mo | 5 sites, unlimited pages, human review (you) |
| Business | $149/mo | 25 sites, priority review, VPAT export |
| Enterprise | Custom | Dedicated reviewer, SLA, white-label |

---

## License

Proprietary — © 2026 AccessiScan
