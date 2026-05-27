# Implementation Plan: Admin Catalog Management

**Branch**: `main` | **Date**: 2026-05-27 | **Spec**: [spec.md](../specs/001-admin-catalog-management/spec.md)
**Input**: Feature specification from `specs/001-admin-catalog-management/spec.md`

## Summary

Build an admin panel within the existing SPA where the business can manage products (add/remove), configure pricing bounds and size ranges, and set discounts. The admin panel is password-protected (single hardcoded password: 3984) and the Dashboard tab logs out and redirects to the public homepage.

## Technical Context

**Language/Version**: TypeScript 5.8  
**Primary Dependencies**: React 19, Hono 4.7, Drizzle ORM, TanStack Query 5, TanStack Router 1.170, Zustand 5, Tailwind CSS 4, @tabler/icons-react  
**Storage**: NEEDS CLARIFICATION — User specified SQLite; existing project uses PostgreSQL with Drizzle ORM. Need to decide: migrate existing schema to SQLite (libSQL/client already in deps) or use PostgreSQL as-is.  
**Testing**: Vitest (unit), Playwright (e2e), Testing Library (component)  
**Target Platform**: Web (Vite SPA on :3000, Hono API on :3001)  
**Project Type**: Web application (monorepo: app/ + api/ + db/ + shared/)  
**Performance Goals**: Admin panel responses under 500ms, list loads under 2s  
**Constraints**: Must match existing app design system (Tailwind, shadcn, Tabler icons); admin routes already scaffolded at `/admin/`  
**Scale/Scope**: Single admin user managing small catalog (< 100 products)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. User-Centered Ordering | ✅ PASS | Admin panel is internal tool; doesn't affect customer flow |
| II. Natural Product Authenticity | ✅ PASS | Admin product descriptions will use same organic tone |
| III. Form Validation (NON-NEGOTIABLE) | ✅ PASS | Admin forms will include same validation rigor |
| IV. Cross-Platform Compatibility | ✅ PASS | Admin panel runs on same responsive framework |
| V. Graceful Degradation | ✅ PASS | Admin API errors will show clear fallback UX |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-admin-catalog-management/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
packages/
├── app/src/
│   ├── routes/admin/
│   │   ├── index.tsx                # Admin layout + Dashboard (already exists)
│   │   ├── products.tsx             # Product list (scaffolded)
│   │   ├── products.$id.tsx         # Product edit/create (scaffolded)
│   │   ├── options.tsx              # Options management (scaffolded)
│   │   └── discounts.tsx            # Discount management (scaffolded)
│   ├── components/admin/
│   │   ├── AdminLayout.tsx          # Layout with tab navigation (exists)
│   │   └── ProductForm.tsx          # Product form (exists)
│   ├── hooks/
│   │   └── useAdminCatalog.ts       # React Query hooks (exists)
│   ├── stores/
│   │   └── useAdminStore.ts         # Auth state (exists)
│   └── types/
│       └── admin.ts                 # Admin types (exists)
├── api/src/
│   └── routes/
│       ├── attributes.ts            # CRUD for attributes (exists)
│       ├── variants.ts              # CRUD for variants (exists)
│       └── settings.ts              # CRUD for settings (exists)
└── db/src/schema/
    └── admin-catalog.ts             # Admin schema tables (exists)
```

**Structure Decision**: Web application (Option 2). The admin panel lives within the existing `packages/app/` frontend with API routes in `packages/api/` and schema in `packages/db/`. No new packages needed — existing scaffold provides the skeleton that this feature will flesh out.

## Complexity Tracking

No constitution violations to justify.
