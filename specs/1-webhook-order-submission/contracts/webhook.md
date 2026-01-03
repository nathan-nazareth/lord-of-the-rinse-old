# Webhook API Contract

## Endpoint: Pabbly Webhook

### Request

**URL**: `POST {PABBLY_WEBHOOK_URL}`

**Headers**:
```
Content-Type: application/json
Accept: application/json
```

### Request Body

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
      "quantity": 0
    }
  ]
}
```

### Field Descriptions

#### Customer Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Customer's full name |
| email | string | No | Customer's email address |
| phone | string | No | Customer's phone number |

**Note**: At least one contact field must be present.

#### Item Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique product identifier (UUID) |
| scent | string | Yes | Selected scent option (Lavender, Coffee, Clove, Cinnamon, Lemongrass, or Custom) |
| customScent | string | No | Custom scent description (empty string if not custom) |
| color | string | Yes | Selected color (White, Red, Orange, Yellow, Green, Blue, Purple) |
| quantity | number | Yes | Number of units (positive integer) |

---

### Success Response

**Code**: `200 OK` or `2xx`

**Body**: None required (webhook acknowledged)

---

### Error Responses

#### Client Errors (4xx)

```json
{
  "error": "Bad Request",
  "message": "Invalid payload structure"
}
```

| Code | Description |
|------|-------------|
| 400 | Malformed JSON or invalid field types |
| 401 | Missing or invalid authentication (if endpoint requires) |
| 403 | Forbidden - endpoint access denied |
| 422 | Valid JSON but invalid field values |

#### Server Errors (5xx)

```json
{
  "error": "Internal Server Error",
  "message": "Temporary failure - please retry"
}
```

| Code | Description |
|------|-------------|
| 500 | Internal server error |
| 502 | Bad gateway (Pabbly service issue) |
| 503 | Service unavailable |
| 504 | Gateway timeout |

---

### Retry Strategy

| Attempt | Delay | Cumulative |
|---------|-------|------------|
| 1 | 0s | 0s |
| 2 | 1s | 1s |
| 3 | 2s | 3s |
| 4 (final) | 4s | 7s |

**Timeout per request**: 10 seconds

**Total maximum wait**: ~17 seconds (including 4s final attempt timeout)

---

### Security Considerations

1. **URL contains token**: The webhook URL includes an authentication token in the path
2. **Store securely**: Use environment variable (`VITE_PABBLY_WEBHOOK_URL`)
3. **Never commit**: Add `.env*` to `.gitignore`
4. **Rotate periodically**: Update token if compromised

---

### Example Requests

#### Minimal Valid Request

```json
{
  "customer": {
    "email": "customer@example.com"
  },
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "scent": "Lavender",
      "customScent": "",
      "color": "Purple",
      "quantity": 1
    }
  ]
}
```

#### Full Request

```json
{
  "customer": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1-555-123-4567"
  },
  "items": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "scent": "Lavender",
      "customScent": "",
      "color": "Purple",
      "quantity": 3
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
      "scent": "Custom",
      "customScent": "Turmeric & Honey",
      "color": "Orange",
      "quantity": 2
    }
  ]
}
```
