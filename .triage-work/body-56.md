## Parent

None - this is the PRD tracking issue.

## Child issues

- #59 - Configure Better Auth with first-user-only signup
- #60 - Admin login page, session management, route protection
- #61 - Admin shell layout and commerce settings
- #62 - Catalog attributes admin CRUD
- #63 - Soap variants admin CRUD
- #64 - Stock management and inventory ledger
- #65 - Public catalog API endpoint
- #66 - Catalog-driven storefront variant selector
- #67 - Cart refactor and checkout API
- #68 - Admin orders list, detail, status management
- #69 - Web3Forms notification service with retry
- #70 - Order cancellation with stock restock
- #71 - Production queue view
- #73 - E2E and admin UI tests

## Blocked by

- #36 - shadcn/ui parent (#37–#38 closed; verify codebase before proceeding)
- #40 - Layout shell parent (#42–#43 open)
- #42 - Shell component (admin layout prerequisite)
- #52 - Monorepo parent (#53–#55 largely done; verify #52/#54 and close if satisfied)
- #57 - Hono API scaffold (closed — **triage found no `packages/api` in repo; grooming may need to reopen**)
- #58 - Drizzle schemas (closed — **no drizzle in repo; grooming may need to reopen**)

TanStack Query (#28–#30) and Error Boundary (#48–#51) appear complete — verify and close.

Command Bar (#44–#47) is paused.

---

## Problem Statement

"Lord of the Rinse" is a handcrafted soap storefront that currently runs entirely client-side: product options are hardcoded enums, cart state lives in localStorage, and orders are submitted through Web3Forms with no server-side persistence. There is no admin interface, no inventory management, no order tracking, and no way to change products or pricing without editing source code. If Web3Forms goes down, orders are lost. The shop owner cannot see orders, manage stock, adjust discounts, or control what customers see without a code deploy.

## Solution

Restructure the project into a Bun monorepo with three workspaces: a Vite React storefront (`apps/web`), a Hono API server (`apps/api`), and shared Zod contracts (`packages/shared`). Introduce Postgres via Drizzle as the durable data layer for catalog, orders, inventory, and settings. Add an admin dashboard at `/admin` in the same React app, protected by Better Auth with a first-user-only signup flow. Orders become the source of truth in Postgres (with readable references like `LOR-20260520-0001`), while Web3Forms becomes a notification channel. Inventory is tracked per Soap Variant (the sellable SKU), with stock allocation and made-to-order production demand tracked separately. Commerce settings (shop open/closed, currency, discount tiers, contact info) are admin-editable.
