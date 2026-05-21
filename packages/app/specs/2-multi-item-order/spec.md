# Feature Specification: Multi-Item Order Cart

**Feature Branch**: `2-multi-item-order`
**Created**: 2026-01-03
**Status**: Draft
**Input**: Allow users to add multiple soap items to a cart and checkout once with single contact info entry

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Multiple Items to Cart (Priority: P1)

As a customer who wants to order multiple different soap combinations, I want to add each combination (scent, color, quantity) to a cart, so that I can order 5 red lavender soaps and 2 white cinnamon soaps in a single transaction.

**Why this priority**: This is the core new functionality - cart system

**Independent Test**: Can add multiple items with different customizations and see them in a cart summary

**Acceptance Scenarios**:

1. **Given** a customer has selected scent, color, and quantity, **When** they click "Add to Cart", **Then** the item is saved to their cart and the form resets for the next item.

2. **Given** a customer has items in their cart, **When** they view the cart, **Then** they see all items with their details (scent, color, quantity) and can see the total item count.

3. **Given** a customer has added multiple items, **When** they review the cart, **Then** they can remove items they no longer want.

4. **Given** a customer changes their mind about an item's customization, **When** they remove and re-add it, **Then** the updated customization is reflected.

---

### User Story 2 - Single Checkout with Multiple Items (Priority: P1)

As a customer with multiple items in my cart, I want to enter my contact information once and submit all items together, so that I don't have to re-enter my details for each soap type.

**Why this priority**: Essential for the multi-item ordering workflow

**Independent Test**: Can complete checkout with cart items and contact info, receiving order confirmation for all items

**Acceptance Scenarios**:

1. **Given** a customer has at least one item in their cart, **When** they click "Proceed to Checkout", **Then** they see a checkout form with contact fields (name, email, phone).

2. **Given** a customer has items in cart and fills in contact info, **When** they submit the order, **Then** all items are sent to the webhook in a single payload with a single customer object.

3. **Given** a customer submits an order with multiple items, **When** the webhook succeeds, **Then** they receive confirmation showing all items ordered.

---

### User Story 3 - Cart Persistence (Priority: P2)

As a customer who is building my order, I want my cart to persist if I navigate away or refresh, so that I don't lose my selections.

**Why this priority**: Improves user experience and reduces frustration

**Independent Test**: Cart items remain after page refresh

**Acceptance Scenarios**:

1. **Given** a customer has added items to their cart, **When** they refresh the page, **Then** the cart items are still present.

2. **Given** a customer has added items to their cart, **When** they close and reopen the browser, **Then** the cart items persist (for reasonable time period).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow customers to add soap items (scent, color, quantity) to a cart.

- **FR-002**: The cart MUST display all added items with their details (scent, color, quantity).

- **FR-003**: Customers MUST be able to remove items from the cart.

- **FR-004**: The cart MUST persist across page refreshes using localStorage.

- **FR-005**: Checkout form MUST appear after adding at least one item, with contact fields (name, email, phone).

- **FR-006**: The webhook payload MUST include all cart items in the items array when submitting.

- **FR-007**: The webhook payload MUST include a single customer object with name, email, and phone.

- **FR-008**: Form validation MUST ensure at least one item exists before checkout.

- **FR-009**: The order total (sum of all item quantities) MUST be displayed.

### Key Entities

- **CartItem**: Represents a soap item in the cart
  - id: Unique identifier (UUID)
  - scent: Selected scent option
  - customScent: Custom scent description (if applicable)
  - color: Selected color
  - quantity: Number of units
  - addedAt: Timestamp when added to cart

- **Cart**: Collection of CartItems
  - items: Array of CartItem
  - totalQuantity: Sum of all item quantities
  - updatedAt: Last modification timestamp

- **Order**: Complete order with customer and items
  - customer: Customer contact information
  - items: Array of all ordered products
  - submittedAt: Timestamp of order submission

- **Customer**: Customer contact information
  - name: Customer's full name
  - email: Email address
  - phone: Phone number

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Customers can add 5+ different items to cart within 2 minutes.

- **SC-002**: Cart persists after page refresh in 100% of cases.

- **SC-003**: Webhook receives single payload with all items (no duplicate submissions).

- **SC-004**: Users can complete multi-item checkout within 5 minutes including contact entry.

- **SC-005**: Cart summary shows accurate item count and allows item removal.
