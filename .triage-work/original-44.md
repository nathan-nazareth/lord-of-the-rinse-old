Gap-ID: 8

## Problem Statement
The application is missing the Suite-mandated command palette. There is no cmdk-based interface triggered by Cmd+K, and no centralized store for registering commands.

## Solution
Add a cmdk-powered command bar with a supporting `useCommandStore` so commands can be registered from anywhere in the app and triggered via keyboard shortcut.

## Current Status (Updated)
**This work is currently paused.** It will be revisited after the core admin features from PRD #56 are implemented, so we can design useful commands based on actual admin functionality.

## User Stories
1. As a user, I want to press Cmd+K to quickly access navigation and actions.
2. As a developer, I want to register new commands from any component using a simple store API.

## Implementation Decisions
- Install `cmdk`.
- Create `useCommandStore` (Zustand) to manage registered commands.
- Build a `CommandBar` component that opens on Cmd+K / Ctrl+K.
- Support search, keyboard navigation, and action execution.
- Mount the CommandBar at the root so it is available globally.

## Testing Decisions
- Verify Cmd+K opens the palette.
- Verify registered commands appear and are searchable.
- Confirm `bun run build` and `bun run lint` succeed.
- Test that selecting a command executes the associated action.

## Out of Scope
- Deep integration with TanStack Router navigation (can be added later via command actions)
- Recent items / history tracking
- Keyboard shortcut customization

## Further Notes
Implementation plan saved at docs/plans/2026-05-20-add-command-bar.md.
