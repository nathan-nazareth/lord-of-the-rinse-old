# Feature Specification: Web3Forms Migration

**Feature Branch**: `001-web3forms-migration`
**Created**: 2026-01-26
**Status**: Draft
**Input**: User description: "i want to use web3forms instead of the legacy webhook. this is the key for it: <your-web3forms-access-key>"

## Clarifications

### 2026-01-26

- **Q: When a customer submits an order and encounters an error (network failure, API timeout, server error), what should the system do?** → **A: Preserve all entered data, show specific error message, keep submit enabled for retry**
- **Q: When the Web3Forms API rate limits the application or is temporarily unavailable, should the system log these events for monitoring, and how should rate limits be handled?** → **A: Log rate limits and errors to server logs, show specific message "Service busy, please wait and retry"**
- **Q: What features or behaviors should be explicitly excluded from this Web3Forms migration?** → **A: Replace legacy webhook webhook with Web3Forms only. Exclude: Email confirmations, order tracking, admin UI changes.**
- **Q: Should the system track the submission state (pending, sent, failed) to help ensure zero orders are lost?** → **A: Track submission state (pending/sent/failed) and allow retry of failed submissions from browser storage**

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Order Submission via Web3Forms (Priority: P1)

As a customer, I want to submit my soap customization order through the form and have it reliably sent to the business owner via Web3Forms, so that my order is processed without issues.

**Why this priority**: This is the core functionality of the application - without working order submission, the business cannot receive customer orders.

**Independent Test**: Can be tested by completing the soap order form with test data and verifying the order appears in the Web3Forms dashboard.

**Acceptance Scenarios**:

1. **Given** a customer has filled out all form fields (scent, color, quantity, contact info), **When** they click the submit button, **Then** the form data is sent to Web3Forms and a success confirmation is displayed.

2. **Given** a customer has submitted an order, **When** the Web3Forms API responds with success, **Then** the customer sees a confirmation message indicating their order was received.

---

### User Story 2 - Business Receives Order Notifications (Priority: P1)

As a business owner, I want to receive customer orders through Web3Forms so that I can fulfill soap orders without disruption from the legacy webhook service.

**Why this priority**: The business must receive orders to operate; this replaces the existing legacy webhook integration that was functioning.

**Independent Test**: Can be verified by submitting a test order and checking the Web3Forms dashboard or configured notification channel.

**Acceptance Scenarios**:

1. **Given** a customer submits an order via the form, **When** the order is processed, **Then** the order data is forwarded through Web3Forms to the configured business notification channel.

2. **Given** an order has been submitted, **When** the business owner checks their notification system, **Then** they can see all order details including scent selection, color preference, quantity, and customer contact information.

---

### User Story 3 - Graceful Error Handling (Priority: P2)

As a customer, I want clear feedback if my order fails to submit, so that I know whether to retry or contact support.

**Why this priority**: User experience matters even when things go wrong; unclear error states frustrate customers.

**Independent Test**: Can be tested by simulating API failures and verifying user-facing messages.

**Acceptance Scenarios**:

1. **Given** a customer is submitting an order, **When** the Web3Forms API is unavailable, **Then** the customer sees an error message explaining the issue and suggesting they try again later.

2. **Given** a customer receives an error message, **When** the issue is temporary, **Then** all previously entered form data is preserved and the submit button remains enabled so the customer can retry immediately.

---

### Edge Cases

- What happens when the Web3Forms API returns a rate limit error? (Resolved: Log to server, show "Service busy, please wait and retry")
- How does the system handle malformed order data that might have passed client-side validation? (Deferred to planning - reject submission, show error)
- What happens when the customer's network connection fails mid-submission? (Resolved: Form data preserved, error shown, retry enabled)

## Requirements *(mandatory)*

### Scope

**In Scope:**
- Replace legacy webhook webhook URL with Web3Forms API endpoint
- Include Web3Forms access key in form submissions
- Preserve existing form fields and data structure
- Handle submission errors gracefully with user feedback
- Log rate limit errors for monitoring
- Track submission state (pending/sent/failed) for retry capability

**Out of Scope:**
- Email confirmations to customers
- Order status tracking page for customers
- Admin dashboard for viewing/managing orders
- Changes to existing form UI/UX

### Functional Requirements

- **FR-001**: System MUST send order submissions to the Web3Forms API endpoint instead of the legacy webhook webhook URL.
- **FR-002**: System MUST include the Web3Forms access key (<your-web3forms-access-key>) in all API requests.
- **FR-003**: System MUST transmit the same order data structure to Web3Forms that was previously sent to legacy webhook (customer contact, scent selection, custom scent description, color choice, quantity).
- **FR-004**: System MUST parse the Web3Forms response to determine submission success or failure.
- **FR-005**: System MUST display appropriate feedback to the customer based on the submission result (success confirmation or error message). On error, form data MUST be preserved and submit MUST remain enabled for retry.
- **FR-006**: System MUST NOT expose the Web3Forms access key in client-side code that is publicly accessible.
- **FR-007**: System MUST log rate limit errors and temporary unavailability to server logs with sufficient detail for operational monitoring.
- **FR-008**: System MUST track submission state (pending, sent, failed) in browser storage to enable retry of failed submissions.

### Key Entities *(include if feature involves data)*

- **Order Submission**: Contains customer contact information (name, email, phone), soap customization details (scent selection, custom scent description, color choice, quantity), and submission metadata (timestamp, submission state).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of order submissions are successfully received by Web3Forms (based on successful API response codes).
- **SC-002**: Customers receive submission feedback within 5 seconds of clicking the submit button.
- **SC-003**: Zero orders are lost due to Web3Forms integration failures during the first 30 days of production use.
- **SC-004**: Business owner continues to receive all customer orders without requiring changes to their notification workflow.
