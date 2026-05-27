# Quickstart: Fix Cart Pricing Bug

## Bug Summary

Cart displays "Rs. 0" for all items regardless of actual prices, and shows "USD" instead of "Rs." for currency.

## Root Causes

1. **Price 0 from useVariantPrice**: When variant lookup fails, returns `unitPrice: 0`
2. **Inconsistent currency defaults**: Cart.tsx defaults to 'USD', CartPage.tsx defaults to 'Rs. '

## Files to Modify

### 1. `packages/app/src/hooks/useSoapPricing.ts`

**Problem**: `useSoapPricing` relies on SOAP_OPTIONS which may not match selected variant

**Fix location**: Lines 46-52

```typescript
// BEFORE (bug):
const baseOption = SOAP_OPTIONS.find((o) => o.scent === scent);
let totalPrice = baseOption?.price ?? 100;  // Falls to 100 even if scent mismatched

// AFTER (fix):
// Ensure price is always calculated correctly based on actual selected attributes
```

### 2. `packages/app/src/stores/useCartStore.ts`

**Problem**: Price not validated when adding to cart

**Fix location**: `addItem` function, around line 40

```typescript
// BEFORE (bug):
const cleanPrice = Number.isFinite(price) && price >= 0 ? price : 0;

// AFTER: Ensure proper validation - currently line 40 already has this
// But need to ensure it's NOT being overwritten by 0 from upstream
```

### 3. `packages/app/src/components/Cart.tsx`

**Problem**: Default currency is 'USD'

**Fix location**: Line 208

```typescript
// BEFORE (bug):
const currency = catalog?.settings?.currency ?? 'USD';

// AFTER (fix):
const currency = catalog?.settings?.currency ?? 'Rs. ';
```

### 4. `packages/app/src/components/CartPage.tsx`

**Problem**: Default currency is 'Rs. ' (correct) but checkout shows 'USD'

**Fix location**: Lines 37, 80, 90, 97, 187

```typescript
// Line 37 (already correct):
const currency = catalog?.settings?.currency ?? 'Rs. ';

// Check other locations - they may reference a different source
```

### 5. `packages/app/src/components/CheckoutPage.tsx`

**Problem**: Default currency is 'USD'

**Fix location**: Line 21

```typescript
// BEFORE (bug):
const currency = catalog?.settings?.currency ?? 'USD';

// AFTER (fix):
const currency = catalog?.settings?.currency ?? 'Rs. ';
```

## Testing

```bash
# Run tests
bun run test

# Run specific tests
bun run test -- --filter useCartStore
bun run test -- --filter pricing

# Manual testing
1. Add soap to cart - verify price shows Rs. 110 (lavender) or Rs. 100 (other scents)
2. Add multiple soaps - verify discount applies
3. Refresh page - verify prices persist
4. Check all currency displays show "Rs." not "USD"
```

## Verification

After fix:
- ✅ Single soap (lavender): Cart shows "Rs. 110 — Checkout"
- ✅ 3 soaps: Subtotal Rs. 300, 10% off Rs. 30, Total Rs. 270
- ✅ 5 soaps: Subtotal Rs. 500, 15% off Rs. 75, Total Rs. 425
- ✅ All currency labels show "Rs." not "USD"
- ✅ Prices persist after page refresh