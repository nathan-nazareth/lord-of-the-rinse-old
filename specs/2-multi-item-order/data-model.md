# Data Model: Multi-Item Order Cart

## Entities

### CartItem

Represents a single soap product in the cart with its customization options.

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| id | string | Yes | UUID v4 format | Unique identifier for this cart item |
| scent | string | Yes | Enum value | Selected scent (Lavender, Coffee, Clove, Cinnamon, Lemongrass, Custom) |
| customScent | string | No | Max 200 chars | User's custom scent description (only if scent="Custom") |
| color | string | Yes | Enum value | Selected soap color (White, Red, Orange, Yellow, Green, Blue, Purple) |
| quantity | number | Yes | Positive integer (1-20) | Number of soaps ordered |
| addedAt | string | Yes | ISO 8601 timestamp | When the item was added to cart |

---

### Cart

Collection of CartItems with computed totals.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| items | CartItem[] | Yes | Array of cart items |
| totalQuantity | number | Yes | Computed sum of all item quantities |
| updatedAt | string | Yes | ISO 8601 timestamp of last modification |

**Computed**: `totalQuantity` = sum of all `item.quantity`

---

### Customer

Customer contact information for order processing.

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| name | string | Yes | Min 2 chars, max 100 chars | Customer's full name |
| email | string | Yes | Email format | Customer's email address |
| phone | string | Yes | Phone format | Customer's phone number |

---

### Order

Complete order with customer and all items.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| customer | Customer | Yes | Customer contact information |
| items | CartItem[] | Yes | All items from cart at checkout |
| submittedAt | string | Yes | ISO 8601 timestamp when order was submitted |

---

### WebhookPayload

Structure sent to Pabbly webhook endpoint.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| customer | Customer | Yes | Customer information object |
| items | CartItem[] | Yes | Array of all ordered items |

---

## Validation Rules

### CartItem Validation

1. **id**: Must be valid UUID v4
2. **scent**: Must be one of: Lavender, Coffee, Clove, Cinnamon, Lemongrass, Custom
3. **customScent**: Required only if scent="Custom", max 200 chars
4. **color**: Must be one of: White, Red, Orange, Yellow, Green, Blue, Purple
5. **quantity**: Must be integer between 1 and 20

### Cart Validation

1. **items**: Array must have minimum 1 item
2. **items**: Maximum 20 items per cart
3. **totalQuantity**: Sum of all item quantities

### Checkout Validation

1. **cart**: Must have at least 1 item before checkout
2. **customer.name**: Required, 2-100 characters
3. **customer.email**: Required, valid email format
4. **customer.phone**: Required, valid phone format

---

## Cart Lifecycle

```
empty → item_added → item_removed → ... → checkout → empty
         ↑                                            |
         |____________________________________________|
                   (preserve across refresh)
```

---

## State Transitions

| Current State | Event | Next State |
|---------------|-------|------------|
| empty | Add item | has_items |
| has_items | Add another item | has_items |
| has_items | Remove item (1 left) | empty |
| has_items | Remove item (2+ left) | has_items |
| has_items | Clear all | empty |
| has_items | Checkout | submitted |
| any | Page refresh | (preserve state from localStorage) |

---

## Storage Format

### localStorage Key

```
organic-soap-cart
```

### localStorage Value (JSON)

```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "scent": "Lavender",
      "customScent": "",
      "color": "Red",
      "quantity": 5,
      "addedAt": "2026-01-03T14:30:00Z"
    }
  ],
  "updatedAt": 1704292200000
}
```

### Expiry

- **TTL**: 30 days from `updatedAt`
- **Behavior**: Clear cart if expired on load

---

## Example Data

### Sample Cart

```json
{
  "items": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "scent": "Lavender",
      "customScent": "",
      "color": "Red",
      "quantity": 5,
      "addedAt": "2026-01-03T14:30:00Z"
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
      "scent": "Cinnamon",
      "customScent": "",
      "color": "White",
      "quantity": 2,
      "addedAt": "2026-01-03T14:35:00Z"
    }
  ],
  "updatedAt": 1704292500000
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
      "color": "Red",
      "quantity": 5
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
      "scent": "Cinnamon",
      "customScent": "",
      "color": "White",
      "quantity": 2
    }
  ]
}
```
