# Quickstart: Admin Catalog Management

## Prerequisites

- Node.js 22+ / Bun
- Project dependencies installed (`bun install` from root)
- Existing PostgreSQL running for the main app (if needed alongside admin)
- Admin SQLite database will be auto-created by the API on first run

## Development Setup

```bash
# 1. Generate SQLite schema & push to DB
bun run --filter @lotr/db admin:generate
bun run --filter @lotr/db admin:push

# 2. Start the API server (with admin routes)
bun run --filter @lotr/api dev

# 3. Start the frontend dev server
bun run --filter @lotr/app dev
```

The admin panel is at `http://localhost:3000/admin` — enter password `3984` to log in.

## Admin Password

Default: `3984`

Set via environment variable in `packages/api/.env`:
```
ADMIN_PASSWORD=3984
```

## Test Scenarios

### Manual Testing Checklist

| Scenario | Steps | Expected |
|----------|-------|----------|
| Admin login | Navigate to /admin, enter password 3984, click Login | Dashboard tab visible with admin navigation |
| Wrong password | Enter incorrect password | Error message shown, no access granted |
| Add product | Products tab → Fill form → Submit | Product appears in list |
| Remove product | Products tab → Click remove on a product | Product removed from list |
| Update price bounds | Options tab → Change min/max price → Save | Bounds enforced on product add/edit |
| Update size range | Options tab → Change min/max size → Save | Bounds enforced on product add/edit |
| Create discount | Discounts tab → Add discount percentage → Save | Discount appears in list |
| Delete discount | Discounts tab → Delete a discount | Discount removed |
| Dashboard navigation | Click Dashboard tab | Redirect to public homepage |

### Running Existing Tests

```bash
bun run test          # Unit tests
bun run test:e2e      # Playwright E2E tests
```
