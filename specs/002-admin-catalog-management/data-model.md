# Data Model: Admin Catalog Management

## Entities

### Product

| Field | Type | Constraints |
|-------|------|-------------|
| id | TEXT | PRIMARY KEY |
| name | TEXT | NOT NULL |
| description | TEXT | |
| base_price | INTEGER | NOT NULL (cents) |
| min_weight | INTEGER | NOT NULL (grams) |
| max_weight | INTEGER | NOT NULL (grams) |
| enabled | INTEGER | NOT NULL (0/1) |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |

### CatalogOption

| Field | Type | Constraints |
|-------|------|-------------|
| id | TEXT | PRIMARY KEY |
| type | TEXT | NOT NULL (scent/color/shape) |
| name | TEXT | NOT NULL |
| slug | TEXT | UNIQUE NOT NULL |
| description | TEXT | |
| hex_value | TEXT | Only for color type |
| display_order | INTEGER | DEFAULT 0 |
| enabled | INTEGER | DEFAULT 1 |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |

### ProductOption (junction table)

| Field | Type | Constraints |
|-------|------|-------------|
| product_id | TEXT | FOREIGN KEY → Product |
| option_id | TEXT | FOREIGN KEY → CatalogOption |
| extra_price | INTEGER | DEFAULT 0 (cents) |

### Discount

| Field | Type | Constraints |
|-------|------|-------------|
| id | TEXT | PRIMARY KEY |
| code | TEXT | UNIQUE NOT NULL |
| type | TEXT | NOT NULL (percentage/fixed) |
| value | INTEGER | NOT NULL |
| min_order_value | INTEGER | DEFAULT 0 (cents) |
| max_uses | INTEGER | NULL (unlimited) |
| uses_count | INTEGER | DEFAULT 0 |
| starts_at | TEXT | ISO timestamp |
| expires_at | TEXT | ISO timestamp |
| enabled | INTEGER | DEFAULT 1 |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |

### AuditLog

| Field | Type | Constraints |
|-------|------|-------------|
| id | TEXT | PRIMARY KEY |
| entity_type | TEXT | NOT NULL (product/option/discount) |
| entity_id | TEXT | NOT NULL |
| action | TEXT | NOT NULL (create/update/delete) |
| admin_id | TEXT | NOT NULL |
| changes | TEXT | JSON |
| created_at | TEXT | ISO timestamp |

## Relationships

- Product → ProductOption → CatalogOption (many-to-many via junction)
- Product has no direct relationship to Discount (discounts apply at checkout, not product-level)
- AuditLog references Product/Option/Discount but does not cascade delete

## State Transitions

### Product
- Draft → Active (enabled=1)
- Active → Disabled (enabled=0, existing orders still process)

### CatalogOption
- Active → Disabled (enabled=0, existing orders still use option)
- Disabled cannot be re-enabled (create new option instead)

### Discount
- Draft → Active (enabled=1, within validity period)
- Active → Expired (after expires_at or max_uses reached)
- Active → Disabled (manually deactivated by admin)

## Validation Rules

- base_price: >= 0, max 999999 (~$10,000)
- min_weight: >= 1, <= max_weight
- max_weight: <= 10000 (10kg)
- discount value: percentage type 1-100, fixed type >= 0
- code: uppercase alphanumeric, 4-20 characters