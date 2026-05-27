# Data Model: Fix Cart Pricing Bug

## Overview

This feature is a frontend-only bug fix. No schema changes required. The existing data model is adequate.

## Entities

### CartItem

**Source**: `packages/app/src/types/cart.ts`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | string | UUID | Unique identifier |
| variantId | string | Format: `shape-scent-color-size` | Used for deduplication |
| shape | string | e.g., "Square", "Circle" | User selection |
| scent | string | e.g., "Lavender", "Coconut" | User selection |
| price | number | **Finite, non-negative** | **Bug fix: enforce at add time** |
| color | string | e.g., "White", "Blue" | User selection |
| quantity | number | **Positive integer** | Enforced at add/update |
| size | string | e.g., "100" | Grams |
| addedAt | string | ISO timestamp | For cart expiry |

### Cart

**Source**: `packages/app/src/types/cart.ts`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| items | CartItem[] | Max 20 items | MAX_CART_ITEMS limit |
| totalQuantity | number | Computed sum of quantities | Updated on add/remove/update |

## Price Validation Rules

**Bug Fix - Applied in `useCartStore.addItem`:**

```typescript
const cleanPrice = Number.isFinite(price) && price >= 0 ? price : 0;
```

**Before Fix**: Price could be stored as-is without validation
**After Fix**: Price is validated and defaults to 0 only if invalid (NaN, Infinity, or negative)

## Discount Calculation

**Source**: `packages/app/src/utils/pricing.ts`

| Quantity | Discount |
|----------|----------|
| 1 | 0% |
| 2-3 | 10% |
| 4+ | 15% |

## Currency

**Source**: `catalog.settings.currency` or fallback

| Setting Value | Display |
|---------------|---------|
| "Rs." | Rs. (Indian Rupees) - **CORRECT** |
| "USD" | USD - **BUG - wrong market** |
| undefined/null | "Rs." (hardcoded fallback) |

**Bug Fix**: Ensure all components use consistent fallback "Rs." instead of mixed "Rs." and "USD".

## Relationships

- Cart aggregates CartItems
- CartItem.price comes from `useSoapPricing` (scent + size + lavender)
- CartItem.variantId used for display in webhook payload

## State Transitions

| Action | State Change |
|--------|--------------|
| Add item | Append to items[], recalculate totalQuantity |
| Remove item | Filter from items[], recalculate totalQuantity |
| Update quantity | Map items[], recalculate totalQuantity |
| Clear cart | Reset items[] to [], totalQuantity to 0 |

## Persistence

**Storage**: localStorage via Zustand persist middleware

**Key**: `organic-soap-cart`

**Expiry**: 30 days ( CART_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000)

**Legacy Detection**: `detectAndClearLegacyCart()` removes old format carts without variantId/size