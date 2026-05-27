# Feature Specification: Admin Catalog Management

**Feature Branch**: `002-admin-catalog-management`

**Created**: 2026-05-27

**Status**: Draft

**Input**: User description: "make a /admin part to the website. it should let the user update the catalog. for example change the prices, add scents, colors, and shapes, update size limits, and change discounts."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Product Pricing (Priority: P1)

As an admin user, I want to update product prices so that I can adjust pricing based on costs, demand, or market conditions.

**Why this priority**: Pricing is a core business function that directly impacts revenue. Without the ability to update prices, the admin cannot effectively manage the business.

**Independent Test**: Can be fully tested by navigating to /admin, selecting a product, updating its price, and verifying the new price appears on the public storefront.

**Acceptance Scenarios**:

1. **Given** an admin is logged in, **When** they navigate to the product management section and update a product's price, **Then** the system saves the new price and displays it correctly on the storefront.
2. **Given** an admin updates a product price, **When** the price change is saved, **Then** existing cart items with the old price remain unchanged (price lock at time of add to cart).
3. **Given** an admin enters an invalid price (negative or non-numeric), **When** they attempt to save, **Then** the system displays a validation error and prevents the save.

---

### User Story 2 - Manage Product Options: Scents, Colors, Shapes (Priority: P1)

As an admin user, I want to add, edit, and remove product options (scents, colors, shapes) so that I can expand or consolidate the available customization choices.

**Why this priority**: Core catalog functionality — the product's customization options are fundamental to the customer experience and must be manageable without code changes.

**Independent Test**: Can be fully tested by adding a new scent option, verifying it appears in the product configuration UI, and confirming customers can select it during ordering.

**Acceptance Scenarios**:

1. **Given** an admin is in the catalog management section, **When** they add a new scent option with a name and optional description, **Then** the scent becomes available for selection in product configurations.
2. **Given** an admin edits an existing scent/color/shape, **When** they update the name or description and save, **Then** all products using that option reflect the updated information.
3. **Given** an admin removes a scent/color/shape option, **When** they confirm the deletion, **Then** the option is no longer available for new products but existing orders are unaffected.

---

### User Story 3 - Manage Size Limits (Priority: P2)

As an admin user, I want to update size limits (minimum/maximum weight or dimensions) so that I can enforce business rules around product customization.

**Why this priority**: Size limits prevent ordering of products that cannot be economically or physically produced, protecting the business from unfulfillable orders.

**Independent Test**: Can be fully tested by updating size constraints for a product and attempting to add a customization that exceeds the new limits.

**Acceptance Scenarios**:

1. **Given** an admin is editing a product, **When** they update the minimum or maximum weight limits and save, **Then** customers cannot configure the product outside the new bounds.
2. **Given** a customer has an in-progress cart with a weight that exceeds newly reduced limits, **When** they return to checkout, **Then** the system warns them and prevents checkout until the item is adjusted.

---

### User Story 4 - Manage Discounts (Priority: P2)

As an admin user, I want to create, modify, and delete discounts so that I can run promotions and manage pricing incentives.

**Why this priority**: Discounts are a key marketing tool for driving sales and customer acquisition. The admin must be able to manage them without technical assistance.

**Independent Test**: Can be fully tested by creating a discount code, applying it at checkout, and verifying the discount is correctly applied to the order total.

**Acceptance Scenarios**:

1. **Given** an admin creates a discount with a code, percentage/fixed amount, and validity period, **When** they save it, **Then** the discount code is active and can be applied at checkout.
2. **Given** a discount has expired or been deactivated, **When** a customer attempts to use it, **Then** the system rejects it with an appropriate message.
3. **Given** an admin sets a discount with usage limits (e.g., 100 uses maximum), **When** the limit is reached, **Then** the discount becomes inactive and cannot be used.

---

### Edge Cases

- What happens when an admin attempts to remove an option (scent/color/shape) that is currently in use by active orders? The system should prevent removal or archive the option instead.
- How does the system handle concurrent edits by multiple admins to the same product? Last-write-wins with an optional conflict warning.
- How does the system handle bulk updates to catalog items? Provide a bulk edit capability for efficiency.
- What happens when a discount is deleted that has been applied to existing orders? Existing order totals remain unchanged (historical record).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an /admin section accessible only to authenticated admin users.
- **FR-002**: Admin users MUST be able to view, search, and filter the product catalog.
- **FR-003**: Admin users MUST be able to update product prices with immediate effect on the storefront.
- **FR-004**: Admin users MUST be able to add new scent, color, and shape options to the catalog.
- **FR-005**: Admin users MUST be able to edit existing scent, color, and shape options.
- **FR-006**: Admin users MUST be able to remove scent, color, and shape options that are not in use by active orders.
- **FR-007**: Admin users MUST be able to update size limits (minimum and maximum weight) per product.
- **FR-008**: Admin users MUST be able to create discounts with code, type (percentage or fixed), amount, validity dates, and usage limits.
- **FR-009**: Admin users MUST be able to edit and deactivate existing discounts.
- **FR-010**: Admin users MUST be able to delete discounts, preserving order history integrity.
- **FR-011**: System MUST validate all admin inputs (prices, weights, discount values) and display clear error messages for invalid data.
- **FR-012**: System MUST log all catalog changes with timestamp, admin user, and change details for audit purposes.
- **FR-013**: System MUST require authentication for all /admin routes, redirecting unauthenticated users to a login page.

### Key Entities

- **Product**: Represents a soap product with attributes for name, description, base price, size limits (min/max weight), and associated options.
- **Scent Option**: Represents a fragrance option with name and description, reusable across multiple products.
- **Color Option**: Represents a color choice with name and hex code/value, reusable across multiple products.
- **Shape Option**: Represents a physical shape with name and description, reusable across multiple products.
- **Discount**: Represents a promotional code or automatic discount with code, type, value, validity period, and usage statistics.
- **Admin User**: Represents an authenticated user with admin privileges to manage the catalog.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin users can update any product price and see the change reflected on the storefront within 5 seconds.
- **SC-002**: Admin users can add a new scent/color/shape option and have it available for product association within 10 seconds.
- **SC-003**: Discount codes created by admins are functional and correctly apply at checkout with 100% accuracy.
- **SC-004**: All catalog changes are logged and retrievable for audit purposes, showing admin identity and timestamp.
- **SC-005**: Unauthenticated access to /admin routes is blocked and redirected, with zero unauthorized admin actions possible.

## Assumptions

- Admin users will be authenticated via an existing authentication system (not built as part of this feature).
- The catalog data is stored in a database and does not require real-time synchronization with external systems.
- Only one admin is expected to edit the catalog at a time; concurrent edit conflicts are handled with last-write-wins.
- Discounts apply to order totals at checkout and do not affect payment processor fees.
- Size limits are measured in a single unit (grams or ounces) determined by business preference.