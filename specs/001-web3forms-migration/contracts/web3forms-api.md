# Web3Forms API Contract

## Overview

This document specifies the API contract for submitting soap orders to Web3Forms.

## Endpoint

**URL**: `https://api.web3forms.com/submit`
**Method**: `POST`
**Content-Type**: `application/json`

## Request Structure

### Headers

| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| access_key | string | Yes | Web3Forms API key |
| customer_name | string | Yes | Customer full name |
| customer_email | string | Yes | Customer email address |
| customer_phone | string | No | Customer phone number |
| order_items | array | Yes | Array of ordered products |
| total_quantity | number | Yes | Total number of items |
| subtotal | number | Yes | Order subtotal |
| discount_percentage | number | Yes | Applied discount percentage |
| discount_amount | number | Yes | Discount value |
| final_total | number | Yes | Order total |
| order_id | string | Yes | Unique order identifier |
| submission_timestamp | string | Yes | ISO 8601 timestamp |

### Example Request

```json
{
  "access_key": "7e8863fb-c99e-4cf3-bdc9-a42fd07bfe91",
  "customer_name": "Jane Doe",
  "customer_email": "jane@example.com",
  "customer_phone": "+1-555-123-4567",
  "order_items": [
    {
      "id": "lavender-soap-001",
      "scent": "Lavender",
      "color": "Purple",
      "price": 12.00,
      "quantity": 2
    }
  ],
  "total_quantity": 2,
  "subtotal": 24.00,
  "discount_percentage": 0,
  "discount_amount": 0,
  "final_total": 24.00,
  "order_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "submission_timestamp": "2026-01-26T10:30:00.000Z"
}
```

## Response Structure

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Form submitted successfully",
  "data": {
    "order_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

### Error Responses

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "customer_email",
      "message": "Invalid email format"
    }
  ]
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Invalid access key"
}
```

**429 Too Many Requests**:
```json
{
  "success": false,
  "message": "Rate limit exceeded. Please try again later."
}
```

**500 Server Error**:
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Rate Limiting

Web3Forms applies rate limits to prevent abuse. Expected behavior:

- **429 Response**: Indicates rate limit exceeded
- **Retry Behavior**: Implement exponential backoff (1s, 2s, 4s, 8s)
- **Max Retries**: 3 attempts total per submission
- **User Feedback**: Display "Service busy, please wait and retry"

## Security Considerations

1. **Access Key Protection**: The access key is sent in the request body, not headers, to reduce exposure in server logs
2. **No Sensitive Data**: Do not include payment information or passwords
3. **Input Validation**: Validate all fields client-side before submission

## Client-Side Handling

### Success Case

1. Parse response for `success: true`
2. Update submission state to `sent`
3. Display success confirmation to user
4. Clear form data from browser storage
5. Log success to server (for monitoring)

### Error Cases

| Error Type | Handling |
|------------|----------|
| 400 Validation | Show specific field errors, allow correction |
| 401 Invalid Key | Log critical error, show "Service unavailable" |
| 429 Rate Limit | Log warning, show "Service busy, please wait and retry", enable retry |
| 500+ Server | Log error, preserve form data, enable retry |

### Retry Logic

```typescript
async function submitWithRetry(payload: SubmissionPayload): Promise<SubmissionResult> {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(WEB3FORMS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        return { success: true, orderId: payload.order_id };
      }

      if (response.status === 429 && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await sleep(delay);
        continue;
      }

      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (attempt === maxRetries) {
        return { success: false, orderId: payload.order_id };
      }
      await sleep(baseDelay * Math.pow(2, attempt - 1));
    }
  }

  return { success: false, orderId: payload.order_id };
}
```
