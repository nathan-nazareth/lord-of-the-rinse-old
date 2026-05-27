# Research: Admin Catalog Management

## Decision 1: Auth Integration for Admin Routes

**Chosen**: Integrate with existing auth middleware via session-based auth

**Rationale**: The project already has auth middleware in packages/api/src/middleware/auth.ts. Admin routes will use the same session cookie mechanism. Admin role will be determined by a role field on the user record.

**Alternatives considered**:
- JWT tokens in Authorization header: Rejected as the existing system uses cookie-based sessions
- Separate admin auth endpoint: Rejected as unnecessary complexity

---

## Decision 2: Admin State Management

**Chosen**: Zustand store for admin UI state + TanStack Router for navigation

**Rationale**: The project already uses Zustand for cart state. Admin forms benefit from local Zustand state for dirty tracking and validation. TanStack Router handles the route structure.

**Alternatives considered**:
- React Context: Rejected as Zustand is already in use and provides better devtools support
- URL state only: Rejected as complex forms need local state for draft changes

---

## Decision 3: Catalog Options Data Model

**Chosen**: Single `catalog_option` table with `type` discriminator (scent/color/shape)

**Rationale**: Simpler schema, easier to add new option types, shared attributes (name, description, display_order). Querying all options of a type is straightforward with a WHERE clause.

**Alternatives considered**:
- Separate tables per option type: Rejected as it duplicates schema and makes cross-type queries harder
- EAV (Entity-Attribute-Value) pattern: Rejected as over-engineered for this scale

---

## Decision 4: API Structure for Admin Operations

**Chosen**: Separate admin endpoints under /api/admin/* prefix

**Rationale**: Clear separation between customer-facing catalog read operations and admin write operations. Allows different auth requirements and middleware.

**Alternatives considered**:
- Same endpoints with PATCH/POST for admin: Rejected as mixing concerns makes auth harder
- GraphQL: Rejected as over-engineered for this use case

---

## Decision 5: Optimistic UI Updates

**Chosen**: Optimistic updates for admin catalog changes with rollback on failure

**Rationale**: Better UX for admin users making multiple changes. Follows existing patterns in the codebase.

**Alternatives considered**:
- Server-confirmed updates only: Rejected as slower UX
- Background sync: Rejected as complexity not justified for single-admin use case