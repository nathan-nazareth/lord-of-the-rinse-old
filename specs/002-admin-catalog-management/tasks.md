---

description: "Task list for Admin Catalog Management feature"

---

# Tasks: Admin Catalog Management

**Input**: Design documents from `/specs/002-admin-catalog-management/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/admin-api.md, research.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Monorepo structure: `packages/app/src/`, `packages/api/src/`, `packages/db/src/`
- Routes: `packages/app/src/routes/admin/`
- API routes: `packages/api/src/routes/`
- Database: `packages/db/src/schema/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Create admin route files in packages/app/src/routes/admin/ (empty placeholder routes)
- [x] T002 [P] Create admin type definitions in packages/app/src/types/admin.ts
- [ ] T003 [P] Add admin route entries to routeTree.gen.ts via TanStack Router

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create database schema files in packages/db/src/schema/ (products.ts, options.ts, discounts.ts, audit_log.ts, product_options.ts)
- [ ] T005 [P] Create database migrations for admin catalog tables
- [ ] T006 [P] Add admin auth middleware check in packages/api/src/middleware/auth.ts (verify admin role)
- [ ] T007 [P] Create admin API route files in packages/api/src/routes/ (admin.catalog.ts, admin.options.ts, admin.discounts.ts)
- [ ] T008 [P] Add admin API routes to packages/api/src/index.ts
- [x] T009 [P] Create admin Zustand store in packages/app/src/stores/useAdminStore.ts
- [x] T010 [P] Create admin API client hook in packages/app/src/hooks/useAdminCatalog.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Manage Product Pricing (Priority: P1) 🎯 MVP

**Goal**: Admin can view products and update prices

**Independent Test**: Navigate to /admin/products, edit a product's price, verify change appears on storefront within 5 seconds

### Implementation for User Story 1

- [ ] T011 [P] [US1] Implement Product model in packages/db/src/schema/products.ts
- [ ] T012 [P] [US1] Implement ProductOption junction table in packages/db/src/schema/product_options.ts
- [ ] T013 [US1] Implement admin.catalog.ts GET /api/admin/products endpoint in packages/api/src/routes/admin.catalog.ts
- [ ] T014 [US1] Implement admin.catalog.ts PUT /api/admin/products/:id endpoint in packages/api/src/routes/admin.catalog.ts
- [x] T015 [US1] Create AdminLayout component in packages/app/src/components/admin/AdminLayout.tsx
- [x] T016 [US1] Create ProductForm component in packages/app/src/components/admin/ProductForm.tsx
- [ ] T017 [US1] Create admin products list page in packages/app/src/routes/admin/products.tsx
- [ ] T018 [US1] Create admin product edit page in packages/app/src/routes/admin/products.$id.tsx
- [ ] T019 [US1] Connect ProductForm to useAdminCatalog hook for price updates
- [ ] T020 [US1] Add audit logging for price changes in admin.catalog.ts

**Checkpoint**: Admin can view products and update prices independently

---

## Phase 4: User Story 2 - Manage Product Options: Scents, Colors, Shapes (Priority: P1)

**Goal**: Admin can add, edit, and remove scent/color/shape options

**Independent Test**: Navigate to /admin/options, add a new scent, verify it appears in product configuration UI

### Implementation for User Story 2

- [ ] T021 [P] [US2] Implement CatalogOption model in packages/db/src/schema/options.ts
- [ ] T022 [US2] Implement admin.options.ts GET /api/admin/options endpoint in packages/api/src/routes/admin.options.ts
- [ ] T023 [US2] Implement admin.options.ts POST /api/admin/options endpoint in packages/api/src/routes/admin.options.ts
- [ ] T024 [US2] Implement admin.options.ts PUT /api/admin/options/:id endpoint in packages/api/src/routes/admin.options.ts
- [ ] T025 [US2] Implement admin.options.ts DELETE /api/admin/options/:id endpoint in packages/api/src/routes/admin.options.ts
- [ ] T026 [US2] Implement admin.options.ts POST /api/admin/products/:id/options endpoint in packages/api/src/routes/admin.options.ts
- [ ] T027 [US2] Implement admin.options.ts DELETE /api/admin/products/:id/options/:optionId endpoint in packages/api/src/routes/admin.options.ts
- [ ] T028 [US2] Create OptionManager component in packages/app/src/components/admin/OptionManager.tsx
- [ ] T029 [US2] Create admin options page in packages/app/src/routes/admin/options.tsx
- [ ] T030 [US2] Connect OptionManager to useAdminCatalog hook
- [ ] T031 [US2] Add audit logging for option changes in admin.options.ts

**Checkpoint**: Admin can manage scent/color/shape options independently

---

## Phase 5: User Story 3 - Manage Size Limits (Priority: P2)

**Goal**: Admin can update minimum/maximum weight limits per product

**Independent Test**: Update size constraints for a product, attempt to add customization exceeding the new limits

### Implementation for User Story 3

- [ ] T032 [US3] Add min_weight and max_weight fields to ProductForm in packages/app/src/components/admin/ProductForm.tsx
- [ ] T033 [US3] Add min_weight and max_weight validation in packages/api/src/routes/admin.catalog.ts PUT endpoint
- [ ] T034 [US3] Add size limit warning in customer-facing SoapForm when weight exceeds limits

**Checkpoint**: Admin can update size limits and customers cannot exceed them

---

## Phase 6: User Story 4 - Manage Discounts (Priority: P2)

**Goal**: Admin can create, modify, and delete discount codes

**Independent Test**: Create a discount code, apply it at checkout, verify discount applies correctly

### Implementation for User Story 4

- [ ] T035 [P] [US4] Implement Discount model in packages/db/src/schema/discounts.ts
- [ ] T036 [US4] Implement admin.discounts.ts GET /api/admin/discounts endpoint in packages/api/src/routes/admin.discounts.ts
- [ ] T037 [US4] Implement admin.discounts.ts POST /api/admin/discounts endpoint in packages/api/src/routes/admin.discounts.ts
- [ ] T038 [US4] Implement admin.discounts.ts PUT /api/admin/discounts/:id endpoint in packages/api/src/routes/admin.discounts.ts
- [ ] T039 [US4] Implement admin.discounts.ts DELETE /api/admin/discounts/:id endpoint in packages/api/src/routes/admin.discounts.ts
- [ ] T040 [US4] Create DiscountForm component in packages/app/src/components/admin/DiscountForm.tsx
- [ ] T041 [US4] Create admin discounts page in packages/app/src/routes/admin/discounts.tsx
- [ ] T042 [US4] Connect DiscountForm to useAdminCatalog hook
- [ ] T043 [US4] Add audit logging for discount changes in admin.discounts.ts

**Checkpoint**: Admin can manage discounts independently

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T044 [P] Add audit log viewer page in packages/app/src/routes/admin/audit.tsx
- [ ] T045 [P] Add bulk edit capability for products in packages/app/src/routes/admin/products.tsx
- [ ] T046 Add admin dashboard index page in packages/app/src/routes/admin/_index.tsx with stats overview
- [ ] T047 [P] Update existing customer-facing useCatalog hook to include admin-created options immediately
- [ ] T048 Run lint and fix any issues
- [ ] T049 Run tests and ensure all pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 and US2 can proceed in parallel (both P1)
  - US3 and US4 depend on their respective entity implementations in Foundational
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on ProductForm from US1
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Can proceed in parallel with US3

### Within Each User Story

- Models before API endpoints
- API endpoints before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational is complete, US1 and US2 can start in parallel
- US3 depends on US1 ProductForm component
- US4 can proceed in parallel with US3

---

## Parallel Example: User Story 1 & 2

```bash
# US1 and US2 can be implemented in parallel after Foundational:
# Developer A: US1 (Product Pricing)
# Developer B: US2 (Product Options)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Pricing)
   - Developer B: User Story 2 (Options)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence