# Quickstart: Webhook Order Submission

This guide helps developers set up and test the webhook integration feature.

## Prerequisites

- Node.js 18+ or Bun 1.0+
- Git
- Access to modify `.env.local`

## Setup

### 1. Configure Environment

Create or update `.env.local` in the repository root:

```bash
# Pabbly webhook endpoint (includes authentication token)
VITE_PABBLY_WEBHOOK_URL=https://connect.pabbly.com/workflow/sendwebhookdata/***REMOVED***
```

**Important**: Never commit this file to version control. The `.gitignore` should include:
```
.env.local
.env.*.local
```

### 2. Install Dependencies

```bash
bun install
# or
npm install
```

### 3. Start Development Server

```bash
bun run dev
# or
npm run dev
```

The app will be available at `http://localhost:3000`

## Testing

### Manual Testing

1. Open the app in a browser
2. Complete all form steps:
   - Select a scent (e.g., Lavender)
   - Select a color (e.g., Purple)
   - Enter quantity (e.g., 3)
   - Enter contact info (email or phone)
3. Click "Draft Order in Email"
4. Verify in browser DevTools:
   - Network tab shows POST request to Pabbly
   - Console shows webhook success log
5. Check Pabbly workflow for received data

### Browser DevTools Verification

**Network Tab**:
- Request URL: Configured webhook URL
- Request Method: POST
- Status: 200 (success)
- Response: Empty or acknowledgment

**Console**:
```
[Webhook] Order submitted: { orderId: "...", status: 200, timestamp: "...", attempt: 1 }
```

### Testing Error Scenarios

1. **Network Offline**: Disconnect internet, submit order, verify error message
2. **Invalid URL**: Set wrong webhook URL, verify graceful failure
3. **Timeout**: (Hard to simulate) - observe retry behavior

## Architecture

```
src/
├── types/
│   └── webhook.ts          # TypeScript interfaces
├── services/
│   └── webhook.ts          # Webhook submission logic
├── hooks/
│   └── useWebhook.ts       # React hook for webhook
└── components/
    └── SoapForm.tsx        # Updated with webhook call
```

## Key Files

| File | Purpose |
|------|---------|
| `src/types/webhook.ts` | TypeScript types for payload and response |
| `src/services/webhook.ts` | Webhook submission with retry logic |
| `src/hooks/useWebhook.ts` | React hook for component integration |
| `src/components/SoapForm.tsx` | Updated form with webhook trigger |

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_PABBLY_WEBHOOK_URL` | Yes | Full webhook URL including token |

## Troubleshooting

### Webhook Not Firing

1. Check browser console for errors
2. Verify `VITE_PABBLY_WEBHOOK_URL` is set correctly
3. Ensure form is valid (all required fields filled)
4. Check network tab for blocked requests

### CORS Errors

The webhook endpoint must allow cross-origin requests from your dev server. Pabbly webhooks typically do not enforce CORS restrictions.

### Token Issues

If webhook fails with 401/403:
1. Regenerate webhook URL in Pabbly
2. Update `VITE_PABBLY_WEBHOOK_URL`
3. Restart dev server

## Deployment

### Build

```bash
bun run build
# or
npm run build
```

### Environment Variables

Set `VITE_PABBLY_WEBHOOK_URL` in your deployment platform:
- Vercel: Environment Variables in project settings
- Netlify: Site settings > Environment variables
- Docker: Passed via `--env-file` or `-e`

### Production Verification

1. Deploy build output
2. Test order submission in production
3. Verify Pabbly receives data
4. Check production logs for webhook status
