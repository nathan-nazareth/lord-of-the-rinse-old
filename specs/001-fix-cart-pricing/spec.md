# Feature Specification: Fix Cart Pricing Bug

**Feature Branch**: `001-fix-cart-pricing`

**Created**: 2026-05-26

**Status**: Draft

**Input**: User description: "When i add a soap to cart, i see Rs. 0 -- Checkout. but it is not 0. No matter how many soaps i order it comes as 0 rupees. even when i click that button it is saying: Back to cart Checkout 85 soaps in your order 100 10 · 100g × 85 USD 0.00 Subtotal USD 0 Discount (15%) - USD 0 Total USD 0 Your Name Enter your full name Email Address Enter your email Phone Number Enter your phone number Submit Order — USD 0 also it is not usd it is Indian rupees"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cart displays correct pricing (Priority: P1)

A customer adds soaps to their cart and sees accurate pricing in the cart summary and checkout button.

**Why this priority**: This is a critical functional bug - customers cannot trust their order total, which directly impacts conversion and business trust.

**Independent Test**: Can be tested by adding a soap to cart and verifying the cart displays correct price calculations (subtotal, discount, total).

**Acceptance Scenarios**:

1. **Given** the customer has added a single soap (100g, lavender) to cart, **When** they view the cart, **Then** the cart should display: Subtotal Rs. 110, no discount, Total Rs. 110, and Checkout button shows "Rs. 110 — Checkout"

2. **Given** the customer has added 3 soaps (each Rs. 100) to cart, **When** they view the cart, **Then** the cart should display: Subtotal Rs. 300, 10% discount (Rs. 30), Total Rs. 270, and Checkout button shows "Rs. 270 — Checkout"

3. **Given** the customer has added 5 soaps to cart, **When** they view the cart, **Then** the cart should apply 15% bulk discount correctly

---

### User Story 2 - Currency displays correctly as Indian Rupees (Priority: P1)

The application displays prices in Indian Rupees (Rs.) throughout the cart and checkout flow.

**Why this priority**: The user explicitly reported the currency showing as "USD" instead of "Rs." - this is a localization bug that causes customer confusion and distrust.

**Independent Test**: Can be verified by loading the cart page and checking that all price labels use "Rs." prefix not "USD".

**Acceptance Scenarios**:

1. **Given** the customer has added items to cart, **When** they view the cart or checkout page, **Then** all monetary values are prefixed with "Rs." (e.g., "Rs. 100", "Rs. 270")

2. **Given** the admin has configured currency setting, **When** the customer views the cart, **Then** the currency setting is correctly applied

---

### User Story 3 - Cart persists and calculates correctly across page reloads (Priority: P2)

Cart totals remain correct after page navigation and browser refresh.

**Why this priority**: Customers may add items, navigate away, and return to checkout later - pricing must remain accurate.

**Independent Test**: Add items to cart, refresh the page, verify cart shows same totals.

**Acceptance Scenarios**:

1. **Given** the customer has added 2 soaps (Rs. 100 each) to cart, **When** they refresh the page, **Then** cart displays Subtotal Rs. 200, discount Rs. 20, Total Rs. 180

2. **Given** the customer has added 4 soaps, **When** they refresh, **Then** the 15% discount (for 4+ items) is correctly applied

---

### Edge Cases

- What happens when cart is empty and customer navigates to checkout?
- What happens when catalog API is slow or unavailable - does cart fallback pricing work?
- What happens with legacy cart data from before the bug was introduced?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST calculate cart subtotal as sum of (item price × item quantity) for all cart items
- **FR-002**: System MUST apply volume discounts correctly: 10% off for 2-3 items, 15% off for 4+ items
- **FR-003**: System MUST display all prices with correct currency symbol (Rs. for Indian Rupees, not USD)
- **FR-004**: System MUST persist cart state in localStorage with correct price values
- **FR-005**: System MUST retrieve and display cart totals correctly after page reload
- **FR-006**: System MUST not show "Rs. 0" or "USD 0" when items with non-zero prices are in cart
- **FR-007**: System MUST use catalog settings currency when available, defaulting to "Rs." when not set

### Key Entities *(include if feature involves data)*

- **CartItem**: Represents a soap in the cart with price, quantity, shape, scent, color, size attributes. Price must be stored as a finite non-negative number.
- **Cart**: Collection of CartItems with a totalQuantity computed field
- **CatalogSettings**: Contains currency preference (should be "Rs." for this deployment)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Adding a single soap priced at Rs. 110 to cart shows "Rs. 110" in cart subtotal and checkout button
- **SC-002**: Adding 3 soaps (Rs. 300 total) shows Rs. 270 in cart total after 10% discount
- **SC-003**: Adding 5 soaps shows Rs. 425 in cart total after 15% discount (Rs. 500 - Rs. 75)
- **SC-004**: All currency displays show "Rs." prefix, never "USD"
- **SC-005**: Refreshing the page preserves correct cart totals (not reset to Rs. 0)

## Assumptions

- The catalog API returns correct pricing data in Indian Rupees
- The SOAP_OPTIONS hardcoded prices (Rs. 100-110) represent actual product pricing in INR
- The discount tiers are: 2-3 items = 10% off, 4+ items = 15% off
- This is an Indian market application where "Rs." (Indian Rupees) is the correct currency