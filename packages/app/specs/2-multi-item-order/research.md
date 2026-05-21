# Research: Multi-Item Order Cart

## Decision: Cart State Management Approach

**Decision**: Use React Context with localStorage persistence

**Rationale**:
- Context API provides clean separation of cart logic from UI
- localStorage is universally supported and requires no server infrastructure
- Simple to implement without additional dependencies
- Matches existing code patterns (useState, useEffect)

**Alternatives Considered**:
- Redux: Overkill for single-feature cart, adds significant dependency weight
- React Query: Server-focused, not needed for client-only data
- Zustand: Additional dependency, Context is sufficient for this use case

---

## Decision: Cart Item Structure

**Decision**: Each CartItem has UUID, scent, customScent, color, quantity, addedAt

**Rationale**:
- UUID allows unique identification for removal operations
- addedAt enables sorting if needed later
- Consistent with existing OrderItem structure from webhook feature

**Structure**:
```typescript
interface CartItem {
  id: string;           // UUID v4
  scent: string;        // Lavender, Coffee, etc.
  customScent?: string; // Empty or custom description
  color: string;        // White, Red, etc.
  quantity: number;     // Positive integer
  addedAt: string;      // ISO 8601 timestamp
}
```

---

## Decision: localStorage Implementation

**Decision**: Sync cart state to localStorage on every change with 30-day expiry

**Rationale**:
- Prevents cart from growing stale indefinitely
- Simple to implement with Date.now() comparison
- 30 days is reasonable for purchase consideration window

**Implementation**:
```typescript
const CART_KEY = 'organic-soap-cart';
const CART_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function saveCart(cart: Cart): void {
  localStorage.setItem(CART_KEY, JSON.stringify({
    items: cart.items,
    updatedAt: Date.now()
  }));
}

function loadCart(): Cart | null {
  const data = localStorage.getItem(CART_KEY);
  if (!data) return null;
  
  const parsed = JSON.parse(data);
  if (Date.now() - parsed.updatedAt > CART_EXPIRY_MS) {
    localStorage.removeItem(CART_KEY);
    return null;
  }
  
  return { items: parsed.items, totalQuantity: calculateTotal(parsed.items) };
}
```

---

## Decision: Cart Limit

**Decision**: Maximum 20 items per cart

**Rationale**:
- Prevents accidental excessive orders
- 20 items is reasonable for personal/household use
- Still allows bulk orders (e.g., 20 soaps total)
- Prevents memory issues from extremely large carts

**Alternatives Considered**:
- No limit: Could lead to performance issues or accidental huge orders
- Quantity-based limit: Complicates UX, harder to communicate

---

## Decision: Cart UI Placement

**Decision**: Slide-out sidebar on desktop, bottom sheet on mobile

**Rationale**:
- Sidebar doesn't obscure form content
- Bottom sheet accessible on mobile (thumb zone)
- Follows e-commerce conventions (Amazon, Shopify)
- Collapsible to show only item count

**States**:
- **Collapsed**: Shows item count badge, expand button
- **Expanded**: Shows all items with remove buttons, checkout button
- **Empty**: Shows "Add items to your cart" message

---

## Decision: Add to Cart Flow

**Decision**: "Add to Cart" button replaces/changes existing submit behavior

**Rationale**:
- Existing "Draft Order in Email" button becomes "Add to Cart"
- After adding, form resets for next item selection
- Toast notification confirms item added
- User can continue adding or proceed to checkout

**Steps**:
1. User selects scent, color, quantity
2. Clicks "Add to Cart"
3. Form validates (existing validation)
4. Item saved to cart (with notification)
5. Form resets for next item
6. Cart count updates

---

## Decision: Webhook Payload for Multi-Item Orders

**Decision**: Same payload structure, items array now contains multiple items

**Rationale**:
- Pabbly webhook already expects items array
- Customer object structure unchanged
- Minimal changes to webhook service

**Payload**:
```json
{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1 (555) 000-0000"
  },
  "items": [
    {
      "id": "uuid-1",
      "scent": "Lavender",
      "customScent": "",
      "color": "Red",
      "quantity": 5
    },
    {
      "id": "uuid-2",
      "scent": "Cinnamon",
      "customScent": "",
      "color": "White",
      "quantity": 2
    }
  ]
}
```

---

## Decision: Cart Item Removal

**Decision**: Individual remove button per item with confirmation for 3+ items

**Rationale**:
- Prevents accidental removal of carefully selected items
- Confirmation dialog only appears when risk is higher
- Single-item removal is obvious and low-risk

**Implementation**:
- Remove button on each cart item
- If cart has 3+ items, show confirmation dialog
- If cart has 1-2 items, direct removal (fast)
- Animation shows item disappearing

---

## Technology Compatibility

| Aspect | Compatibility |
|--------|---------------|
| localStorage | All modern browsers (IE8+) |
| React Context | React 16.8+ (hooks) |
| UUID generation | crypto.randomUUID() (modern browsers) |
| Date.now() | All browsers |
