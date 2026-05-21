# Feature Specification: Webhook Order Submission

**Feature Branch**: `1-webhook-order-submission`
**Created**: 2026-01-03
**Status**: Draft
**Input**: Add webhook integration to send order data to Pabbly when user places order

## Clarifications

### Session 2026-01-03

- Q: How should the webhook URL with embedded token be handled for security? → A: Store in environment variable (e.g., `PABBLY_WEBHOOK_URL`) - best for security and configuration management
- Q: What should happen when webhook request fails? → A: Automatic retry 3 times with exponential backoff - balances reliability with user experience
- Q: How long should the system wait for webhook response? → A: 10 second timeout - more reliable but user waits longer
- Q: What logging/monitoring for webhook operations? → A: Log webhook attempts with order ID, status code, timestamp - provides debugging info without overwhelming logs

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Order with Webhook Submission (Priority: P1)

As a customer who has customized my soap order, I want my order details to be automatically sent to the business via webhook when I place my order, so that the business can process my order without manual data entry.

**Why this priority**: This is the primary feature - webhook integration is the core requirement

**Independent Test**: Can be tested by completing an order and verifying the webhook receives the correct JSON payload with customer and order item details

**Acceptance Scenarios**:

1. **Given** a customer has completed all form steps (scent, color, quantity, contact), **When** they submit the order, **Then** a webhook request MUST be sent to the Pabbly endpoint with all order details populated in the JSON payload.

2. **Given** a customer provides all required information (name, email, phone, at least one item), **When** the order is submitted, **Then** the webhook MUST include the customer's name, email, and phone number in the customer object.

3. **Given** a customer has added multiple soap items with different customizations, **When** the order is submitted, **Then** each item MUST appear in the items array with its id, scent, customScent, color, and quantity.

4. **Given** a customer selects "Custom" scent option, **When** the order is submitted, **Then** the customScent field MUST contain the customer's entered custom scent description.

5. **Given** the webhook request fails due to network issues, **When** the customer submits the order, **Then** they SHOULD receive a clear error message and fallback instructions.

---

### User Story 2 - Order Confirmation with Webhook Status (Priority: P2)

As a customer who just placed an order, I want to know if my order was successfully submitted to the business, so that I can have confidence my order will be processed.

**Why this priority**: Provides feedback on webhook success, improving user experience

**Independent Test**: Can be verified by checking the order confirmation screen shows webhook submission status

**Acceptance Scenarios**:

1. **Given** a customer has submitted an order, **When** the webhook request completes successfully, **Then** they SHOULD see a confirmation message indicating the order was received.

2. **Given** a customer has submitted an order, **When** the webhook request times out, **Then** they SHOULD see a message indicating the order was saved but there may be a delay in processing.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST send a webhook POST request to the configured Pabbly webhook endpoint (stored in environment variable `PABBLY_WEBHOOK_URL`) when user submits an order.

- **FR-002**: The webhook request MUST use Content-Type: application/json header.

- **FR-003**: The webhook JSON payload MUST include a customer object with name, email, and phone fields populated from user input.

- **FR-004**: The webhook JSON payload MUST include an items array where each item contains id, scent, customScent, color, and quantity fields.

- **FR-005**: For items with "Custom" scent selection, the customScent field MUST contain the user's custom scent description text.

- **FR-006**: The webhook MUST be triggered immediately after the user clicks the submit action with a 10-second timeout per attempt.

- **FR-007**: If the webhook request fails or times out, the system MUST automatically retry up to 3 times with exponential backoff before displaying an error message to the user with fallback instructions.

- **FR-008**: All webhook attempts MUST be logged with order ID, HTTP status code, timestamp, and retry count for debugging and operational visibility.

### Key Entities

- **Order**: Represents the complete order with customer information and line items
  - customer: Customer contact details (name, email, phone)
  - items: Array of ordered soap products
  - submittedAt: Timestamp of order submission

- **OrderItem**: Represents a single soap product in the order
  - id: Product identifier
  - scent: Selected scent option (or "Custom")
  - customScent: User-provided custom scent description (empty if not custom)
  - color: Selected color option
  - quantity: Number of units ordered

- **WebhookPayload**: Structure sent to Pabbly endpoint
  - customer: Customer information object
  - items: Array of OrderItem objects

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Webhook is triggered within 2 seconds of order submission.

- **SC-002**: 100% of order submissions result in a webhook attempt (no orders bypass webhook).

- **SC-003**: Customers can complete an order within 5 minutes including time for webhook submission.

- **SC-004**: Webhook payload correctly contains all required fields for 100% of successful submissions.

- **SC-005**: Users receive clear feedback about order submission status (success or error) within 5 seconds.

- **SC-006**: No order data is lost if webhook fails - user can retry or business receives order through alternative means.
