# Implementation Plan: Admin Login Bug Fix

**Branch**: main | **Date**: 2026-05-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-admin-login-fix/spec.md`

## Summary

Fix admin login functionality that returns 404 due to missing `async` keyword on route handler preventing JSON body parsing. Additional fixes include accessibility improvements (labels with htmlFor, buttons with type="button") and code simplification.

## Technical Context

**Language/Version**: TypeScript 5.8
**Primary Dependencies**: React 19, Hono 4.7, TanStack Query 5, TanStack Router 1.170
**Storage**: N/A (authentication token in-memory)
**Testing**: Vitest (unit), Playwright (e2e)
**Target Platform**: Web (Vite SPA on :3000, Hono API on :3001)
**Project Type**: Web application (monorepo: app/ + api/)
**Performance Goals**: Login response under 1 second
**Constraints**: Must preserve existing auth flow, token format "admin-{password}"
**Scale/Scope**: Single admin user, single endpoint

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. User-Centered Ordering | ✅ PASS | Admin login is internal tool; doesn't affect customer ordering flow |
| II. Natural Product Authenticity | ✅ PASS | No user-facing content changes |
| III. Form Validation (NON-NEGOTIABLE) | ✅ PASS | Fixes improve form accessibility and prevent accidental submission |
| IV. Cross-Platform Compatibility | ✅ PASS | Bug fix ensures API works across all proxy configurations |
| V. Graceful Degradation | ✅ PASS | Auth errors provide clear user feedback |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-admin-login-fix/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output (not needed - bug fix)
├── data-model.md        # Phase 1 output (minimal - auth only)
├── quickstart.md        # Phase 1 output (testing notes)
└── checklists/          # Quality checklists
```

### Source Code (repository root)

```text
packages/api/src/routes/
│   └── admin-auth.ts              # Login endpoint (fix async keyword)

packages/app/src/routes/admin/
│   ├── _index.tsx                 # Dashboard (already exists)
│   └── *.tsx                      # Admin route components

packages/app/src/hooks/
│   └── useAdminCatalog.ts         # Admin data hooks
```

**Structure Decision**: Bug fix - minimal file changes. No new structure needed.

## Phase 0: Research

Not required. This is a straightforward bug fix with known root cause and solution.

## Phase 1: Design & Contracts

### Data Model (minimal for auth-only feature)

**AdminAuth**

| Field | Type | Description |
|-------|------|-------------|
| password | string | Admin credential |
| token | string | Auth token returned on success (format: "admin-{password}") |

No persistent entities required - token is ephemeral.

### API Contract

**POST /api/admin/auth/login**

Request:
```json
{
  "password": "string"
}
```

Success Response (200):
```json
{
  "token": "admin-3984"
}
```

Error Responses:
- 401: Invalid credentials
- 404: Endpoint not found (indicates bug - async missing)

### Quickstart

Testing commands:
```bash
# Direct API
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"3984"}'

# Via Vite proxy
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"3984"}'
```

## Complexity Tracking

No constitution violations to justify.