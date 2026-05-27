# Implementation Plan: Fix Cart Pricing Bug

**Branch**: `001-fix-cart-pricing` | **Date**: 2026-05-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-fix-cart-pricing/spec.md`

## Summary

Fix cart pricing bug where adding soaps to cart displays Rs. 0 and incorrect USD currency instead of proper Indian Rupee amounts. The bug causes cart totals to show zero regardless of items added, with currency labels showing "USD" instead of "Rs." The root causes are: (1) `useSoapPricing` returning 0 when variant lookup fails in `useVariantPrice`, and (2) inconsistent currency fallback defaults across components (Cart.tsx defaults to 'USD' while CartPage.tsx defaults to 'Rs.').

## Technical Context

**Language/Version**: TypeScript 5.8

**Primary Dependencies**: React 19, Zustand (state management), Vite 6 (bundler), Tailwind CSS 4

**Storage**: localStorage (cart persistence via Zustand persist middleware)

**Testing**: Vitest (unit tests), Playwright (e2e tests)

**Target Platform**: Web application - all modern browsers (Chrome, Firefox, Safari, Edge)

**Project Type**: React SPA with TypeScript

**Performance Goals**: Per constitution: FCP <1.5s on 3G, TTI <3s, form interactions <100ms

**Constraints**: Must maintain backward compatibility with existing cart localStorage schema

**Scale/Scope**: Small e-commerce application - 1 cart, checkout flow, admin panel

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Applicable Principles:**
- **I. User-Centered Ordering**: Cart pricing MUST be accurate and trustworthy. Bug violates this principle.
- **III. Form Validation (NON-NEGOTIABLE)**: Invalid states (zero price) MUST be prevented.
- **V. Graceful Degradation**: Fallback behavior when pricing data is unavailable must be defined.

**GATE Status**: ✅ PASS

All constitution gates are satisfied. The fix directly addresses accurate pricing display which is fundamental to user trust in the ordering process.

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-cart-pricing/
├── plan.md              # This file
├── research.md          # Phase 0 output (N/A - no unknowns)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no API contracts)
└── checklists/          # Quality checklists
```

### Source Code

```text
packages/app/src/
├── stores/
│   └── useCartStore.ts      # Cart state management
├── hooks/
│   └── useSoapPricing.ts    # Pricing calculations - PRIMARY FIX LOCATION
├── utils/
│   └── pricing.ts          # Discount calculations
├── components/
│   ├── SoapForm.tsx         # Add to cart (passes price to store)
│   ├── Cart.tsx             # Cart sidebar display - currency fix
│   ├── CartPage.tsx         # Cart page - currency fix
│   └── CheckoutPage.tsx     # Checkout page - currency fix
└── routes/
    └── index.tsx            # Main page with SoapForm

packages/app/types.ts        # SOAP_OPTIONS with hardcoded prices
```

**Structure Decision**: Frontend-only fix in `packages/app/src/`. No backend API changes required.

## Phase 0: Research

**Status**: N/A - No unknowns requiring research

The bug has clear, traceable root causes identified from code analysis:
1. `useVariantPrice` returns `unitPrice: 0` when no variant matched
2. `useSoapPricing` falls back to 100 when scent not in SOAP_OPTIONS
3. Currency defaults differ: Cart.tsx uses 'USD', CartPage.tsx uses 'Rs. '

## Phase 1: Design & Contracts

### Data Model

**CartItem Entity** (existing, from `packages/app/src/types/cart.ts`):
```typescript
interface CartItem {
  id: string;
  variantId: string;
  shape: string;
  scent: string;
  price: number;        // MUST be finite, non-negative
  color: string;
  quantity: number;     // MUST be positive integer
  size: string;
  addedAt: string;
}
```

**Changes Required**: None to data model. Price validation added in `useCartStore.addItem`.

### Pricing Flow

1. User selects soap options in SoapForm
2. `useSoapPricing` calculates price based on scent, size, lavender pieces
3. SoapForm calls `handleAddToCart(totalPrice, ...)`
4. `handleAddToCart` calls `useCartStore.addItem(..., price, ...)`
5. Cart store validates price is finite and non-negative
6. Cart displays show subtotal, discount, total using `calculateDiscount`

### Currency Configuration

- Default currency: "Rs." (Indian Rupees)
- Catalog settings override: `catalog.settings.currency`
- All cart/checkout components must use consistent fallback

### Contracts

No external API contracts required - this is a frontend-only bug fix.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations. This is a pure bug fix with no architectural changes.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |