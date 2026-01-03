# Data Model: Webhook Order Submission

## Entities

### Order

Represents a complete customer order with all customization details.

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| id | string | Yes | UUID v4 format | Unique identifier for the order |
| customer | Customer | Yes | Valid customer object | Customer contact information |
| items | OrderItem[] | Yes | Min 1 item | Array of soap products ordered |
| submittedAt | string | Yes | ISO 8601 timestamp | When the order was submitted |
| status | OrderStatus | Yes | Valid status | Current order processing status |

---

### Customer

Customer contact information for order processing.

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| name | string | No | Max 100 chars | Customer's full name |
| email | string | No | Email format | Customer's email address |
| phone | string | No | Phone format | Customer's phone number |

**Note**: At least one of email or phone must be provided (enforced by form validation).

---

### OrderItem

A single soap product in the order with customization options.

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| id | string | Yes | UUID v4 | Unique identifier for this item |
| scent | string | Yes | Enum or custom text | Selected scent (Lavender, Coffee, etc.) or "Custom" |
| customScent | string | No | Max 200 chars | User's custom scent description (only if scent="Custom") |
| color | string | Yes | Enum value | Selected soap color |
| quantity | number | Yes | Positive integer | Number of soaps ordered |

**Scent Enum Values**:
- Lavender
- Coffee
- Clove
- Cinnamon
- Lemongrass
- Custom

**Color Enum Values**:
- White
- Red
- Orange
- Yellow
- Green
- Blue
- Purple

---

### WebhookPayload

Structure sent to Pabbly webhook endpoint.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| customer | Customer | Yes | Customer information object |
| items | OrderItem[] | Yes | Array of ordered items |

---

### OrderStatus

Possible states for order processing.

| Value | Description |
|-------|-------------|
| pending | Order submitted, webhook not yet attempted |
| submitting | Webhook in progress |
| submitted | Webhook completed successfully |
| failed | All webhook retries exhausted |
| manual | Order completed via mailto fallback |

---

## Validation Rules

### Form-Level Validation (Pre-Submission)

1. **Scent**: Must have exactly one selection
   - If "Custom" selected, `customScent` must be non-empty
2. **Color**: Must have exactly one selection
3. **Quantity**: Must be positive integer > 0
4. **Contact**: Must have at least one of email or phone format

### Webhook Payload Validation

1. **Customer**: Object must contain at least one valid contact field
2. **Items**: Array must have minimum 1 item
3. **Item fields**: All required fields must be non-null/undefined

---

## State Transitions

```
pending → submitting (user clicks submit)
submitting → submitted (webhook succeeds)
submitting → failed (all retries exhausted)
submitted → manual (user completes via mailto)
pending → manual (user skips webhook, uses mailto)
```

---

## Example Data

### Sample Order

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
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
  ],
  "submittedAt": "2026-01-03T14:30:00Z",
  "status": "submitted"
}
```

### Sample Webhook Payload

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
