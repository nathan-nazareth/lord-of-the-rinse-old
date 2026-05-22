## Parent

- #56

## What to build

Create `GET /api/catalog` — a public (unauthenticated) endpoint that returns everything the storefront needs to render the soap builder.

## Acceptance criteria

- [ ] `GET /api/catalog` is accessible without authentication
- [ ] Response includes enabled attributes grouped by type
- [ ] Response includes enabled, non-archived variants with unit prices
- [ ] Response includes public settings
- [ ] Response does NOT include stock-on-hand or admin-only data
- [ ] Response is validated against the shared Zod catalog schema
- [ ] Existing tests still pass

## Blocked by

- #64 - Variants and stock data must exist
- #57 - API server scaffold (verify or reopen)
- #56 - PRD parent coordination
