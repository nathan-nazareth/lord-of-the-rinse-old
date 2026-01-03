# Research: Webhook Order Submission

## Decision: Webhook Implementation Approach

**Decision**: Use browser fetch API with retry logic for webhook submission

**Rationale**:
- No server-side infrastructure required - runs entirely client-side
- Fetch API is native to all modern browsers (Chrome, Firefox, Safari, Edge)
- Environment variables can be accessed via Vite's `import.meta.env`
- Retry logic with exponential backoff ensures reliability without overwhelming the endpoint

**Alternatives Considered**:
- Server-side proxy: Requires backend infrastructure, adds latency, more complex deployment
- Third-party webhook SDK: Overkill for single-endpoint integration, adds dependency weight
- Service Worker: Overly complex for this use case, browser support varies

---

## Decision: Environment Variable Handling

**Decision**: Store webhook URL in `VITE_PABBLY_WEBHOOK_URL` environment variable

**Rationale**:
- Vite prefixes client-side env vars with `VITE_` for security
- Environment variables prevent credential exposure in version control
- Allows different webhook endpoints per deployment environment
- Standard practice for React/Vite applications

**Implementation**:
```
# .env.local
VITE_PABBLY_WEBHOOK_URL=https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjcwNTZkMDYzZTA0MzQ1MjY5NTUzMzUxMzQi_pc
```

**Access in code**:
```typescript
const webhookUrl = import.meta.env.VITE_PABBLY_WEBHOOK_URL;
```

---

## Decision: Retry Strategy

**Decision**: 3 retries with exponential backoff (1s, 2s, 4s delays)

**Rationale**:
- Exponential backoff reduces server load during outages
- 3 attempts balance reliability with user wait time
- Maximum total wait time: ~7 seconds (1+2+4) before final error
- Industry standard pattern for client-side API calls

**Algorithm**:
```typescript
const delay = Math.pow(2, attempt) * 1000; // 1000ms, 2000ms, 4000ms
await new Promise(resolve => setTimeout(resolve, delay));
```

---

## Decision: Payload Structure

**Decision**: Use the exact JSON structure specified in requirements

**Rationale**:
- Pabbly expects specific field names for workflow triggers
- Consistent with existing order data model
- Easy to validate and debug

**Payload Schema**:
```json
{
  "customer": {
    "name": "string",
    "email": "string",
    "phone": "string"
  },
  "items": [
    {
      "id": "string",
      "scent": "string",
      "customScent": "string",
      "color": "string",
      "quantity": "number"
    }
  ]
}
```

---

## Decision: Error Handling Strategy

**Decision**: Show user-friendly error with fallback instructions after all retries exhausted

**Rationale**:
- User needs to know if order submission may have failed
- Fallback maintains mailto option for order completion
- Clear instructions prevent user confusion
- Aligns with Graceful Degradation principle

**User Messages**:
- Success: "Order submitted successfully!"
- Retry in progress: "Sending order..."
- Final failure: "There was an issue submitting your order. Please send it manually using the email button below."

---

## Decision: Logging and Monitoring

**Decision**: Console logging with order ID, status code, and timestamp

**Rationale**:
- Sufficient for debugging in development
- No external monitoring infrastructure required
- Can be enhanced with analytics service later if needed

**Log Format**:
```typescript
console.log('[Webhook] Order submitted:', {
  orderId: order.id,
  status: response.status,
  timestamp: new Date().toISOString(),
  attempt: attemptNumber
});
```

---

## Decision: Integration Point

**Decision**: Trigger webhook in `handleDraftClick()` before/alongside mailto link

**Rationale**:
- Already the action triggered on submit button click
- Minimal changes to existing component logic
- Maintains fallback mailto behavior
- User experience remains consistent

**Implementation**:
```typescript
const handleDraftClick = async () => {
  setShowFallback(true);
  await submitWebhook(formData); // Non-blocking but waits for completion
};
```

---

## Technology Compatibility

| Aspect | Compatibility |
|--------|---------------|
| fetch API | All modern browsers (Chrome 42+, Firefox 39+, Safari 10+, Edge 14+) |
| import.meta.env | Vite 2.0+ (all supported browsers) |
| async/await | All modern browsers (no transpilation needed for target browsers) |
| Error boundaries | React 16+ (current: 19.2.3) |
