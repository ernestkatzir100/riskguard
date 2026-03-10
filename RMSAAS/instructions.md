# RiskGuard — Claude Code Instructions

## Product
RiskGuard is a SaaS risk management platform for Israeli non-bank credit institutions (~100 companies). Hebrew-first, RTL, regulatory compliance.

## Stack
- **Framework:** Next.js 15 (App Router, Server Components)
- **Language:** TypeScript 5.x (strict mode)
- **Styling:** Tailwind CSS 4 with RTL logical properties (ps-, pe-, ms-, me-)
- **Components:** shadcn/ui (accessible, RTL-compatible)
- **Database:** PostgreSQL 15 via Supabase (Row-Level Security)
- **ORM:** Drizzle ORM (SQL-like, TypeScript-first)
- **Auth:** Supabase Auth (magic link + MFA)
- **Storage:** Supabase Storage (S3-backed)
- **Fonts:** Rubik (headings, 700-800), Assistant (body, 400-600)
- **Deployment:** Vercel + Supabase

## Architecture Rules

### Hebrew-First (RTL)
- All UI text in Hebrew by default
- Use Tailwind logical properties: `ps-4` not `pl-4`, `me-2` not `mr-2`
- `dir="rtl"` on root layout
- Never use physical CSS properties (left, right, padding-left, margin-right)
- Font stack: `font-rubik` for headings, `font-assistant` for body

### Multi-Tenancy
- Every tenant-scoped table has `tenant_id` column
- RLS policies enforce tenant isolation at database level
- Application middleware injects `tenant_id` from JWT
- Never query without tenant_id filter

### Regulatory Traceability
Every entity must carry the traceability tuple:
```
(regulation_code, section_ref, req_code)
```
Example: `('2024-10-2', '2(א)', 'GOV-01')`
This is the product's core moat — complete linkage from regulation → feature → evidence.

### File Organization
```
src/
  app/[locale]/(dashboard)/   # Routes
  modules/[module-name]/      # Self-contained modules
    components/               # Module components
    schemas.ts                # Zod schemas
    types.ts                  # TypeScript types
    actions.ts                # Server Actions
  shared/                     # Shared code
  db/schema/                  # Drizzle schema
  i18n/messages/he/           # Hebrew translations (PRIMARY)
```

### Module Pattern
Each module follows this structure:
1. Drizzle schema in `db/schema/[module].ts`
2. Zod validation schemas in `modules/[module]/schemas.ts`
3. Server Actions in `modules/[module]/actions.ts` with audit logging
4. React components with RTL-first Tailwind
5. Hebrew translations as PRIMARY language

### Server Actions Pattern
```typescript
'use server'
import { getCurrentUser } from '@/shared/lib/auth';
import { logAction } from '@/shared/lib/audit';

export async function createRisk(input: CreateRiskInput) {
  const user = await getCurrentUser();
  const validated = createRiskSchema.parse(input);
  
  const [risk] = await db.insert(risks).values({
    ...validated,
    tenant_id: user.tenant_id,
  }).returning();

  await logAction({
    action: 'risk.created',
    entity_type: 'risk',
    entity_id: risk.id,
    user_id: user.id,
    tenant_id: user.tenant_id,
  });

  return risk;
}
```

### Audit Logging
Every CREATE, UPDATE, DELETE action must be logged to `audit_log` table.
Format: `{entity_type}.{action}` — e.g., `risk.created`, `document.approved`

## Design System: "Midnight Authority"

### Colors
```
Sidebar:       #0F172A (navy dark)
Accent:        linear-gradient(135deg, #4A8EC2, #7C6FD0)
Teal accent:   #5BB8C9
Success:       #27AE60 / bg: #EAFAF1
Warning:       #D4A017 / bg: #FFF8E1
Danger:        #C0392B / bg: #FDEDEC
Surface:       #FFFFFF
Border:        #E2E8F0
Text:          #1E293B
Text secondary: #64748B
Text muted:    #94A3B8
```

### Typography
- Headings: Rubik, weight 700-800, sizes 14-20px
- Body: Assistant, weight 400-600, sizes 11-14px
- Labels: Rubik, weight 600, size 10-11px

### Components
- Border radius: 10-14px
- Cards: white bg, 1px border #E2E8F0, shadow subtle
- Buttons: gradient accent for primary, white with border for secondary
- Forms: 12px padding, 10px border-radius, Assistant font

## Regulations
Two active regulations:
1. **חוזר 2024-10-2** — Credit risk management (ניהול סיכונים)
2. **חוזר 2022-10-9** — Cyber risk management (סיכוני סייבר)

## Naming Conventions
- Files: kebab-case (`risk-register.tsx`)
- Components: PascalCase (`RiskRegister`)
- Functions: camelCase (`createRisk`)
- DB tables: snake_case (`risk_controls`)
- Types: PascalCase with suffix (`CreateRiskInput`)
- Zod schemas: camelCase with suffix (`createRiskSchema`)
- Commit messages: conventional commits linking to req code (`feat(GOV-03): add board report generation`)

## Critical Constraints
1. Never use physical CSS properties — always logical (RTL)
2. Never query DB without tenant_id filter
3. Always add audit_log entry for mutations
4. Always validate with Zod before DB operations
5. Always include traceability tuple on regulatory entities
6. Hebrew text is PRIMARY — English is secondary
7. Every document must carry company logo when exported
