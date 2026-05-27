# Implementation Plan: Admin Catalog Management

**Branch**: `002-admin-catalog-management` | **Date**: 2026-05-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-admin-catalog-management/spec.md`

## Summary

Add an /admin section to the organic soap builder website enabling admin users to manage the product catalog: update prices, manage scent/color/shape options, configure size limits, and administer discounts. Authentication will integrate with the existing auth system.

## Technical Context

**Language/Version**: TypeScript 5.8

**Primary Dependencies**: React 19, TanStack Router 1.x, Zustand 5.x, Tailwind CSS 4

**Storage**: SQLite via @libsql/client (packages/db)

**Testing**: Vitest with happy-dom, Playwright for e2e

**Target Platform**: Web (desktop + mobile browsers)

**Project Type**: React SPA with API backend (monorepo)

**Performance Goals**: Admin UI responds within 200ms for interactions, catalog updates reflect within 5 seconds

**Constraints**: Must integrate with existing authentication system; must not break existing customer-facing flows

**Scale/Scope**: Single admin user at a time; catalog limited to dozens of products/options

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| User-Centered Ordering | PASS | Admin tool supplements customer ordering experience |
| Natural Product Authenticity | PASS | Admin UI will use same design language |
| Form Validation (NON-NEGOTIABLE) | PASS | Admin forms will validate inputs before submission |
| Cross-Platform Compatibility | PASS | Responsive admin interface for all devices |
| Graceful Degradation | PASS | Admin will have proper error handling and fallbacks |

## Project Structure

### Documentation (this feature)

```text
specs/002-admin-catalog-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (packages/app)

```text
packages/app/src/
├── routes/
│   ├── admin/
│   │   ├── _index.tsx         # Admin dashboard
│   │   ├── products.tsx       # Product management
│   │   ├── products.$id.tsx   # Edit specific product
│   │   ├── options.tsx        # Scents/colors/shapes management
│   │   └── discounts.tsx      # Discount management
│   ├── __root.tsx             # Root layout (already exists)
│   ├── index.tsx              # Home page (already exists)
│   ├── cart.tsx               # Cart page (already exists)
│   ├── checkout.tsx           # Checkout page (already exists)
│   └── confirmation.tsx       # Confirmation page (already exists)
├── components/
│   ├── admin/                 # Admin-specific components
│   │   ├── AdminLayout.tsx    # Admin wrapper with navigation
│   │   ├── ProductForm.tsx    # Product editing form
│   │   ├── OptionManager.tsx  # Scent/color/shape manager
│   │   └── DiscountForm.tsx   # Discount creation/edit form
│   ├── SoapForm.tsx           # Customer-facing (already exists)
│   └── Cart.tsx               # Cart component (already exists)
├── hooks/
│   ├── useCatalog.ts          # Catalog data fetching (exists)
│   └── useAdminCatalog.ts     # Admin catalog operations (new)
├── services/
│   └── webhook.ts             # Order webhook (exists)
├── stores/
│   └── useCartStore.ts        # Cart state (exists)
└── types/
    ├── catalog.ts             # Existing catalog types
    └── admin.ts               # Admin-specific types (new)
```

### Source Code (packages/api)

```text
packages/api/src/
├── routes/
│   ├── catalog.ts             # GET catalog (exists)
│   ├── admin.catalog.ts       # Admin catalog CRUD (new)
│   ├── admin.options.ts       # Admin options CRUD (new)
│   └── admin.discounts.ts     # Admin discounts CRUD (new)
└── middleware/
    └── auth.ts                # Auth middleware (existing)
```

### Source Code (packages/db)

```text
packages/db/src/
├── schema/
│   ├── products.ts            # Product table
│   ├── options.ts             # Scent/color/shape options
│   ├── discounts.ts           # Discounts table
│   └── audit_log.ts           # Change audit log
└── index.ts                   # DB connection
```

**Structure Decision**: Adding admin routes under packages/app/src/routes/admin/ and corresponding API routes. Admin UI is a new section separate from customer-facing flow but reuses existing components where possible.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Research Required

- Best practices for admin UI state management in React with TanStack Router
- Auth integration patterns for admin routes (existing auth middleware)
- SQLite schema design for catalog options (scents/colors/shapes as separate tables or single options table with type discriminator)