# Feature Specification: Admin Catalog Management

**Feature Branch**: `001-admin-catalog-management`  
**Created**: 2026-05-27  
**Status**: Draft  
**Input**: User description: "In the /admin part of the app, i should be able to add or remove products in the products tab, dashboard tab goes back to the homepage as a user, not admin. Options tab goes to adjusting the price of the products and the size range allowed. discounts goes to adjusting the discount. use a database to store the information. use sqlite. installed already. there should be an admin password. 3984. also use the frontend-design skill to make the design the same as the design of the main app. also use the grill me skill for questions"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Login (Priority: P1)

As an admin user, I need to securely access the admin panel so that I can manage products, pricing, and discounts.

**Why this priority**: Security gatekeeper - no admin access means no other admin features matter.

**Independent Test**: Can be fully tested by entering correct password and gaining access to admin dashboard.

**Acceptance Scenarios**:

1. **Given** I am on the admin login page, **When** I enter the correct password (3984), **Then** I am granted access to the admin panel
2. **Given** I am on the admin login page, **When** I enter an incorrect password, **Then** I am shown an error and denied access
3. **Given** I am logged into the admin panel, **When** I click the Dashboard tab, **Then** I am redirected to the public homepage as a regular user (not admin mode)

---

### User Story 2 - Manage Products (Priority: P1)

As an admin, I need to add and remove products so that I can keep the product catalog up to date.

**Why this priority**: Core catalog management - adding/removing products is the most fundamental admin task.

**Independent Test**: Can be fully tested by adding a new product, verifying it appears in the list, removing it, and verifying it's gone.

**Acceptance Scenarios**:

1. **Given** I am logged into the admin panel on the Products tab, **When** I add a new product with name, color, scent, shape, and weight, **Then** the product is saved to the database and appears in the product list
2. **Given** I am logged into the admin panel on the Products tab, **When** I remove an existing product, **Then** the product is deleted from the database and no longer appears in the list
3. **Given** I am logged into the admin panel, **When** I view the Products tab, **Then** I see a list of all current products with their details

---

### User Story 3 - Configure Options (Priority: P2)

As an admin, I need to adjust pricing bounds and size ranges so that I can control what customers can configure when ordering.

**Why this priority**: Allows business to control acceptable product parameters without code changes.

**Independent Test**: Can be fully tested by modifying price bounds and size ranges, then attempting to add a product outside those bounds.

**Acceptance Scenarios**:

1. **Given** I am logged into the admin panel on the Options tab, **When** I update the minimum and maximum price limits, **Then** the new bounds are saved and enforced when adding products
2. **Given** I am logged into the admin panel on the Options tab, **When** I update the minimum and maximum size range, **Then** the new bounds are saved and enforced when adding products
3. **Given** I am logged into the admin panel on the Options tab, **When** I view the current settings, **Then** I see the existing price bounds and size range values

---

### User Story 4 - Manage Discounts (Priority: P2)

As an admin, I need to adjust discounts so that I can run promotions and special offers.

**Why this priority**: Enables marketing campaigns and promotional pricing.

**Independent Test**: Can be fully tested by creating a discount, verifying it applies to relevant products.

**Acceptance Scenarios**:

1. **Given** I am logged into the admin panel on the Discounts tab, **When** I create a new discount with a percentage value, **Then** the discount is saved and can be applied to products
2. **Given** I am logged into the admin panel on the Discounts tab, **When** I update an existing discount, **Then** the changes are saved
3. **Given** I am logged into the admin panel on the Discounts tab, **When** I delete a discount, **Then** the discount is removed and no longer applies
4. **Given** I am logged into the admin panel on the Discounts tab, **When** I view the current discounts, **Then** I see a list of all active discounts with their values

---

### Edge Cases

- What happens when a product being deleted has active orders/pending purchases?
- What happens when the admin password is changed - is it stored securely?
- How does the system handle discount percentages exceeding 100% or going negative?
- How does the system handle conflicting price bounds (min > max)?
- What happens when the admin session times out while making changes?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST require admin password authentication (3984) before granting access to the admin panel
- **FR-002**: The system MUST allow admin users to add new products with configurable attributes (name, color, scent, shape, weight)
- **FR-003**: The system MUST allow admin users to remove existing products from the catalog
- **FR-004**: The system MUST list all products in the Products tab with their current attributes
- **FR-005**: The system MUST allow admin users to configure minimum and maximum price bounds for products
- **FR-006**: The system MUST allow admin users to configure minimum and maximum size range bounds for products
- **FR-007**: The system MUST allow admin users to create, update, and delete discount entries
- **FR-008**: The system MUST persist all admin configuration data (products, options, discounts) in a SQLite database
- **FR-009**: The system MUST redirect authenticated admin users to the public homepage when they click the Dashboard tab (logging out of admin mode)
- **FR-010**: The system MUST display admin panel with consistent styling matching the main application design

### Key Entities *(include if feature involves data)*

- **Product**: Represents a soap product in the catalog. Attributes: id, name, color, scent, shape, weight, createdAt, updatedAt
- **Discount**: Represents a discount that can be applied to products. Attributes: id, percentage, description, createdAt, updatedAt
- **AdminOptions**: Global configuration settings. Attributes: id, minPrice, maxPrice, minSize, maxSize

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin users can successfully authenticate and access the admin panel within 5 seconds
- **SC-002**: Products can be added and appear in the product list immediately after creation
- **SC-003**: Products can be removed and no longer appear in the product list immediately after deletion
- **SC-004**: Option settings (price bounds, size range) are persisted and restored when reloading the admin panel
- **SC-005**: Discounts can be created, modified, and deleted with changes persisted to the database
- **SC-006**: Dashboard navigation returns non-admin users to the public homepage
- **SC-007**: All admin panel screens maintain visual consistency with the main application design
