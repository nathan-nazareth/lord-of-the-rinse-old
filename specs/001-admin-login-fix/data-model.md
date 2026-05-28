# Data Model: Admin Login Bug Fix

## Overview

This is a bug fix for the admin authentication endpoint. No persistent data model changes required - authentication is stateless and uses ephemeral tokens.

## Entity: AdminAuth

No database entity. Authentication is stateless.

| Field | Type | Description |
|-------|------|-------------|
| password | string | Admin credential (passed in request body) |
| token | string | Auth token returned on success (format: "admin-{password}") |

## Request/Response Shape

### POST /api/admin/auth/login

**Request Body:**
```json
{
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "token": "admin-3984"
}
```

**Error Responses:**
- 401: Invalid credentials
- 404: Endpoint not found (indicates async bug)

## No Schema Changes

No database schema changes required for this bug fix.