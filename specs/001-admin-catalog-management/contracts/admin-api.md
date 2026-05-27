# Admin API Contracts

Base URL: `http://localhost:3001/api/admin`
Content-Type: `application/json`

---

## Authentication

### POST /api/admin/login

Authenticates the admin user with the hardcoded password.

**Request**:
```json
{
  "password": "3984"
}
```

**Response 200**:
```json
{
  "token": "admin-authenticated"
}
```

**Response 401**:
```json
{
  "error": "Invalid password"
}
```

**Auth**: None (public)

---

## Middleware

All endpoints below require the `Authorization: Bearer admin-authenticated` header. Requests without it return 401.

---

## Products

### GET /api/admin/products

Lists all admin products.

**Response 200**:
```json
[
  {
    "id": 1,
    "name": "Lavender Dream",
    "color": "Purple",
    "scent": "Lavender",
    "shape": "Heart",
    "weight": 100,
    "price": 1500,
    "createdAt": "2026-05-27T10:00:00.000Z",
    "updatedAt": "2026-05-27T10:00:00.000Z"
  }
]
```

### POST /api/admin/products

Creates a new product.

**Request**:
```json
{
  "name": "Lavender Dream",
  "color": "Purple",
  "scent": "Lavender",
  "shape": "Heart",
  "weight": 100,
  "price": 1500
}
```

**Response 201**:
```json
{
  "id": 1,
  "name": "Lavender Dream",
  "color": "Purple",
  "scent": "Lavender",
  "shape": "Heart",
  "weight": 100,
  "price": 1500,
  "createdAt": "2026-05-27T10:00:00.000Z",
  "updatedAt": "2026-05-27T10:00:00.000Z"
}
```

**Response 422**: Validation error (price/weight out of bounds)

### DELETE /api/admin/products/:id

Removes a product.

**Response 200**:
```json
{
  "success": true
}
```

**Response 404**: Product not found

---

## Options

### GET /api/admin/options

Returns the singleton admin options row.

**Response 200**:
```json
{
  "id": 1,
  "minPrice": 500,
  "maxPrice": 5000,
  "minSize": 50,
  "maxSize": 500,
  "updatedAt": "2026-05-27T10:00:00.000Z"
}
```

### PUT /api/admin/options

Updates admin options.

**Request**:
```json
{
  "minPrice": 500,
  "maxPrice": 5000,
  "minSize": 50,
  "maxSize": 500
}
```

**Response 200**:
```json
{
  "id": 1,
  "minPrice": 500,
  "maxPrice": 5000,
  "minSize": 50,
  "maxSize": 500,
  "updatedAt": "2026-05-27T10:00:00.000Z"
}
```

**Response 422**: maxPrice < minPrice or maxSize < minSize

---

## Discounts

### GET /api/admin/discounts

Lists all discounts.

**Response 200**:
```json
[
  {
    "id": 1,
    "percentage": 20,
    "description": "Summer Sale",
    "active": true,
    "createdAt": "2026-05-27T10:00:00.000Z",
    "updatedAt": "2026-05-27T10:00:00.000Z"
  }
]
```

### POST /api/admin/discounts

Creates a discount.

**Request**:
```json
{
  "percentage": 20,
  "description": "Summer Sale"
}
```

**Response 201**: Full discount object

### PUT /api/admin/discounts/:id

Updates a discount.

**Request**:
```json
{
  "percentage": 25,
  "description": "Summer Sale Extended",
  "active": false
}
```

**Response 200**: Updated discount object

### DELETE /api/admin/discounts/:id

Deletes a discount.

**Response 200**:
```json
{
  "success": true
}
```

**Response 404**: Discount not found
