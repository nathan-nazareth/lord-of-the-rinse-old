# Repository Guidelines

## Project Overview

Organic soap builder — a React SPA where customers configure custom soaps (shape, color, scent, weight) and submit orders via webhook. Built with TypeScript 5.8, React 19, Vite 6, Tailwind CSS 4, Zustand, and react-router-dom 7.

## Project Structure

```text
├── src/
│   ├── components/    # React UI components (SoapForm, Cart, CartPage, CheckoutPage, etc.)
│   ├── hooks/         # Custom hooks (useCart, useFormPersistence, useSoapPricing)
│   ├── services/      # Business logic (cart.ts, webhook.ts)
│   ├── stores/        # Zustand stores (useRateLimitStore)
│   ├── types/         # Shared TypeScript interfaces (cart.ts, webhook.ts)
│   ├── utils/         # Pure helpers (pricing.ts, validators.ts, errorLogging.ts)
│   └── test-utils/    # Test factories and helpers
├── components/        # Shared layout components (Header)
├── specs/             # Feature specs and plans
├── App.tsx            # Root component with routing
├── index.tsx          # Entry point
└── server/            # Backend server (Node.js)
```

## Build, Test, and Development Commands

| Command | Description |
|---|---|
| `bun install` | Install dependencies |
| `bun run dev` | Start Vite dev server |
| `bun run build` | Production build via Vite |
| `bun run preview` | Preview production build |
| `bun run test` | Run unit tests with Vitest (single run) |
| `bun run test:watch` | Run Vitest in watch mode |
| `bun run test:e2e` | Run Playwright end-to-end tests |
| `bun run lint` | Lint with Biome |

## Coding Style and Naming Conventions

- **Language:** TypeScript (strict mode, ES2022 target, bundler module resolution).
- **Linting:** Biome with `recommended` rules. Run `bun run lint` before committing.
- **Styling:** Tailwind CSS 4 with `@tailwindcss/postcss`. No CSS modules.
- **Path aliases:** `@/*` maps to the project root (configured in `tsconfig.json` and `vitest.config.ts`).
- **Components:** PascalCase `.tsx` files (e.g., `CartPage.tsx`).
- **Hooks:** `use` prefix, camelCase (e.g., `useCart.ts`).
- **Utilities/Services:** camelCase `.ts` files (e.g., `pricing.ts`, `webhook.ts`).
- **Types:** Shared interfaces in `src/types/`, named exports only.

## Testing Guidelines

- **Unit tests:** Vitest with `happy-dom` environment. Globals enabled (`describe`, `it`, `expect` available without imports).
- **Test location:** Co-located next to source files using `*.test.ts` / `*.test.tsx` naming (e.g., `pricing.test.ts` next to `pricing.ts`).
- **E2E tests:** Playwright, configured in `playwright.config.ts`. Run with `bun run test:e2e`.
- **Test factories:** Shared helpers in `src/test-utils/`.

## Commit and Pull Request Guidelines

- Use **Conventional Commits**: `feat:`, `test:`, `fix:`, `chore:`, `docs:` prefixes followed by a lowercase imperative description.
- Example: `feat: replace useFormRateLimit hook with useRateLimitStore Zustand store`.
- Reference issue numbers in parentheses when applicable: `test: add localStorage mock and cart item factory (#19)`.
- Keep commits focused and atomic — one logical change per commit.

<!-- SPECKIT START -->
[Plan: Admin Catalog Management](./specs/002-admin-catalog-management/plan.md)
[Data Model: Admin Catalog](./specs/002-admin-catalog-management/data-model.md)
[API Contracts: Admin](./specs/002-admin-catalog-management/contracts/admin-api.md)
<!-- SPECKIT END -->
