---

description: "Task list template for feature implementation"
---

# Tasks: Webhook Order Submission

**Input**: Design documents from `/specs/1-webhook-order-submission/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create environment variable configuration in .env.local for Pabbly webhook URL
- [x] T002 [P] Add VITE_PABBLY_WEBHOOK_URL to .env.example with placeholder

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create TypeScript types for webhook payload in src/types/webhook.ts
- [x] T004 [P] Implement webhook submission service with retry logic in src/services/webhook.ts
- [x] T005 [P] Create React hook for webhook operations in src/hooks/useWebhook.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Complete Order with Webhook Submission (Priority: P1) 🎯 MVP

**Goal**: Send order data to Pabbly webhook when customer places order

**Independent Test**: Complete an order and verify the webhook receives the correct JSON payload with customer and order item details

### Implementation for User Story 1

- [x] T006 [US1] Update SoapForm.tsx to import useWebhook hook and trigger webhook on submit
- [x] T007 [US1] Map existing form state to WebhookPayload structure (customer, items)
- [x] T008 [US1] Add order ID generation (UUID v4) when submitting webhook
- [x] T009 [US1] Handle webhook success state - show confirmation to user
- [x] T010 [US1] Handle webhook failure state - show error with fallback instructions
- [x] T011 [US1] Add console logging for webhook attempts with order ID, status, timestamp

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Order Confirmation with Webhook Status (Priority: P2)

**Goal**: Show webhook submission status to customer after order placement

**Independent Test**: Verify order confirmation screen shows webhook submission status (success/pending/error)

### Implementation for User Story 2

- [x] T012 [US2] Update useWebhook hook to expose submission status (pending, submitting, submitted, failed)
- [x] T013 [US2] Add status indicator UI in SoapForm component during submission
- [x] T014 [US2] Implement user-friendly status messages for each submission state
- [x] T015 [US2] Add timeout indication if webhook is taking longer than expected

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T016 [P] Verify .env.local is added to .gitignore
- [x] T017 [P] Run quickstart.md validation - test webhook with actual Pabbly endpoint
- [x] T018 [P] Verify console logging format matches requirements (order ID, status, timestamp, attempt)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 being implemented (uses useWebhook hook)

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
Task: "Create TypeScript types for webhook payload in src/types/webhook.ts"
Task: "Implement webhook submission service with retry logic in src/services/webhook.ts"
Task: "Create React hook for webhook operations in src/hooks/useWebhook.ts"

# These depend on the above, so run after:
Task: "Update SoapForm.tsx to import useWebhook hook and trigger webhook on submit"
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
4. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
3. Stories complete and integrate independently

---

## Task Summary

| Phase | Task Count | Description |
|-------|------------|-------------|
| Phase 1: Setup | 2 | Environment configuration |
| Phase 2: Foundational | 3 | Types, service, hook |
| Phase 3: US1 | 6 | Webhook integration in form |
| Phase 4: US2 | 4 | Status feedback UI |
| Phase 5: Polish | 3 | Final checks |
| **Total** | **18** | All tasks |

### Per User Story

- **User Story 1 (P1)**: 6 tasks - Core webhook submission
- **User Story 2 (P2)**: 4 tasks - Status feedback (depends on US1)

### Parallel Tasks

Tasks marked [P] can run in parallel:
- T001, T002 (Setup)
- T003, T004, T005 (Foundational)
- T016, T017, T018 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
