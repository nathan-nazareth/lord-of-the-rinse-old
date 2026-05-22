Gap-ID: 8

## Problem Statement

The application is missing the Suite-mandated command palette (cmdk + Cmd+K).

## Solution

Add cmdk-powered command bar with `useCommandStore` for registering commands app-wide.

## Parent

None - this is a parent tracking issue.

## Child issues

- #45 - Install cmdk and create useCommandStore
- #46 - Build CommandBar component
- #47 - Integrate CommandBar and verify

## Blocked by

- #56 - Core admin features from PRD #56 should land before resuming palette work (paused per 2026-05-20 decision)

## Status

Paused. Revisit after PRD #56 foundation issues are unblocked and in progress.

## Questions for grooming

- Is the pause still intentional, or should cmdk proceed in parallel with admin work?
- Should the palette register admin-only commands, storefront commands, or both?
