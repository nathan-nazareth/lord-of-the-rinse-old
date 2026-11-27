# Quickstart: Web3Forms Migration

This guide helps developers set up and understand the Web3Forms integration for the Organic Soap Builder project.

## Prerequisites

- Node.js 18+ with npm or bun
- Git
- Web3Forms API key (already provided: `<your-web3forms-access-key>`)

## Setup

### 1. Clone and Install

```bash
git checkout 001-web3forms-migration
npm install
```

### 2. Configure Environment

Create `.env.local` with the Web3Forms access key:

```bash
echo "VITE_WEB3FORMS_ACCESS_KEY=<your-web3forms-access-key>" > .env.local
```

### 3. Start Development Server

```bash
npm run dev
```

## Key Files to Modify

| File | Changes |
|------|---------|
| `src/services/webhook.ts` | Replace legacy webhook URL with Web3Forms endpoint, update payload structure |
| `src/hooks/useWebhook.ts` | Add localStorage state tracking, update submission flow |
| `src/utils/errorLogging.ts` | Add Web3Forms-specific error logging |
| `src/types/webhook.ts` | Add SubmissionState type and localStorage interfaces |

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui
```

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Testing the Integration

### Manual Testing

1. Navigate to the soap customization form
2. Fill in all required fields (scent, color, quantity, contact)
3. Submit the form
4. Verify success message appears
5. Check Web3Forms dashboard for received submission

### Error Scenario Testing

1. Fill the form
2. Simulate network failure (DevTools > Network > Offline)
3. Submit the form
4. Verify error message appears
5. Restore network, retry submission
6. Verify form data is preserved

### Rate Limit Testing

1. Submit multiple orders rapidly (5+ in 1 minute)
2. Verify "Service busy" message appears
3. Verify retry works after delay

## API Reference

### Web3Forms Endpoint

- **URL**: `https://api.web3forms.com/submit`
- **Method**: POST
- **Content-Type**: application/json

### Payload Structure

See `contracts/web3forms-api.md` for full specification.

## Troubleshooting

### Submission Fails with 401

- Verify access key is correct in `.env.local`
- Ensure key starts with `VITE_` prefix
- Restart dev server after changing `.env.local`

### Rate Limits Not Being Handled

- Check browser console for rate limit warnings
- Verify errorLogging utility is being called
- Ensure localStorage is enabled (not blocked by privacy settings)

### Form Data Not Preserved on Error

- Check browser storage quota (localStorage limited to ~5MB)
- Verify no JavaScript errors in console
- Test in incognito mode to rule out extensions

## Success Criteria

- [ ] 95% of submissions succeed (SC-001)
- [ ] Feedback within 5 seconds (SC-002)
- [ ] Zero orders lost (SC-003)
- [ ] Business owner receives orders (SC-004)
