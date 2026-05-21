# Implementation Plan: Multi-Item Order Cart

**Branch**: `2-multi-item-order` | **Date**: 2026-01-03 | **Spec**: specs/2-multi-item-order/spec.md
**Input**: Feature specification from `/specs/2-multi-item-order/spec.md`

## Summary

This feature adds cart functionality to the Organic Soap Builder, allowing customers to add multiple soap items with different customizations (scent, color, quantity) to a cart and checkout once with a single set of contact information. The cart persists across page refreshes using localStorage.

## Technical Context

**Language/Version**: TypeScript 5.8.2  
**Primary Dependencies**: React 19.2.3, Vite 6.2.0, Lucide React 0.562.0  
**Storage**: localStorage for cart persistence (client-side)  
**Testing**: Manual testing via browser dev tools  
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)  
**Project Type**: single (React SPA)  
**Performance Goals**: Cart interactions < 100ms, cart load < 50ms  
**Constraints**: Client-side only, no database, cart limit (TBD - consider reasonable max)  
**Scale/Scope**: Single-user browser sessions, ephemeral cart data

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Principle I - User-Centered Ordering**: ✅ COMPLIANT
- Cart provides clear visual feedback on items added
- Progressive form flow maintained - add items → review → checkout
- Cart summary always visible showing item count
- Single contact entry reduces friction

**Principle II - Natural Product Authenticity**: ✅ COMPLIANT
- No user-facing content changes that affect brand messaging
- Cart items display scent and color with natural descriptions

**Principle III - Form Validation (NON-NEGOTIABLE)**: ✅ COMPLIANT
- Existing validation maintained for scent, color, quantity
- Cart must have at least 1 item before checkout
- Contact fields validated before submission
- Remove action requires confirmation (prevents accidental removal)

**Principle IV - Cross-Platform Compatibility**: ✅ COMPLIANT
- Cart stored in localStorage (supported in all modern browsers)
- Responsive design for cart display on mobile
- Works offline once page loaded

**Principle V - Graceful Degradation**: ✅ COMPLIANT
- Cart persists across refresh but not critical failure
- Clear empty cart state with guidance
- Fallback to single-item flow if cart corrupted

## Project Structure

### Documentation (this feature)

```text
specs/2-multi-item-order/
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
│   ├── index.ts         # Updated exports
│   ├── webhook.ts       # Updated payload types (CartItem array)
│   └── cart.ts          # NEW: Cart and CartItem types
├── services/
│   ├── index.ts         # Updated exports
│   ├── webhook.ts       # Updated to handle cart items array
│   └── cart.ts          # NEW: Cart storage service (localStorage)
├── hooks/
│   ├── index.ts         # Updated exports
│   └── useCart.ts       # NEW: React hook for cart state management
└── components/
    ├── SoapForm.tsx     # Updated with Add to Cart functionality
    ├── Cart.tsx         # NEW: Cart sidebar/bottom panel component
    └── CartItem.tsx     # NEW: Individual cart item display

tests/
└── integration/
    └── cart.test.ts     # Cart integration tests (if Vitest available)
```

**Structure Decision**: Single project structure. Adding new cart functionality to existing React app. Using React Context or custom hook for cart state, localStorage for persistence.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - feature extends existing functionality and complies with all constitutional principles.
