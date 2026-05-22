## Parent

- #56

## What to build

Configure Better Auth with first-user-only signup flow for the admin.

## Acceptance criteria

- [ ] Better Auth is configured
- [ ] First-user-only signup is enforced
- [ ] Subsequent signup attempts are rejected
- [ ] Admin routes are protected
- [ ] Existing tests still pass

## Blocked by

- #56 - PRD parent; foundation and suite gaps must be cleared
- #57 - Hono API scaffold (closed — verify `packages/api` exists or reopen)
- #58 - Drizzle schemas (closed — verify drizzle in repo or reopen)
- #36 - shadcn/ui parent

## Questions for grooming

- #57 and #58 are closed but triage found no API/drizzle in the codebase. Should those issues be reopened before this ticket proceeds?
