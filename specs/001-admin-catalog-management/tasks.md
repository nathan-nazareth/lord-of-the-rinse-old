# Tasks: Admin Catalog Management

**Input**: Design documents from `specs/001-admin-catalog-management/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: SQLite database schema and client initialization for admin panel

- [X] T001 Create SQLite admin schema in packages/db/src/schema/admin-sqlite.ts using drizzle-orm/sqlite-core
- [X] T002 Create libSQL client initialization and re-export admin schema in packages/db/src/admin.ts
- [X] T003 Add @libsql/client dependency to packages/db/package.json (root already has it)
- [X] T004 Add admin:generate, admin:push, and admin:seed scripts to packages/db/package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Admin authentication and API structure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create admin auth middleware validating Authorization: Bearer admin-authenticated header in packages/api/src/middleware/admin-auth.ts
- [X] T006 Create admin login endpoint (POST /api/admin/auth/login) in packages/api/src/routes/admin-auth.ts
- [X] T007 Register admin auth and login routes in packages/api/src/index.ts, mounting under /api/admin/
- [X] T008 Add ADMIN_PASSWORD to packages/api/.env.example with default 3984

**Checkpoint**: Admin API ready — login works, protected routes reject unauthenticated requests.

---

## Phase 3: User Story 1 — Admin Login (Priority: P1) 🎯 MVP

**Goal**: Admin can authenticate with password 3984 and access the admin panel

**Independent Test**: Navigate to /admin, enter password 3984, verify admin tabs appear. Enter wrong password, verify error.

### Implementation for User Story 1

- [X] T009 [US1] Create LoginForm component in packages/app/src/components/admin/LoginForm.tsx calling POST /api/admin/auth/login
- [X] T010 [US1] Update admin _index.tsx to check auth state, show LoginForm if unauthenticated, show nav if authenticated
- [X] T011 [US1] Wire Dashboard tab in _index.tsx to navigate to / and clear auth state (logout)

**Checkpoint**: Admin can log in with password 3984, see the admin nav with Dashboard/Products/Options/Discounts tabs, and Dashboard tab logs out to homepage.

---

## Phase 4: User Story 2 — Manage Products (Priority: P1)

**Goal**: Admin can add new products and remove existing products from the catalog

**Independent Test**: Add a product with name, color, scent, shape, weight → appears in list. Remove it → disappears from list.

### Implementation for User Story 2

- [X] T012 [P] [US2] Create products API routes (GET/POST/DELETE /api/admin/products) in packages/api/src/routes/admin-products.ts
- [X] T013 [P] [US2] Wire products page form and table in packages/app/src/routes/admin/products.tsx
- [X] T014 [US2] Add product list display and delete button in products.tsx calling useAdminProducts/useDeleteProduct
- [X] T015 [US2] Wire price/weight validation against AdminOptions bounds in admin-products.ts (reject if out of range)

**Checkpoint**: Admin can add products via a form, see the list, and delete products.

---

## Phase 5: User Story 3 — Configure Options (Priority: P2)

**Goal**: Admin can adjust minimum/maximum price and minimum/maximum size

**Independent Test**: Change min/max price and min/max size, then try adding a product outside bounds → rejection.

### Implementation for User Story 3

- [X] T016 [P] [US3] Create options API routes (GET/PUT /api/admin/options) in packages/api/src/routes/admin-options.ts
- [X] T017 [US3] Update options page in packages/app/src/routes/admin/options.tsx with form fields for minPrice, maxPrice, minSize, maxSize

**Checkpoint**: Admin can view and update price bounds and size range.

---

## Phase 6: User Story 4 — Manage Discounts (Priority: P2)

**Goal**: Admin can create, update, and delete discount percentages

**Independent Test**: Create a discount at 20% → appears in list. Update to 25% → change reflected. Delete → removed.

### Implementation for User Story 4

- [X] T018 [P] [US4] Create discounts API routes (GET/POST/PUT/DELETE /api/admin/discounts) in packages/api/src/routes/admin-discounts.ts
- [X] T019 [US4] Update discounts page in packages/app/src/routes/admin/discounts.tsx with list, add/edit forms, delete buttons

**Checkpoint**: Admin can fully manage discounts (CRUD).

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final touches and consistency

- [X] T020 Create seed script in packages/db/src/admin-seed.ts with default AdminOptions row (minPrice: 500, maxPrice: 5000, minSize: 50, maxSize: 500)
- [X] T021 Add ADMIN_PASSWORD and ADMIN_SQLITE_URL to packages/api/.env.example
- [X] T022 TypeScript path aliases already configured in packages/app/tsconfig.json - no changes needed
- [X] T023 Admin panel uses same Tailwind/stone design system as main app (bg-stone-50, text-stone-800, amber-600)
- [X] T024 Lint passed - formatting issues are in pre-existing files, new admin files are clean
- [X] T025 Tests passed (no regressions in existing test suite)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 Admin Login (Phase 3)**: Depends on Foundational — no story dependencies
- **US2 Manage Products (Phase 4)**: Depends on Foundational — no story dependencies (US1 and US2 can be parallel)
- **US3 Configure Options (Phase 5)**: Depends on Foundational — no story dependencies
- **US4 Manage Discounts (Phase 6)**: Depends on Foundational — no story dependencies
- **Polish (Phase 7)**: Depends on all stories complete

### User Story Dependencies

- **US1 (P1)**: Independent — only needs Phase 1 + 2
- **US2 (P1)**: Independent — only needs Phase 1 + 2 (parallel with US1)
- **US3 (P2)**: Independent — only needs Phase 1 + 2 (parallel with all)
- **US4 (P2)**: Independent — only needs Phase 1 + 2 (parallel with all)

### Parallel Opportunities

- All tasks marked [P] can run in parallel within the same phase
- US1 and US2 can be implemented in parallel (both P1, independent)
- US3 and US4 can be implemented in parallel (both P2, independent)
- All user stories can theoretically proceed simultaneously after Phase 2

### Parallel Example: User Story 2

```bash
# Launch all parallel tasks for US2 together:
Task: T012 Create products API routes in packages/api/src/routes/admin-products.ts
Task: T013 Update ProductForm component in packages/app/src/components/admin/ProductForm.tsx
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup (SQLite schema + client)
2. Complete Phase 2: Foundational (auth middleware + login endpoint)
3. Complete Phase 3: User Story 1 (login flow)
4. Complete Phase 4: User Story 2 (product CRUD)
5. **STOP and VALIDATE**: Admin login + add/remove products works
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Admin API ready
2. Add US1 + US2 → Admin can log in and manage products (MVP!)
3. Add US3 → Admin can configure pricing/size bounds
4. Add US4 → Admin can manage discounts
5. Polish → Final styling and cleanup

### Total

- **25 tasks** across 7 phases
- **12 [P] parallel tasks**
- **4 independent user stories**
- **MVP scope**: US1 (login) + US2 (product management)
