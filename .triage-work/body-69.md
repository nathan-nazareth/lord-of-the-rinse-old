## Parent

- #56

## What to build

Async Web3Forms notification dispatch with retry from admin order detail.

## Acceptance criteria

- [ ] Async dispatch after checkout; order response not blocked
- [ ] Notification attempts tracked in DB with retry endpoint
- [ ] Respects `web3forms_enabled` setting
- [ ] Existing tests still pass

## Blocked by

- #67 - Checkout creates orders and notification attempts
- #68 - Admin order detail for retry UI
- #56 - PRD parent coordination
