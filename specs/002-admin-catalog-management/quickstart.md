# Quickstart: Admin Catalog Management

## Setup

1. Run database migrations:
   ```bash
   bun run --filter @organic-soap/db migrate
   ```

2. Ensure auth middleware is configured for admin routes

3. Start development server:
   ```bash
   bun run dev
   ```

## Accessing Admin

Navigate to `/admin` in the browser. Unauthenticated users are redirected to login.

## Admin Dashboard

The admin dashboard (`/admin`) provides an overview with:
- Quick stats: product count, active discounts, recent audit entries
- Navigation links to Products, Options, and Discounts management

## Managing Products

1. Navigate to `/admin/products`
2. Click a product to edit
3. Modify fields and save
4. Changes reflect on storefront within 5 seconds

## Managing Options

1. Navigate to `/admin/options`
2. Select tab: Scents, Colors, or Shapes
3. Add/edit/remove options
4. Options become available for product association immediately

## Managing Discounts

1. Navigate to `/admin/discounts`
2. Click "New Discount"
3. Fill in code, type (percentage/fixed), value, validity dates
4. Save to activate

## Troubleshooting

**Admin routes redirect to login**: Verify session cookie is being sent. Check auth middleware configuration.

**Changes not reflecting**: Clear browser cache; verify database write succeeded via audit log.

**Cannot delete option**: Option is in use by an active order. Archive instead of delete.