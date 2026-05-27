# API Contracts: Admin Catalog Management

## Authentication

All admin endpoints require authentication via session cookie. Unauthenticated requests return `401 Unauthorized`.

## Endpoints

### Products

#### GET /api/admin/products

List all products (including disabled).

**Response** `200 OK`:
```json
{
  "products": [
    {
      "id": "prod_abc123",
      "name": "Organic Lavender Soap",
      "description": "Calming lavender essential oil soap",
      "basePrice": 1299,
      "minWeight": 50,
      "maxWeight": 500,
      "enabled": true,
      "options": [
        { "optionId": "opt_xyz", "extraPrice": 200 }
      ],
      "createdAt": "2026-01-15T10:30:00Z",
      "updatedAt": "2026-05-20T14:22:00Z"
    }
  ]
}
```

#### GET /api/admin/products/:id

Get single product details.

**Response** `200 OK`: Same product object
**Response** `404 Not Found`: Product does not exist

#### PUT /api/admin/products/:id

Update product. All fields optional.

**Request**:
```json
{
  "name": "New Name",
  "description": "New description",
  "basePrice": 1499,
  "minWeight": 75,
  "maxWeight": 600,
  "enabled": true
}
```

**Response** `200 OK`: Updated product object
**Response** `400 Bad Request`: Validation error
**Response** `401 Unauthorized`: Not authenticated
**Response** `403 Forbidden`: Not admin role

#### POST /api/admin/products

Create new product.

**Request**:
```json
{
  "name": "New Product",
  "description": "Description",
  "basePrice": 1299,
  "minWeight": 50,
  "maxWeight": 500,
  "enabled": true
}
```

**Response** `201 Created`: New product object
**Response** `400 Bad Request`: Validation error

---

### Catalog Options

#### GET /api/admin/options

List all options with optional type filter.

**Query params**:
- `type`: filter by scent, color, or shape

**Response** `200 OK`:
```json
{
  "options": [
    {
      "id": "opt_xyz",
      "type": "scent",
      "name": "Lavender",
      "slug": "lavender",
      "description": "Calming lavender fragrance",
      "hexValue": null,
      "displayOrder": 1,
      "enabled": true,
      "createdAt": "2026-01-15T10:30:00Z",
      "updatedAt": "2026-05-20T14:22:00Z"
    }
  ]
}
```

#### POST /api/admin/options

Create new option.

**Request**:
```json
{
  "type": "scent",
  "name": "Eucalyptus",
  "description": "Fresh eucalyptus fragrance",
  "hexValue": null,
  "displayOrder": 5
}
```

**Response** `201 Created`: New option object

#### PUT /api/admin/options/:id

Update option.

**Request** (all optional):
```json
{
  "name": "New Name",
  "description": "New description",
  "displayOrder": 3,
  "enabled": false
}
```

**Response** `200 OK`: Updated option object

#### DELETE /api/admin/options/:id

Delete option (soft delete - sets enabled=0).

**Response** `204 No Content`
**Response** `409 Conflict`: Option in use by active orders

---

### Product Options (Association)

#### POST /api/admin/products/:id/options

Add option to product.

**Request**:
```json
{
  "optionId": "opt_xyz",
  "extraPrice": 200
}
```

**Response** `201 Created`

#### DELETE /api/admin/products/:id/options/:optionId

Remove option from product.

**Response** `204 No Content`

---

### Discounts

#### GET /api/admin/discounts

List all discounts.

**Response** `200 OK`:
```json
{
  "discounts": [
    {
      "id": "disc_abc",
      "code": "SUMMER20",
      "type": "percentage",
      "value": 20,
      "minOrderValue": 0,
      "maxUses": 100,
      "usesCount": 45,
      "startsAt": "2026-06-01T00:00:00Z",
      "expiresAt": "2026-08-31T23:59:59Z",
      "enabled": true,
      "createdAt": "2026-05-01T10:00:00Z",
      "updatedAt": "2026-05-20T14:00:00Z"
    }
  ]
}
```

#### POST /api/admin/discounts

Create discount.

**Request**:
```json
{
  "code": "SUMMER20",
  "type": "percentage",
  "value": 20,
  "minOrderValue": 0,
  "maxUses": 100,
  "startsAt": "2026-06-01T00:00:00Z",
  "expiresAt": "2026-08-31T23:59:59Z"
}
```

**Response** `201 Created`: New discount object

#### PUT /api/admin/discounts/:id

Update discount.

**Request** (all optional):
```json
{
  "code": "NEWSUMMER20",
  "value": 25,
  "maxUses": 200,
  "enabled": false
}
```

**Response** `200 OK`: Updated discount object

#### DELETE /api/admin/discounts/:id

Delete discount.

**Response** `204 No Content`

---

### Audit Log

#### GET /api/admin/audit

List audit entries with optional filters.

**Query params**:
- `entityType`: product, option, or discount
- `entityId`: specific entity ID
- `limit`: max entries (default 50)
- `offset`: pagination offset

**Response** `200 OK`:
```json
{
  "entries": [
    {
      "id": "audit_123",
      "entityType": "product",
      "entityId": "prod_abc123",
      "action": "update",
      "adminId": "user_admin1",
      "changes": {
        "basePrice": { "old": 1299, "new": 1499 }
      },
      "createdAt": "2026-05-27T09:15:00Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```