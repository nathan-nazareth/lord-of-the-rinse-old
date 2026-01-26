# Data Model: Web3Forms Migration

## Overview

This document defines the data structures required for the Web3Forms integration, extending existing types where applicable.

## Entities

### Order Submission

**Description**: Represents a customer soap order submitted via the web form.

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| orderId | string | Yes | UUID format | Generated client-side |
| customer | Customer | Yes | See Customer entity | Customer contact info |
| items | CartItem[] | Yes | Min 1 item | Array of soap products |
| totalQuantity | number | Yes | Positive integer | Sum of item quantities |
| subtotal | number | Yes | Non-negative | Price before discounts |
| discountPercentage | number | Yes | 0-100 | Volume discount applied |
| discountAmount | number | Yes | Non-negative | Discount value |
| finalTotal | number | Yes | Non-negative | Amount customer pays |
| submissionState | SubmissionState | Yes | Valid enum | pending/sent/failed |
| timestamp | ISO 8601 | Yes | Valid datetime | When order created |
| lastAttempt | ISO 8601 | No | Valid datetime | Last submission attempt |
| retryCount | number | No | 0-5 | Number of retry attempts |

### Customer

**Description**: Customer contact information for order fulfillment.

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| name | string | Yes | 2-100 chars, non-empty | Customer full name |
| email | string | Yes | Email format | Contact email |
| phone | string | No | Phone format | Optional contact phone |

### CartItem

**Description**: Individual soap product in the order.

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| id | string | Yes | Non-empty | Product identifier |
| scent | string | Yes | Valid scent option | Selected scent |
| color | string | Yes | Valid color option | Selected color |
| price | number | Yes | Positive | Unit price |
| quantity | number | Yes | Positive integer | Number of units |

### SubmissionState

**Description**: Tracks the submission lifecycle for retry capability.

| Value | Description |
|-------|-------------|
| pending | Order created, submission not yet attempted |
| submitting | Submission in progress |
| sent | Successfully delivered to Web3Forms |
| failed | All retry attempts exhausted |

**State Transitions**:

```
pending → submitting → sent
                ↓
            failed
```

## Validation Rules

### Pre-Submission (Client-Side)

Per Constitution Principle III (Form Validation):
- scent: Required, must be a valid option
- customScent: Required when scent is "Custom"
- color: Required, must be a valid option
- quantity: Required, positive integer
- customer.name: Required, 2-100 characters
- customer.email: Required, valid email format

### Post-Submission (API Response)

- 200 OK: Submission successful
- 400 Bad Request: Invalid payload (validation error)
- 401 Unauthorized: Invalid access key
- 429 Too Many Requests: Rate limited
- 500+ Server Error: Retry according to retry logic

## Storage Schema

### localStorage Keys

| Key | Type | Purpose |
|-----|------|---------|
| `web3forms_pending_{orderId}` | Order Submission | Pending retry of failed submission |
| `web3forms_state_{orderId}` | SubmissionState | Current state for UI feedback |

**Retention Policy**:
- Successful submissions: Remove after 24 hours
- Failed submissions: Retain for 7 days to allow retry
- Stale entries (>30 days): Automatic cleanup on initialization
