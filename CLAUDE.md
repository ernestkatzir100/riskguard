# CLAUDE.md — RiskGuard

## Project Overview
RiskGuard — Enterprise risk management SaaS platform for Israeli non-bank credit institutions regulated by the Israel Securities Authority (ISA). Covers operational risk, cyber risk, credit risk, compliance, board governance, KRI monitoring, and regulatory reporting.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS 4, Radix UI, Lucide icons, CVA + clsx + tailwind-merge, Recharts for dashboards
- **Auth:** Custom JWT auth (jose + bcryptjs)
- **Database:** PostgreSQL (Railway, via postgres.js driver), Drizzle ORM
- **i18n:** next-intl (Hebrew RTL + English)
- **Email:** Resend
- **Reports:** docx, jsPDF, pdfkit, xlsx export
- **Drag & Drop:** dnd-kit
- **Testing:** Vitest + Playwright (E2E)
- **Package Manager:** npm
- **Deployment:** Railway (auto-deploy from GitHub main branch)

## Project Structure
```
src/
├── app/
│   ├── [locale]/
│   │   ├── (admin)/       # Admin panel (billing, monitoring, onboarding, nutela)
│   │   ├── (auth)/        # Login, signup
│   │   ├── (dashboard)/   # Main app modules (see below)
│   │   └── approve/       # Token-based approval flows
│   ├── actions/           # Server Actions (mutations, data fetching)
│   ├── api/               # API routes (auth, cron)
│   └── globals.css
├── db/                    # Drizzle schema, seeds
├── i18n/                  # Translations (en/he)
├── middleware.ts           # Auth + locale routing
└── shared/
    ├── components/        # Reusable UI components
    ├── hooks/             # Custom React hooks
    └── lib/               # Utilities, auth, permissions, reports, compliance engine
```

## Dashboard Modules
agents, audit, bcp, board, credit-risk, cyber-governance, cyber-incidents, cyber-protection, documents, event-reporting, kri, onboarding, operational-risk, outsourcing, regulation, reports, risk-governance, risk-register, settings, tasks

## Key Commands
```bash
npm run dev               # Run locally
npm run build             # Production build
npm run lint              # ESLint + RTL check
npm run typecheck         # TypeScript check
npm run test              # Vitest
npm run test:e2e          # Playwright E2E
npm run db:push           # Push schema to DB
npm run db:generate       # Generate migrations
npm run db:seed           # Seed database
npm run db:studio         # Drizzle Studio (DB GUI)
railway run npm run dev   # Run with Railway env vars
```

## Development Rules

### RTL / i18n
- Bilingual app: Hebrew (RTL) + English (LTR)
- Always use logical CSS: `ps-`, `pe-`, `ms-`, `me-`, `text-start`, `text-end`
- NEVER use `pl-`, `pr-`, `ml-`, `mr-`, `text-left`, `text-right`, `float-left`, `float-right`
- Lint enforces this: `npm run lint:rtl`
- All user-facing strings via next-intl translation keys

### Database
- Drizzle ORM with postgres.js driver
- Schema in `src/db/schema/index.ts` and `schema.ts` (root)
- Row Level Security (RLS) via Supabase migrations
- Multi-tenant: all queries must be tenant-scoped

### Auth
- Custom JWT implementation (jose library)
- bcryptjs for password hashing
- Middleware protects routes and handles locale routing
- Token-based approval workflows for board decisions

### Reports & Exports
- DOCX generation via docx library
- PDF via jsPDF + jspdf-autotable, pdfkit
- Excel via xlsx
- Compliance engine for ISA regulatory mapping

### Code Style
- TypeScript strict mode
- Server Components by default, `"use client"` only when needed
- Server Actions in `src/app/actions/` for all mutations
- Shared components in `src/shared/components/`
- Business logic in `src/shared/lib/`

### Deployment
- Push to `main` → Railway auto-deploys
- Environment variables in Railway dashboard
- Never commit .env files

## Business Context
- **Owner:** Ernest Katzir
- **Target market:** Israeli non-bank credit institutions (ISA-regulated)
- **Regulatory framework:** ISA circulars, TASE requirements, Israeli Companies Law
- **Key differentiator:** Hebrew-first, ISA-specific compliance engine, board governance module
- **Modules map to ISA regulatory requirements:** cyber governance, operational risk, credit risk, BCP, board oversight, KRI monitoring, vendor/outsourcing management
- **RMSAAS/ folder:** Contains earlier version specs, architecture docs, and regulatory reference documents
