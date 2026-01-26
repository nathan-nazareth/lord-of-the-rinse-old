# Implementation Plan: Web3Forms Migration

**Branch**: `001-web3forms-migration` | **Date**: 2026-01-26 | **Spec**: [Link](spec.md)
**Input**: Feature specification from `/specs/001-web3forms-migration/spec.md`

## Summary

Replace the Pabbly webhook integration with Web3Forms for order submission. The migration involves updating the webhook service to use Web3Forms API endpoint with the provided access key, implementing browser storage for submission state tracking, and ensuring graceful error handling with user feedback. All existing form fields and data structure will be preserved.

## Technical Context

**Language/Version**: TypeScript 5.8.2 + React 19.2.3 + Vite 6.2.0
**Primary Dependencies**: React 19.2.3, lucide-react 0.562.0, Vite 6.2.0
**Storage**: Browser localStorage for submission state tracking
**Testing**: Playwright 1.57.0
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)
**Project Type**: Single-page web application
**Performance Goals**: Form submission feedback within 5 seconds (SC-002)
**Constraints**: API key must not be exposed in client-side code
**Scale/Scope**: Single feature integration, no architecture changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. User-Centered Ordering | ✅ PASS | Form submission flow maintained, error handling improves UX |
| II. Natural Product Authenticity | ✅ N/A | No user-facing content changes |
| III. Form Validation (NON-NEGOTIABLE) | ✅ PASS | Client-side validation unchanged |
| IV. Cross-Platform Compatibility | ✅ PASS | Web3Forms is browser-agnostic |
| V. Graceful Degradation | ✅ PASS | New error handling and retry logic enhance reliability |

**Result**: All gates PASS. No violations requiring complexity tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-web3forms-migration/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (this file)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── web3forms-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── services/
│   └── webhook.ts       # Modify to use Web3Forms instead of Pabbly
├── hooks/
│   └── useWebhook.ts    # Update to track submission state in localStorage
├── utils/
│   └── errorLogging.ts  # Enhance with rate limit logging
├── types/
│   └── webhook.ts       # Add submission state types
tests/
└── e2e/
    └── web3forms.spec.ts # New E2E tests for Web3Forms integration
```

**Structure Decision**: Single project structure. Feature modifies existing files only. No new directories required in src/.

## Complexity Tracking

No constitution violations. Feature is a direct replacement of one webhook provider with another, using existing patterns.

---

# Phase 0: Research

## Web3Forms API Integration Research

**Decision**: Use Web3Forms REST API endpoint with JSON payload

**Rationale**: Web3Forms provides a simple REST API that accepts form submissions via POST request. The API requires an access key in the request body (not headers) to prevent exposure in network logs. This approach:

- Leverages existing fetch-based submission logic
- Maintains the same payload structure as Pabbly
- Provides clear success/failure response codes
- Supports error responses for rate limiting and validation errors

**Web3Forms API Details**:
- Endpoint: `https://api.web3forms.com/submit`
- Method: POST
- Content-Type: application/json
- Required field: `access_key` with the provided API key
- Response: JSON with `success` boolean and optional `message`

**Alternatives Considered**:
- Using Web3Forms client library: Rejected - adds unnecessary dependency
- Server-side proxy: Rejected - introduces complexity; Web3Forms supports direct browser submissions

## Browser Storage for Submission State

**Decision**: Use localStorage with session-based state management

**Rationale**: The requirement is to track submission state (pending/sent/failed) to enable retry of failed submissions. localStorage provides:

- Persistent storage across browser sessions
- Simple API (getItem/setItem/removeItem)
- Sufficient for single-browser use case
- No server infrastructure required

**Implementation approach**:
- Store submission state keyed by order ID
- Include timestamp for expiration management
- Clear successful submissions after user acknowledgment
- Preserve failed submissions for retry capability

**Alternatives Considered**:
- sessionStorage: Rejected - data lost on tab close, reducing reliability
- IndexedDB: Rejected - excessive complexity for simple state tracking

## Error Logging for Rate Limits

**Decision**: Enhance existing errorLogging utility with Web3Forms-specific log entries

**Rationale**: The constitution requires observability for rate limit errors. Extending the existing errorLogging utility:

- Maintains consistency with existing logging patterns
- Provides centralized log management
- Supports future observability tool integration (e.g., Sentry)

---

# Phase 1: Design

## Data Model

See `data-model.md` for entity definitions.

## API Contracts

See `contracts/web3forms-api.md` for submission endpoint specification.

## Quickstart Guide

See `quickstart.md` for development setup instructions.
