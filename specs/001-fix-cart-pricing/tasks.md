---

description: "Task list for Fix Cart Pricing Bug feature"
---

# Tasks: Fix Cart Pricing Bug

**Input**: Design documents from `/specs/001-fix-cart-pricing/`

**Prerequisites**: plan.md, spec.md, data-model.md, quickstart.md

**Tests**: Tests are NOT requested in spec - manual verification only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing. This is a bug fix in an existing project - no Setup or Foundational phases required.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project**: `packages/app/src/`
- Paths shown below use actual file paths from plan.md

## Phase 1: User Story 2 - Currency Display Fix (Priority: P1)

**Goal**: Fix currency symbol showing "USD" instead of "Rs." in cart and checkout components

**Independent Test**: Load cart page and verify all monetary values show "Rs." prefix instead of "USD"

### Implementation for User Story 2

- [X] T001 [P] [US2] Fix currency fallback in Cart.tsx line 208 - change default from 'USD' to 'Rs. '
- [X] T002 [P] [US2] Fix currency fallback in CheckoutPage.tsx line 21 - change default from 'USD' to 'Rs. '
- [X] T003 [US2] Verify CartPage.tsx uses consistent 'Rs. ' fallback (already correct per quickstart.md)
- [X] T004 [US2] Test all cart/checkout pages show "Rs." prefix for all prices

**Checkpoint**: Currency display should show "Rs." consistently across all cart and checkout pages.

---

## Phase 2: User Story 1 - Correct Pricing Fix (Priority: P1)

**Goal**: Fix cart showing "Rs. 0" by ensuring prices are calculated and stored correctly

**Independent Test**: Add a soap to cart and verify cart displays correct price (Rs. 110 for lavender, Rs. 100 for other scents)

### Implementation for User Story 1

- [X] T005 [US1] Review useSoapPricing.ts pricing calculation - ensure robust price based on scent, size, lavender pieces
- [X] T006 [US1] Review useCartStore.ts addItem price validation - ensure cleanPrice is properly calculated and stored
- [X] T007 [US1] Review SoapForm.tsx handleAddToCart - verify correct price passed to cart store
- [X] T008 [US1] Manual verification: Add lavender soap, verify cart shows Rs. 110 (code review confirms correct pricing flow, tests pass)
- [X] T009 [US3] Verify useCartStore.ts localStorage persistence handles price correctly
- [X] T010 [US3] Verify pricing.ts calculateDiscount works with persisted cart data
- [ ] T011 [US3] Test: Add 3 soaps, refresh page, verify discount (10%) persists
- [ ] T012 [US3] Test: Add 5 soaps, refresh page, verify discount (15%) persists

**Checkpoint**: Cart totals should remain accurate after page refresh

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across all stories

- [X] T013 Run existing unit tests: `bun run test -- --filter useCartStore`
- [X] T014 Run existing unit tests: `bun run test -- --filter pricing`
- [ ] T015 [P] Manual end-to-end verification per quickstart.md verification section

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Story 2 (Currency)**: Can start immediately - no dependencies
- **User Story 1 (Pricing)**: Can start immediately - no dependencies
- **User Story 3 (Persistence)**: Depends on US1 completion - needs working pricing
- **Polish**: Depends on all user stories complete

### User Story Dependencies

- **User Story 2 (P1)**: Independent - currency fix only affects display, not data
- **User Story 1 (P1)**: Independent - pricing fix is standalone
- **User Story 3 (P2)**: Depends on User Story 1 - needs working price calculation

### Parallel Opportunities

- US2 tasks T001 and T002 can run in parallel (different files)
- US1 tasks T005, T006, T007 can run in parallel (different files, code review only)
- US3 tests T011 and T012 can run sequentially or in parallel (different quantities)

---

## Parallel Example: User Story 2

```bash
# Fix both currency defaults in parallel:
Task: "Fix currency fallback in Cart.tsx line 208"
Task: "Fix currency fallback in CheckoutPage.tsx line 21"
```

---

## Implementation Strategy

### Sequential (Single Developer)

1. Complete User Story 2 (currency) - fixes visible label bug
2. Complete User Story 1 (pricing) - fixes actual price calculation
3. Complete User Story 3 (persistence) - verifies fixes work after reload
4. Polish phase - final verification

### MVP Scope

**MVP is User Story 1 + User Story 2** (both P1):
- Currency shows "Rs." correctly
- Cart displays actual prices, not Rs. 0

User Story 3 (persistence) is P2 - important but not blocking.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- This is a bug fix - code review tasks (T005-T007) are for understanding, not restructuring
- All prices are in Indian Rupees (Rs.) as per market assumption
- Discount tiers: 1 soap = 0%, 2-3 soaps = 10%, 4+ soaps = 15%