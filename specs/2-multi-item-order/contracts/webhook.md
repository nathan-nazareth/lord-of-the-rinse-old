# Webhook API Contract (Multi-Item)

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
| name | string | Yes | Customer's full name |
| email | string | Yes | Customer's email address |
| phone | string | Yes | Customer's phone number |

**Note**: All three fields are required for multi-item orders.

#### Items Array

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique product identifier (UUID v4) |
| scent | string | Yes | Selected scent option |
| customScent | string | No | Custom scent description (empty if not custom) |
| color | string | Yes | Selected color |
| quantity | number | Yes | Number of units (1-20 per item) |

**Constraints**:
- Minimum 1 item in array
- Maximum 20 items in array
- Total quantity across all items: unlimited

---

### Success Response

**Code**: `200 OK` or `2xx`

**Body**: None required (webhook acknowledged)

---

### Error Responses

#### Client Errors (4xx)

| Code | Description |
|------|-------------|
| 400 | Malformed JSON or invalid field types |
| 401 | Missing or invalid authentication |
| 403 | Forbidden - endpoint access denied |
| 422 | Valid JSON but invalid field values (e.g., missing required fields) |

#### Server Errors (5xx)

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

---

### Example Requests

#### Single Item

```json
{
  "customer": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1-555-123-4567"
  },
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "scent": "Lavender",
      "customScent": "",
      "color": "Purple",
      "quantity": 3
    }
  ]
}
```

#### Multiple Items (Multi-Item Order)

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
      "color": "Red",
      "quantity": 5
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
      "scent": "Cinnamon",
      "customScent": "",
      "color": "White",
      "quantity": 2
    },
    {
      "id": "c3d4e5f6-a7b8-9012-cdef-345678901234",
      "scent": "Custom",
      "customScent": "Turmeric & Honey",
      "color": "Orange",
      "quantity": 1
    }
  ]
}
```

---

### Backward Compatibility

This contract extends the single-item webhook with support for multiple items:

| Version | items array | Notes |
|---------|-------------|-------|
| v1 (single-item) | 1 item | Original format |
| v2 (multi-item) | 1-20 items | New format, backward compatible |

**Note**: Pabbly workflows designed for single-item will need to be updated to handle the items array.
