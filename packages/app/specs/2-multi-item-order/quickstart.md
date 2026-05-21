# Quickstart: Multi-Item Order Cart

This guide helps developers set up and test the multi-item cart feature.

## Prerequisites

- Node.js 18+ or Bun 1.0+
- Git
- Access to modify project files

## Setup

### 1. Install Dependencies

```bash
bun install
# or
npm install
```

### 2. Start Development Server

```bash
bun run dev
# or
npm run dev
```

The app will be available at `http://localhost:3000`

## Testing

### Manual Testing

#### Adding Items to Cart

1. Open the app in a browser
2. Complete form steps for first item:
   - Select a scent (e.g., Lavender)
   - Select a color (e.g., Red)
   - Enter quantity (e.g., 5)
3. Click "Add to Cart"
4. Verify:
   - Toast notification appears ("Added to cart")
   - Cart badge shows count (1)
   - Form resets for next item
5. Add a second item:
   - Select different scent (e.g., Cinnamon)
   - Select different color (e.g., White)
   - Enter quantity (e.g., 2)
6. Click "Add to Cart"
7. Verify cart now shows 2 items total (7 soaps)

#### Viewing Cart

1. Click cart icon/button to expand cart
2. Verify:
   - All added items are displayed
   - Each item shows scent, color, quantity
   - Remove button is visible on each item
   - Total item count is shown
3. Test removing an item:
   - Click remove button
   - If 3+ items, confirm removal
   - Item disappears from cart
   - Total count updates

#### Checkout with Multiple Items

1. Ensure at least 2 items in cart
2. Click "Proceed to Checkout"
3. Verify checkout form appears with:
   - Name field
   - Email field
   - Phone field
4. Fill in contact information
5. Click "Complete Order"
6. Verify:
   - Webhook is sent with all items
   - Success message appears
   - Cart is cleared

#### Cart Persistence

1. Add items to cart
2. Refresh the page
3. Verify:
   - Cart items are still present
   - Total count is accurate
4. Wait 30+ days (or clear localStorage manually)
5. Reload page
6. Verify:
   - Cart is empty (expired)

## Architecture

```
src/
├── types/
│   ├── cart.ts              # CartItem, Cart interfaces
│   └── webhook.ts           # Updated webhook types
├── services/
│   ├── cart.ts              # localStorage cart operations
│   └── webhook.ts           # Updated webhook submission
├── hooks/
│   └── useCart.ts           # Cart state management
└── components/
    ├── SoapForm.tsx         # Updated with Add to Cart
    ├── Cart.tsx             # Cart sidebar component
    └── CartItem.tsx         # Individual item display
```

## Key Files

| File | Purpose |
|------|---------|
| `src/types/cart.ts` | Cart and CartItem type definitions |
| `src/services/cart.ts` | localStorage save/load operations |
| `src/hooks/useCart.ts` | React hook for cart state |
| `src/components/Cart.tsx` | Cart sidebar UI |
| `src/components/SoapForm.tsx` | Updated form with Add to Cart |

## Configuration

No additional configuration required. Cart uses localStorage automatically.

## Testing Checklist

- [ ] Can add single item to cart
- [ ] Can add multiple different items
- [ ] Cart shows accurate item count
- [ ] Cart items persist after refresh
- [ ] Can remove individual items
- [ ] Cart clears after checkout
- [ ] Webhook receives all items in single payload
- [ ] Checkout form validates all fields
- [ ] Cart expires after 30 days
- [ ] Mobile responsive cart display

## Troubleshooting

### Cart Not Persisting

1. Check browser localStorage is enabled
2. Check browser console for errors
3. Verify no ad blocker interfering
4. Check localStorage key: `organic-soap-cart`

### Items Not Adding

1. Verify form is valid (all fields filled)
2. Check browser console for errors
3. Verify cart limit not exceeded (20 items)

### Webhook Not Sending Multiple Items

1. Check browser network tab for webhook request
2. Verify payload contains all items
3. Check console for webhook errors
4. Verify Pabbly endpoint is correct

## Deployment

### Build

```bash
bun run build
# or
npm run build
```

### Production Notes

- Cart data is client-side only
- No server-side changes required
- localStorage works in production
- Test cart persistence in production build
