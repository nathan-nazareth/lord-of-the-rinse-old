---
description: "Task list template for feature implementation"
---

# Tasks: Web3Forms Migration

**Input**: Design documents from `/specs/001-web3forms-migration/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project - adjust based on plan.md structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and configuration for Web3Forms integration

- [x] ~~T001~~ Create `.env.local` with Web3Forms access key in root directory
- [x] ~~T002~~ [P] Update `src/types/webhook.ts` to add SubmissionState type and localStorage interfaces

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] ~~T003~~ [P] Enhance `src/utils/errorLogging.ts` to add Web3Forms-specific error logging for rate limits
- [x] ~~T004~~ [P] Update `src/services/webhook.ts` to use Web3Forms endpoint instead of legacy webhook, including retry logic with exponential backoff

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Order Submission via Web3Forms (Priority: P1) 🎯 MVP

**Goal**: Customers can submit soap orders through the form and receive confirmation

**Independent Test**: Complete the soap order form and verify order appears in Web3Forms dashboard

- [x] ~~T005~~ [US1] Update `src/hooks/useWebhook.ts` to handle Web3Forms response parsing for success/failure
- [x] ~~T006~~ [US1] Modify `src/hooks/useWebhook.ts` to display success confirmation message to customer

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Business Receives Order Notifications (Priority: P1)

**Goal**: Business owner receives customer orders through Web3Forms without workflow changes

**Independent Test**: Submit test order and verify order data in Web3Forms dashboard

- [x] ~~T007~~ [US2] [P] Ensure `src/services/webhook.ts` transmits all required order fields per API contract (customer_name, customer_email, customer_phone, order_items, etc.)
- [x] ~~T008~~ [US2] [P] Verify `src/services/webhook.ts` maintains same data structure as previous legacy webhook integration

**Checkpoint**: User Story 2 should be fully functional - business can receive orders

---

## Phase 5: User Story 3 - Graceful Error Handling (Priority: P2)

**Goal**: Customers receive clear feedback on errors and can retry failed submissions

**Independent Test**: Simulate API failures and verify user-facing messages with retry capability

- [x] ~~T009~~ [US3] [P] Update `src/hooks/useWebhook.ts` to preserve form data on error for retry
- [x] ~~T010~~ [US3] [P] Modify `src/hooks/useWebhook.ts` to show specific error messages (rate limit, unavailable, etc.)
- [x] ~~T011~~ [US3] Update `src/hooks/useWebhook.ts` to implement localStorage state tracking (pending/sent/failed) for retry capability
- [x] ~~T012~~ [US3] Create `tests/e2e/web3forms.spec.ts` with E2E tests for error handling and retry scenarios

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] ~~T013~~ [P] Verify all environment variable configurations in `.env.local`
- [x] ~~T014~~ Run `npm run build` to ensure production build succeeds
- [x] ~~T015~~ [P] Document Web3Forms integration in `specs/001-web3forms-migration/quickstart.md` with any implementation notes

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
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# These tasks can run in parallel for US1:
Task: "Update useWebhook.ts to handle Web3Forms response parsing"
Task: "Modify useWebhook.ts to display success confirmation message"
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
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Task Summary

| Phase | Task Count | Description |
|-------|------------|-------------|
| Phase 1: Setup | 2 | Environment config, types update |
| Phase 2: Foundational | 2 | Error logging, webhook service |
| Phase 3: US1 | 2 | Response handling, success UI |
| Phase 4: US2 | 2 | Data transmission, structure |
| Phase 5: US3 | 4 | Error handling, retry, storage, E2E tests |
| Phase 6: Polish | 3 | Build verification, docs |
| **Total** | **15** | |

### Parallel Opportunities: 9 tasks marked [P]

### Independent Test Criteria

- **US1**: Form submission succeeds, success message displays, order appears in Web3Forms dashboard
- **US2**: All order data fields transmitted correctly, business receives notifications
- **US3**: Network failures preserve data, error messages display, retry works, rate limits handled

### Suggested MVP Scope

Complete Phases 1-3 (Setup + Foundational + US1) for minimum viable product. US2 and US3 can be added incrementally.
