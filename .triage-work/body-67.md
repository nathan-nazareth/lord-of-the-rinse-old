## Parent

- #56

## What to build

Refactor cart to variant snapshots; implement `POST /api/checkout` with stock allocation, order reference, notification attempt; update checkout/confirmation pages; add ADR for Postgres as source of truth.

## Acceptance criteria

- [ ] Cart items store `variantId`, `quantity`, `displayName`, `unitPrice`
- [ ] `POST /api/checkout` implements full checkout engine per PRD
- [ ] Stock allocation, movements, and order reference `LOR-YYYYMMDD-NNNN` work
- [ ] Checkout page posts to `/api/checkout`; confirmation shows order reference
- [ ] ADR exists in `docs/adr/`
- [ ] Existing tests still pass

## Blocked by

- #66 - Catalog-driven storefront and cart format
- #56 - PRD parent coordination
