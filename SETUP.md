# RiskGuard — Setup Guide

## Prerequisites
- Node.js 20+
- npm or pnpm
- Docker (for Supabase local)
- Git

---

## Step 1: Create Next.js Project

```bash
npx create-next-app@latest riskguard --typescript --tailwind --eslint --app --src-dir
cd riskguard
```

## Step 2: Install Dependencies

```bash
# Core
npm install @supabase/supabase-js @supabase/ssr drizzle-orm postgres zod

# UI
npm install lucide-react class-variance-authority clsx tailwind-merge recharts
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-popover
npm install @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-tooltip
npm install @radix-ui/react-checkbox @radix-ui/react-switch @radix-ui/react-progress

# i18n + dates + email
npm install next-intl date-fns date-fns-tz resend

# Dev
npm install -D drizzle-kit tsx supabase @playwright/test vitest
```

## Step 3: Initialize Supabase Local

```bash
npx supabase init
npx supabase start
```

This gives you local Postgres + Auth + Storage. Copy the output keys to `.env.local`.

## Step 4: Configure Environment

```bash
cp .env.example .env.local
# Fill in values from `supabase start` output
```

## Step 5: Setup Database

```bash
# Copy schema files
cp infra/db/schema.ts src/db/schema/index.ts

# Create drizzle config
# (see drizzle.config.ts below)

# Push schema to local DB
npx drizzle-kit push

# Apply RLS policies
npx supabase db execute < infra/db/rls-policies.sql

# Seed demo data
npx supabase db execute < infra/db/seed.sql
```

## Step 6: Project Structure

Create the directory structure:

```bash
mkdir -p src/app/\[locale\]/\(auth\)
mkdir -p src/app/\[locale\]/\(dashboard\)/{risk-governance,operational-risk,outsourcing,bcp,cyber,documents,regulation,tasks,settings}
mkdir -p src/modules/{risk-governance,operational-risk,outsourcing,bcp,cyber-governance,cyber-protection,cyber-incidents}/{components,hooks}
mkdir -p src/shared/{components,hooks,lib,types}
mkdir -p src/db/{schema,migrations,seed}
mkdir -p src/i18n/messages/{he,en}
mkdir -p .claude
```

## Step 7: Copy Infrastructure Files

```
infra/db/schema.ts         → src/db/schema/index.ts
infra/db/rls-policies.sql  → supabase/migrations/001_rls.sql
infra/db/seed.sql          → supabase/seed.sql
infra/.claude/instructions.md → .claude/instructions.md
infra/.env.example         → .env.example
```

## Step 8: Configure Drizzle

Create `drizzle.config.ts` in project root:

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## Step 9: Configure Tailwind for RTL + Hebrew

In `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        rubik: ['Rubik', 'sans-serif'],
        assistant: ['Assistant', 'sans-serif'],
      },
      colors: {
        navy: '#0F172A',
        accent: '#4A8EC2',
        'accent-purple': '#7C6FD0',
        'accent-teal': '#5BB8C9',
      },
    },
  },
} satisfies Config;
```

## Step 10: Root Layout (RTL + Hebrew)

In `src/app/[locale]/layout.tsx`:

```typescript
import { Rubik, Assistant } from 'next/font/google';

const rubik = Rubik({ subsets: ['hebrew', 'latin'], variable: '--font-rubik' });
const assistant = Assistant({ subsets: ['hebrew', 'latin'], variable: '--font-assistant' });

export default function RootLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  return (
    <html lang={params.locale} dir={params.locale === 'he' ? 'rtl' : 'ltr'}>
      <body className={`${rubik.variable} ${assistant.variable} font-assistant antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

## Step 11: Verify

```bash
npm run dev
# Open http://localhost:3000
# Verify RTL layout, Hebrew fonts, DB connection
```

---

## Development Order (Recommended)

Based on demo screens and regulatory priority:

| Phase | Module | Priority | Why First |
|-------|--------|----------|-----------|
| 1 | Auth + Onboarding | P0 | Entry point, creates tenant |
| 2 | Dashboard | P0 | Shows compliance overview |
| 3 | Risk Register | P0 | Core product value |
| 4 | Regulation Navigator | P0 | Demonstrates traceability moat |
| 5 | Document Library | P0 | Templates = immediate value |
| 6 | Tasks Engine | P1 | Recurring compliance tasks |
| 7 | Board (ממשל תאגידי) | P1 | Governance workflow |
| 8 | Reports Generator | P1 | Board reports |
| 9 | Vendors / BCP / Cyber | P2 | Module expansion |
| 10 | KRI / Credit Risk | P2 | Pro tier features |

---

## Reset Demo Data

```bash
npx supabase db reset
# Drops all tables, re-runs migrations, re-runs seed.sql
```

## Deploy to Vercel

```bash
npx vercel link
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add SUPABASE_SERVICE_ROLE_KEY
npx vercel env add DATABASE_URL
npx vercel deploy
```
