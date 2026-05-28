# Tasks: Admin Login Bug Fix

**Input**: Design documents from `specs/001-admin-login-fix/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Not explicitly requested in feature specification

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Pre-flight)

**Purpose**: Verify environment and identify files to fix

**Note**: This is a bug fix - no new setup required, existing project structure is sufficient.

- [ ] T001 Review current admin-auth.ts route handler implementation
- [ ] T002 Identify all admin route components requiring accessibility fixes
- [ ] T003 Review useAdminCatalog.ts for computed property access issues

---

## Phase 2: Foundational (API Fix)

**Purpose**: Fix the core async bug in the admin auth route handler

- [ ] T004 Fix missing async keyword on POST /login handler in packages/api/src/routes/admin-auth.ts
- [ ] T005 Verify JSON body parsing works correctly with async/await
- [ ] T006 Test both direct API (localhost:3001) and Vite proxy (localhost:3000) return token

---

## Phase 3: User Story 1 - Admin successfully logs in with valid password (Priority: P1)

**Goal**: Fix core login functionality so administrators can authenticate and receive a valid token

**Independent Test**: Submit valid password (3984) to login endpoint, verify token returned in response

### Implementation

- [ ] T007 [US1] Add proper error handling for failed JSON parsing in admin-auth.ts
- [ ] T008 [US1] Ensure token response format matches "admin-{password}" convention
- [ ] T009 [US1] Verify token can be used for subsequent authenticated requests

**Checkpoint**: Admin login works with valid credentials

---

## Phase 4: User Story 2 - Admin login fails gracefully with invalid password (Priority: P1)

**Goal**: Ensure invalid credentials receive appropriate error response without exposing system details

**Independent Test**: Submit invalid password, verify appropriate error response

### Implementation

- [ ] T010 [US2] Return 401 status for invalid credentials (not 404)
- [ ] T011 [US2] Ensure error response does not leak system details
- [ ] T012 [US2] Verify error message is user-friendly

**Checkpoint**: Invalid password submissions receive clear error without exposing system internals

---

## Phase 5: User Story 3 - Admin login accessible via keyboard navigation (Priority: P2)

**Goal**: All interactive elements on login form are keyboard accessible per WCAG guidelines

**Independent Test**: Complete login using only Tab, Enter, and Arrow keys

### Implementation

- [ ] T013 [P] [US3] Add htmlFor attributes to labels in packages/app/src/routes/admin/*.tsx
- [ ] T014 [P] [US3] Add type="button" to submit buttons to prevent accidental form submission
- [ ] T015 [US3] Verify keyboard focus states are visible
- [ ] T016 [US3] Test keyboard-only login flow (Tab to field, type password, Enter to submit)

**Checkpoint**: Login form is fully keyboard accessible

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify overall fix quality and run final checks

- [ ] T017 [P] Run linter on modified files (bun run lint)
- [ ] T018 [P] Verify TypeScript compiles without errors
- [ ] T019 Run quickstart.md validation commands to confirm both endpoints work
- [ ] T020 Update any relevant documentation if file locations changed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - CRITICAL for user stories
- **User Stories (Phase 3-5)**: All depend on Foundational (Phase 2)
  - Phase 3 and 4 can run in parallel (different concerns - API vs Error handling)
  - Phase 5 is independent but benefits from Phase 4 error patterns
- **Polish (Phase 6)**: Depends on all user stories completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Core auth fix
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Uses same endpoint
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Frontend accessibility

### MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3**

Only Phase 1, 2, and 3 needed for minimal viable product. Phases 4, 5, and 6 are enhancements.

---

## Implementation Strategy

### MVP First (Phase 1-3 Only)

1. Complete Phase 1: Review files to understand scope
2. Complete Phase 2: Fix the async keyword bug
3. Complete Phase 3:Verify login works
4. **STOP and VALIDATE**: Test login endpoint with curl commands from quickstart.md
5. If working, can stop here for MVP

### Incremental Delivery

1. Phase 1-3 → Core login works (MVP)
2. Phase 4 → Better error handling
3. Phase 5 → Accessibility improvements
4. Phase 6 → Polish and verify

---

## Notes

- This is a bug fix - existing project structure is sufficient, no new setup needed
- Phase 2 is critical - without async fix, nothing else works
- All user stories are independently testable once Phase 2 complete
- Parallel opportunities exist where tasks modify different files