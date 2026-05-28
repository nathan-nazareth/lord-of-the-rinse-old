# Feature Specification: Fix Admin Authentication

**Feature Branch**: `003-admin-auth-fix`
**Created**: 2026-05-28
**Status**: Draft
**Input**: User description: "Completely investigat and fix the admin part of the website. idk how many probblems are there, because the sign in doesnt work. when i type 3984, it says: api/admin/auth/login:1  Failed to load resource: the server responded with a status of 404 ()"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Login (Priority: P1)

An admin user can log into the admin dashboard using the password "3984".

**Why this priority**: Login is the entry point to all admin functionality - without it, nothing else can be tested or used.

**Independent Test**: Can be fully tested by submitting the password form and verifying successful redirect to admin dashboard.

**Acceptance Scenarios**:

1. **Given** the admin login page is displayed, **When** the user enters the correct password "3984" and submits, **Then** the user is authenticated and redirected to `/admin` dashboard.

2. **Given** the admin login page is displayed, **When** the user enters an incorrect password and submits, **Then** an error message "Invalid password" is displayed and the user remains on the login page.

3. **Given** the admin login page is displayed, **When** the user submits an empty password, **Then** an error message "Password is required" is displayed.

---

### User Story 2 - Admin Product Management (Priority: P2)

An authenticated admin user can view, create, and delete products in the catalog.

**Why this priority**: Core business functionality for managing the soap product catalog.

**Independent Test**: Can be fully tested by logging in, navigating to Products, adding a product, and verifying it appears in the list.

**Acceptance Scenarios**:

1. **Given** the admin is authenticated and on the Products page, **When** the page loads, **Then** all existing products are displayed in a table.

2. **Given** the admin is authenticated and on the Products page, **When** the admin fills out the product form and submits, **Then** a new product is created and appears in the table.

3. **Given** the admin is authenticated and on the Products page, **When** the admin clicks the delete button on a product, **Then** the product is removed from the table.

---

### User Story 3 - Admin Options Management (Priority: P3)

An authenticated admin user can view and update catalog constraints (price and size bounds).

**Why this priority**: Allows admin to configure valid product ranges.

**Independent Test**: Can be fully tested by navigating to Options, viewing current bounds, and updating them.

**Acceptance Scenarios**:

1. **Given** the admin is authenticated and on the Options page, **When** the page loads, **Then** the current min/max price and size constraints are displayed.

2. **Given** the admin is authenticated and on the Options page, **When** the admin updates constraints with valid values and submits, **Then** the new constraints are saved and displayed.

3. **Given** the admin is authenticated and on the Options page, **When** the admin enters maxPrice < minPrice, **Then** an error is displayed and changes are not saved.

---

### User Story 4 - Admin Discount Management (Priority: P4)

An authenticated admin user can view, create, update, and delete discounts.

**Why this priority**: Allows admin to manage promotional discounts.

**Independent Test**: Can be fully tested by navigating to Discounts, creating a discount, editing it, and deleting it.

**Acceptance Scenarios**:

1. **Given** the admin is authenticated and on the Discounts page, **When** the page loads, **Then** all active and inactive discounts are listed.

2. **Given** the admin is authenticated and on the Discounts page, **When** the admin creates a discount with valid percentage (0-100) and description, **Then** the discount appears in the list.

3. **Given** the admin is authenticated and on the Discounts page, **When** the admin enters a percentage outside 0-100, **Then** an error is displayed.

---

### Edge Cases

- What happens when the API server is not running? User sees a 404 or network error.
- What happens when the admin session expires? User is redirected to login.
- What happens when creating a product with price outside configured bounds? Error message is displayed.
- What happens when deleting a product that doesn't exist? 404 error is shown gracefully.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept POST request at `/api/admin/auth/login` with JSON body `{ "password": "string" }`.
- **FR-002**: System MUST return 200 with `{ "token": "admin-<password>" }` when correct password is provided.
- **FR-003**: System MUST return 401 with `{ "error": "Invalid password" }` when incorrect password is provided.
- **FR-004**: System MUST return 400 with `{ "error": "Password is required" }` when password field is missing.
- **FR-005**: All `/api/admin/*` endpoints except `/api/admin/auth/login` MUST require `Authorization: Bearer <token>` header.
- **FR-006**: System MUST return 401 when Authorization header is missing or invalid on protected endpoints.
- **FR-007**: System MUST allow admin to perform CRUD operations on products via `/api/admin/products`.
- **FR-008**: System MUST allow admin to view and update options via `/api/admin/options`.
- **FR-009**: System MUST allow admin to perform CRUD operations on discounts via `/api/admin/discounts`.
- **FR-010**: Frontend MUST include Authorization header with Bearer token on all admin API calls after login.
- **FR-011**: Frontend MUST redirect to login page when not authenticated.
- **FR-012**: Frontend MUST display error messages from failed API calls.

### Key Entities *(include if feature involves data)*

- **AdminProduct**: Represents a soap product with name, color, scent, shape, weight, price, timestamps.
- **CatalogOptions**: Singleton entity storing min/max price and size constraints.
- **Discount**: Represents a promotional discount with percentage, description, active status, timestamps.
- **AuthToken**: String token returned on successful login, used for subsequent API authentication.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin user can successfully log in with password "3984" and access admin dashboard.
- **SC-002**: Login failure shows user-friendly error message within 1 second of submission.
- **SC-003**: Authenticated admin can create, view, and delete products without errors.
- **SC-004**: Authenticated admin can view and update catalog options.
- **SC-005**: Authenticated admin can create, view, update, and delete discounts.
- **SC-006**: Unauthenticated requests to admin endpoints receive 401 response.
- **SC-007**: All admin pages display loading states while fetching data.
- **SC-008**: All admin pages display error states when API calls fail.