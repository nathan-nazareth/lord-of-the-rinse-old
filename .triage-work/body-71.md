## Parent

- #56

## What to build

Derived production queue view grouped by variant from order lines with `quantity_to_produce > 0`.

## Acceptance criteria

- [ ] Production page groups variants with aggregated demand
- [ ] Only `new` and `processing` orders included
- [ ] Expandable detail per variant with order references
- [ ] Empty state when no demand
- [ ] Existing tests still pass

## Blocked by

- #68 - Admin orders must exist
- #43 - Shell for admin UI
- #56 - PRD parent coordination
