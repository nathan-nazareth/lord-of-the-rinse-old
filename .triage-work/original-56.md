## Dependencies (Updated)

**This PRD is blocked by the following work:**
- Monorepo restructuring (#52–#55) — must be completed first
- Layout Shell (#40–#43) — admin dashboard should use the Shell
- TanStack Query (#28–#31)
- Error Boundary + useLogger (#48–#51)
- shadcn/ui (#36–#39)

Command Bar work (#44–#47) is currently paused.

---

## Problem Statement

"Lord of the Rinse" is a handcrafted soap storefront that currently runs entirely client-side: product options are hardcoded enums, cart state lives in localStorage, and orders are submitted through Web3Forms with no server-side persistence. There is no admin interface, no inventory management, no order tracking, and no way to change products or pricing without editing source code. If Web3Forms goes down, orders are lost. The shop owner cannot see orders, manage stock, adjust discounts, or control what customers see without a code deploy.

## Solution

Restructure the project into a Bun monorepo with three workspaces: a Vite React storefront (`apps/web`), a Hono API server (`apps/api`), and shared Zod contracts (`packages/shared`). Introduce Postgres via Drizzle as the durable data layer for catalog, orders, inventory, and settings. Add an admin dashboard at `/admin` in the same React app, protected by Better Auth with a first-user-only signup flow. Orders become the source of truth in Postgres (with readable references like `LOR-20260520-0001`), while Web3Forms becomes a notification channel. Inventory is tracked per Soap Variant (the sellable SKU), with stock allocation and made-to-order production demand tracked separately. Commerce settings (shop open/closed, currency, discount tiers, contact info) are admin-editable.
