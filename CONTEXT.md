# CONTEXT.md

Project terminology, architectural decisions, and domain language for "Lord of the Rinse."

## Glossary

### Command palette

Global Cmd+K / Ctrl+K overlay (Suite Gap #8). Powered by `cmdk`. Renders searchable commands from `useCommandStore`.

### Command registration

Modules call `register({ id, label, action, surface? })` on the Zustand store. Each command carries a `surface` field (`'storefront' | 'admin'`) so the palette can render grouped commands and filter empty groups. Modules `unregister` on cleanup.

### Surface

A deployment context for commands. `storefront` covers the customer-facing app; `admin` covers the admin dashboard at `/admin`. v1 ships the registration API and palette UI; product commands for each surface land independently.

## Decisions

### 2026-05-21 — Admin lives in `packages/app` at `/admin`

- **Context:** Issue #59 (Better Auth) grooming found `packages/api` did not exist despite #57 being closed. Option A confirmed: backend-first auth requiring `packages/api` workspace.
- **Decision:** Admin dashboard lives at `/admin` within `packages/app/src/routes/admin.tsx` (not a separate workspace). Auth middleware and session handling live in `packages/api`.
- **Consequence:** #59 blocked until #57 and #58 are implemented. #74–#82 track child work. All admin routes protected; first-user-only signup enforced.

### 2026-05-21 — Command palette proceeds in parallel with admin PRD

- **Context:** Issue #44 was paused pending PRD #56 (admin dashboard). Grooming HITL confirmed cmdk infrastructure does not depend on admin routes.
- **Decision:** Palette infra proceeds in parallel. `useCommandStore` supports dual-surface registration from day one. Admin product commands land when admin routes exist.
- **Consequence:** #44–#47 are unblocked. #56 body updated to reflect this.
