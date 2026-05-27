# Data Model: Admin Catalog Management

## Overview

Three entities backed by SQLite tables via Drizzle ORM + libSQL. All tables reside in a single `admin.db` file separate from the main PostgreSQL database.

---

## Entity: `AdminProduct`

Represents a soap product in the admin catalog.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | integer | PRIMARY KEY AUTOINCREMENT | Unique product identifier |
| `name` | text | NOT NULL | Product display name |
| `color` | text | NOT NULL | e.g. "White", "Green", "Purple" |
| `scent` | text | NOT NULL | e.g. "Lavender", "Coconut" |
| `shape` | text | NOT NULL | e.g. "Square", "Circle", "Heart" |
| `weight` | integer | NOT NULL CHECK(weight > 0) | Product weight in grams |
| `price` | integer | NOT NULL CHECK(price >= 0) | Product unit price in cents |
| `created_at` | text | NOT NULL DEFAULT CURRENT_TIMESTAMP | ISO 8601 timestamp |
| `updated_at` | text | NOT NULL DEFAULT CURRENT_TIMESTAMP | ISO 8601 timestamp |

**Validation Rules**:
- Name must be non-empty (max 200 chars)
- Price must be between `AdminOptions.min_price` and `AdminOptions.max_price`
- Weight must be between `AdminOptions.min_size` and `AdminOptions.max_size`
- Color, scent, shape must be one of the known option values (enforced by app-level enum)

---

## Entity: `AdminOptions`

Global configuration for pricing bounds and size range.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | integer | PRIMARY KEY AUTOINCREMENT | Singleton row ID |
| `min_price` | integer | NOT NULL CHECK(min_price >= 0) | Minimum allowed price in cents |
| `max_price` | integer | NOT NULL CHECK(max_price >= min_price) | Maximum allowed price in cents |
| `min_size` | integer | NOT NULL CHECK(min_size > 0) | Minimum allowed weight in grams |
| `max_size` | integer | NOT NULL CHECK(max_size >= min_size) | Maximum allowed weight in grams |
| `updated_at` | text | NOT NULL DEFAULT CURRENT_TIMESTAMP | ISO 8601 timestamp |

**Business Rules**:
- Only one row exists (singleton pattern — upsert by `id = 1`)
- `max_price >= min_price` and `max_size >= min_size` enforced at DB level

---

## Entity: `AdminDiscount`

Represents a discount applied to products.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | integer | PRIMARY KEY AUTOINCREMENT | Unique discount identifier |
| `percentage` | integer | NOT NULL CHECK(percentage BETWEEN 0 AND 100) | Discount percentage (0–100) |
| `description` | text | NOT NULL | Human-readable label e.g. "Summer Sale" |
| `active` | integer | NOT NULL DEFAULT 1 | 1 = active, 0 = inactive |
| `created_at` | text | NOT NULL DEFAULT CURRENT_TIMESTAMP | ISO 8601 timestamp |
| `updated_at` | text | NOT NULL DEFAULT CURRENT_TIMESTAMP | ISO 8601 timestamp |

**Validation Rules**:
- Percentage must be integer between 0 and 100 inclusive
- Description must be non-empty (max 200 chars)

---

## Relationships

```
AdminOptions ──┐ (singleton, no FK relationships)
               │
AdminProduct ──┤ (standalone entity, no FKs)
               │
AdminDiscount ─┘ (standalone entity, no FKs)
```

No foreign key relationships exist between entities — they are independently managed. Pricing bounds from `AdminOptions` are enforced by the API layer during product create/update, not by DB constraints.

## Drizzle Schema Package

Defined in `packages/db/src/schema/admin-sqlite.ts` using `drizzle-orm/sqlite-core`:

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
```

Exported from `packages/db/src/admin.ts` along with the libSQL client initialization.
