<!--
  Sync Impact Report
  ==================
  Version change: NEW → 1.0.0 (initial constitution)
  
  Modified principles: N/A (new constitution)
  Added sections: 
    - Core Principles (5 principles defined)
    - Quality Standards
    - Development Workflow
    - Governance
  
  Removed sections: N/A
  
  Templates requiring updates:
    - .specify/templates/plan-template.md ⚠️ (references constitution but no changes needed)
    - .specify/templates/spec-template.md ✅ (already aligned)
    - .specify/templates/tasks-template.md ✅ (already aligned)
    - .specify/templates/agent-file-template.md ⚠️ (no project-specific references)
    - .specify/templates/checklist-template.md ⚠️ (no project-specific references)
  
  Follow-up TODOs: None
-->

# Organic Soap Builder Constitution

## Core Principles

### I. User-Centered Ordering
Every feature MUST prioritize the customer's soap customization journey. Form flows MUST be intuitive, progressive, and guide users through scent, color, quantity, and contact steps in logical order. The interface MUST provide clear feedback at each step and maintain order state across the experience. Users MUST be able to complete orders with minimal friction.

Rationale: The primary value proposition is enabling customers to easily create custom soap orders. Complex or confusing forms directly undermine this goal.

### II. Natural Product Authenticity
All user-facing content MUST reinforce the organic, natural nature of the products. Color descriptions MUST emphasize natural origins (e.g., "subtle hues," "natural"). Scent options MUST reflect authentic botanical ingredients. The visual language (earth tones, natural imagery) MUST consistently communicate organic quality.

Rationale: Customers choosing organic soaps expect a coherent brand experience. Inconsistent messaging erodes trust in product authenticity.

### III. Form Validation (NON-NEGOTIABLE)
Client-side validation MUST prevent invalid orders before submission. Validation MUST check: required scent selection, custom scent description when "Custom" selected, required color selection, valid quantity (positive integer), and contact information presence. Invalid states MUST provide clear, actionable error messages. Submit actions MUST be disabled until form is valid.

Rationale: Invalid orders waste customer time and business resources. The mailto-based submission cannot recover from errors after sending.

### IV. Cross-Platform Compatibility
The application MUST function correctly across modern browsers (Chrome, Firefox, Safari, Edge) and devices (desktop, tablet, mobile). Responsive design MUST ensure usability on screens from 320px width upward. Progressive enhancement principles MUST be applied - core functionality MUST work even if advanced features fail.

Rationale: Customers discover products through various channels and devices. Limited compatibility directly reduces sales potential.

### V. Graceful Degradation
When primary submission mechanisms fail, the application MUST provide immediate fallback options. The mailto link MUST include a clipboard copy fallback with clear instructions. Error states MUST not leave users stranded. System MUST communicate status clearly at every step of the order process.

Rationale: Email link behavior varies across browsers and configurations. A robust system anticipates these variations and provides alternatives without requiring technical troubleshooting from users.

## Quality Standards

### UI/UX Requirements
Forms MUST use clear visual hierarchy with numbered steps. Selected options MUST have distinct visual feedback (borders, backgrounds, icons). Color swatches MUST accurately represent the resulting soap color. Transitions and animations MUST feel smooth (200-300ms durations). The submit action MUST be persistently accessible (fixed footer on mobile).

### Performance Standards
First Contentful Paint MUST occur under 1.5 seconds on 3G connections. Time to Interactive MUST be under 3 seconds. Form interactions MUST respond within 100ms. Build artifacts MUST be minimized through code splitting and tree shaking.

### Accessibility Standards
All interactive elements MUST be keyboard accessible. Form labels MUST be properly associated with inputs. Color selections MUST have text alternatives. Focus states MUST be clearly visible. ARIA attributes MUST be used appropriately for dynamic content.

## Development Workflow

### Code Review Requirements
All changes MUST be reviewed before merging to main. Pull requests MUST include screenshots or descriptions of UI changes. Documentation MUST be updated alongside code changes. Performance implications MUST be considered for visual changes.

### Testing Expectations
New form features MUST include manual testing verification. Edge cases (empty inputs, invalid values) MUST be considered. Cross-browser testing REQUIRED for UI changes. Mobile responsiveness MUST be verified on actual devices.

### Deployment Process
Main branch MUST remain deployable at all times. Production deployments SHOULD use automated CI/CD. Version bumps MUST follow semantic versioning. Changelog entries REQUIRED for user-facing changes.

## Governance

This constitution supersedes all other development practices. Principles marked (NON-NEGOTIABLE) represent absolute requirements that MUST NOT be violated without constitutional amendment.

### Amendment Procedure
Amendments require:
1. Documentation of the proposed change and rationale
2. Review by at least one other contributor
3. Update to this constitution file
4. Update to affected templates and documentation
5. Version increment following semantic versioning rules

### Versioning Policy
- MAJOR: Backward incompatible principle changes or removals
- MINOR: New principles added or materially expanded guidance
- PATCH: Clarifications, wording improvements, typo fixes

### Compliance Review
All pull requests SHOULD be reviewed for constitution compliance. Deviations MUST be documented in the pull request with justification. Pattern of violations MAY trigger constitution review.

**Version**: 1.0.0 | **Ratified**: 2026-01-03 | **Last Amended**: 2026-01-03
