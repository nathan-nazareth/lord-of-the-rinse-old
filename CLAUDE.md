# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Lord of the Rinse" is an organic custom soap builder — a React SPA where customers configure soaps (shape, scent, color, size, addons), add them to a cart, and submit orders via Web3Forms. Built with React 19 + TypeScript + Vite + Tailwind CSS 4.

## Commands

```bash
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run lint         # Biome lint (not ESLint)
npm test             # Run unit tests (vitest, single run)
npm run test:watch   # Unit tests in watch mode
npm run test:e2e     # Playwright e2e tests (expects server on port 5173)
```

Run a single test: `npx vitest run src/utils/pricing.test.ts`

Environment: copy `.env.example` to `.env.local` and set `VITE_WEB3FORMS_ACCESS_KEY`.

## Architecture

**Entry point**: `index.tsx` → wraps `App.tsx` in `BrowserRouter` + `ErrorBoundary` + `LoadingState`.

**Routing** (in `App.tsx`):
- `/` — Hero + SoapForm (home page)
- `/cart` — CartPage (lazy loaded)
- `/checkout` — CheckoutPage (lazy loaded, redirects to `/cart` if cart empty)
- `/confirmation` — ConfirmationPage (lazy loaded)

**Data flow**: `App.tsx` owns all state and orchestrates the flow. It passes cart + handlers down to page components. No global state library for cart — it's React state in `App.tsx` backed by `localStorage` via the `useCart` hook.

**Key layers**:
- `src/types/` — Type definitions (`cart.ts`, `webhook.ts`). Note: `types.ts` at root also exists with enums (SoapShape, SoapScent, SoapColor) used by the form.
- `src/services/cart.ts` — Cart CRUD + localStorage persistence (30-day expiry, max 20 items).
- `src/services/webhook.ts` — Web3Forms submission with retry logic (3 attempts, exponential backoff, 10s timeout).
- `src/hooks/useCart.ts` — Cart state management hook wrapping `services/cart.ts`.
- `src/hooks/useSoapPricing.ts` — Pricing logic hook.
- `src/hooks/useFormPersistence.ts` — Persists form state to localStorage.
- `src/stores/useRateLimitStore.ts` — Zustand store for form submission rate limiting (persisted to localStorage).
- `src/utils/pricing.ts` — Pure pricing functions (discount tiers: 10% for 2+ items, 15% for 4+ items).
- `src/utils/validators.ts` — Form validation.
- `src/utils/errorLogging.ts` — Error logging utilities.

**Styling**: Tailwind CSS 4 with a custom apothecary/botanical theme. Custom color palette: `parchment`, `terra`, `botanical`, `ink`, `dusty`, `sage`. Fonts: Cormorant Garamond (display), Instrument Sans (body), DM Mono (accent). Custom CSS classes defined in `index.css` (e.g., `card-apothecary`, `botanical-divider`).

## Testing

- **Unit tests**: Vitest with `happy-dom` environment, globals enabled. Tests colocated as `*.test.ts(x)` alongside source files, except in `tests/` which is for e2e only. Test utilities in `src/test-utils/` (`cart-item-factory.ts`, `mock-local-storage.ts`).
- **E2E tests**: Playwright in `tests/` directory. Runs against port 5173 (Vite default), configured in `playwright.config.ts`.

## Conventions

- Linting uses **Biome** (not ESLint) — config in `biome.json`.
- Package manager: npm (package-lock.json present; bun.lock also exists).
- Path alias: `@/` maps to project root.
- Vitest globals are enabled — no need to import `describe`, `it`, `expect`.
- PWA configured via `vite-plugin-pwa`.
- The project uses `@libsql/client` (listed as dependency, for potential backend use).
