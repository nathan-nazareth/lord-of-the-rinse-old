## Parent

- #56

## What to build

Order cancellation with automatic stock restock for `new` and `processing` orders.

## Acceptance criteria

- [ ] Cancel available only for `new` or `processing`
- [ ] Restocks `allocated_from_stock`; records `cancellation_restock` movements
- [ ] Does not restock `quantity_to_produce` lines
- [ ] Confirmation dialog before cancel
- [ ] Existing tests still pass

## Blocked by

- #68 - Admin order detail and status management
- #56 - PRD parent coordination
