## Parent

- #56

## What to build

Replace hardcoded soap enums and static `SoapForm` with a catalog-driven variant selector via `GET /api/catalog`. Handle shop-closed state and legacy cart clearing per PRD.

## Acceptance criteria

- [ ] Storefront fetches `GET /api/catalog` on load
- [ ] SoapForm renders attribute options from API response (not hardcoded enums)
- [ ] Selecting attributes filters to matching variants and shows price
- [ ] Free numeric size input is removed; sizes come from variant attribute options
- [ ] When no variant matches, show "not available"
- [ ] When `shop_open: false` or no enabled variants, show shop-closed message
- [ ] Legacy localStorage cart items (old format) are detected and cleared with toast
- [ ] Existing tests still pass (updated for new data flow)

## Blocked by

- #65 - Public catalog API must return data
- #56 - PRD parent coordination
