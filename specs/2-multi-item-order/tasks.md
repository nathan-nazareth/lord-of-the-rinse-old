---

description: "Task list template for feature implementation"
---

# Tasks: Multi-Item Order Cart

**Input**: Design documents from `/specs/2-multi-item-order/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new types and services for cart functionality

- [x] T001 Create CartItem type in src/types/cart.ts with id, scent, customScent, color, quantity, addedAt
- [x] T002 [P] Create Cart type in src/types/cart.ts with items array, totalQuantity, updatedAt
- [x] T003 [P] Create CartService interface in src/services/cart.ts with save, load, remove, clear methods
- [x] T004 [P] Implement localStorage persistence in src/services/cart.ts with 30-day expiry
- [x] T005 Create useCart hook in src/hooks/useCart.ts with addItem, removeItem, clearCart, cart state

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Update src/types/index.ts to export Cart and CartItem types
- [x] T007 Update src/services/index.ts to export cart service
- [x] T008 Update src/hooks/index.ts to export useCart hook
- [x] T009 Create Cart component shell in src/components/Cart.tsx (collapsible sidebar)
- [x] T010 Create CartItem component in src/components/CartItem.tsx (individual item display)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add Multiple Items to Cart (Priority: P1) 🎯 MVP

**Goal**: Allow customers to add multiple soap items to a cart

**Independent Test**: Can add multiple items with different customizations and see them in a cart summary

### Implementation for User Story 1

- [x] T011 [US1] Update SoapForm.tsx to change "Draft Order" button to "Add to Cart"
- [x] T012 [US1] Add form reset functionality in SoapForm.tsx after adding to cart
- [x] T013 [US1] Connect useCart hook addItem function to Add to Cart button
- [x] T014 [US1] Implement item generation with UUID in useCart hook
- [x] T015 [US1] Add toast notification for successful cart addition
- [x] T016 [US1] Implement cart item count display in Cart component
- [x] T017 [US1] Display cart items with details in expanded Cart component
- [x] T018 [US1] Show total quantity sum in Cart component
- [x] T019 [US1] Add remove item button to each CartItem component
- [x] T020 [US1] Implement remove item functionality with confirmation (3+ items)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Single Checkout with Multiple Items (Priority: P1)

**Goal**: Submit all cart items in single webhook with one contact info entry

**Independent Test**: Can complete checkout with cart items and contact info, receiving order confirmation for all items

### Implementation for User Story 2

- [ ] T021 [US2] Create CheckoutForm component in src/components/CheckoutForm.tsx with name, email, phone fields
- [ ] T022 [US2] Add checkout form validation (required fields, email format, phone format)
- [ ] T023 [US2] Update webhook service to accept cart items array instead of single item
- [ ] T024 [US2] Connect checkout button in Cart component to show CheckoutForm
- [ ] T025 [US2] Implement webhook submission with all cart items in single payload
- [ ] T026 [US2] Handle checkout success state with order confirmation UI
- [ ] T027 [US2] Clear cart after successful checkout
- [ ] T028 [US2] Show all ordered items in confirmation message

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Cart Persistence (Priority: P2)

**Goal**: Cart persists across page refreshes using localStorage

**Independent Test**: Cart items remain after page refresh

### Implementation for User Story 3

- [ ] T029 [US3] Implement cart load from localStorage on component mount in useCart hook
- [ ] T030 [US3] Save cart to localStorage on every cart change (add, remove, clear)
- [ ] T031 [US3] Add 30-day expiry check on cart load
- [ ] T032 [US3] Handle corrupted localStorage data gracefully
- [ ] T033 [US3] Show empty cart state when localStorage is expired or empty

**Checkpoint**: All user stories complete - cart functionality fully operational

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T034 [P] Add cart limit validation (max 20 items)
- [x] T035 [P] Implement cart total quantity calculation
- [x] T036 [P] Add empty cart state UI with guidance message
- [x] T037 [P] Add loading states for cart operations
- [x] T038 [P] Verify localStorage works in production build

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 being implemented (uses cart items)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent of US1/US2 but benefits from them

### Within Each User Story

- Types before services
- Services before hooks
- Core implementation before UI integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch these tasks together since they affect different files:
Task: "Create CartItem type in src/types/cart.ts"
Task: "Create CartService interface in src/services/cart.ts"
Task: "Create useCart hook in src/hooks/useCart.ts"
Task: "Create Cart component shell in src/components/Cart.tsx"
Task: "Create CartItem component in src/components/CartItem.tsx"

# These depend on the above, so run after:
Task: "Update SoapForm.tsx to change button to Add to Cart"
Task: "Connect useCart hook addItem function to Add to Cart button"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test cart functionality independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Polish phase → Final polish

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Add to Cart)
   - Developer B: User Story 2 (Checkout)
3. Stories complete and integrate independently
4. Add User Story 3 (Persistence) as enhancement

---

## Task Summary

| Phase | Task Count | Description |
|-------|------------|-------------|
| Phase 1: Setup | 5 | Types, service, hook creation |
| Phase 2: Foundational | 5 | Exports, component shells |
| Phase 3: US1 | 10 | Add to Cart functionality |
| Phase 4: US2 | 8 | Checkout with multi-item payload |
| Phase 5: US3 | 5 | localStorage persistence |
| Phase 6: Polish | 5 | Validation, totals, empty states |
| **Total** | **38** | All tasks |

### Per User Story

- **User Story 1 (P1)**: 10 tasks - Core cart functionality
- **User Story 2 (P1)**: 8 tasks - Multi-item checkout
- **User Story 3 (P2)**: 5 tasks - Cart persistence (can be deferred)

### Parallel Tasks

Tasks marked [P] can run in parallel:
- T001, T002, T003, T004, T005 (Setup)
- T006, T007, T008, T009, T010 (Foundational)
- T034, T035, T036, T037, T038 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
