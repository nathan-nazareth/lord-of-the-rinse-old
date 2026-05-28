# Quickstart: Admin Login Bug Fix

## Testing the Fix

### Manual API Testing

**Direct API (localhost:3001):**
```bash
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"3984"}'
```

Expected response:
```json
{"token":"admin-3984"}
```

**Via Vite Proxy (localhost:3000):**
```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"3984"}'
```

Expected response:
```json
{"token":"admin-3984"}
```

### Automated Testing

Run the test suite:
```bash
bun run test
```

Run e2e tests:
```bash
bun run test:e2e
```

## Files Changed

1. `packages/api/src/routes/admin-auth.ts` - Added `async` keyword to route handler
2. `packages/app/src/routes/admin/*.tsx` - Accessibility fixes (htmlFor, type="button")
3. `packages/app/src/hooks/useAdminCatalog.ts` - Simplified computed property access

## Verification Checklist

- [ ] Direct API returns 200 with token
- [ ] Vite proxy returns 200 with token
- [ ] Invalid password returns 401
- [ ] Keyboard navigation works on login form
- [ ] Submit buttons don't trigger unintended form submissions