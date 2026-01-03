# Implementation Plan: Webhook Order Submission

**Branch**: `1-webhook-order-submission` | **Date**: 2026-01-03 | **Spec**: specs/1-webhook-order-submission/spec.md
**Input**: Feature specification from `/specs/1-webhook-order-submission/spec.md`

## Summary

This feature integrates Pabbly webhook submission into the existing soap ordering flow. When a customer completes the order form and clicks "Draft Order in Email," the system will also send a JSON payload containing customer and order details to the configured Pabbly webhook endpoint. This replaces the current mailto-only submission with a dual-submission approach that ensures order data reaches the business reliably.

## Technical Context

**Language/Version**: TypeScript 5.8.2  
**Primary Dependencies**: React 19.2.3, Vite 6.2.0, Lucide React 0.562.0  
**Storage**: N/A (client-side only, no database)  
**Testing**: Manual testing via browser dev tools  
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)  
**Project Type**: single (React SPA)  
**Performance Goals**: Webhook trigger within 2 seconds of submission  
**Constraints**: 10-second timeout per webhook attempt, 3 retries with exponential backoff, webhook URL from environment variable  
**Scale/Scope**: Single-user browser sessions, ephemeral order data

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Principle I - User-Centered Ordering**: ✅ COMPLIANT
- Webhook is triggered immediately upon order submission
- User receives immediate feedback (success/error within 5 seconds)
- Order state is maintained during submission process

**Principle II - Natural Product Authenticity**: ✅ N/A
- No user-facing content changes

**Principle III - Form Validation (NON-NEGOTIABLE)**: ✅ COMPLIANT
- Existing client-side validation ensures form is valid before webhook triggers
- Webhook only fires after all form requirements are met

**Principle IV - Cross-Platform Compatibility**: ✅ COMPLIANT
- Uses standard fetch API available in all modern browsers
- Graceful handling of network failures

**Principle V - Graceful Degradation**: ✅ COMPLIANT
- Fallback to mailto link maintained if webhook fails
- Error states provide clear user instructions
- Retry logic with exponential backoff before showing error

## Project Structure

### Documentation (this feature)

```text
specs/1-webhook-order-submission/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── webhook.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── webhook.ts       # Webhook payload types
├── services/
│   └── webhook.ts       # Webhook submission service
├── hooks/
│   └── useWebhook.ts    # React hook for webhook operations
└── components/
    └── SoapForm.tsx     # Updated with webhook integration

tests/
├── integration/
│   └── webhook.test.ts  # Webhook integration tests (if Vitest available)
```

**Structure Decision**: Single project structure. Webhook functionality will be added to the existing React app in a new `src/services/webhook.ts` module with types in `src/types/webhook.ts`. The `SoapForm` component will use a custom hook `useWebhook` for webhook operations.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - feature complies with all constitutional principles.
