# Command Palette (cmdk) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cmdk-powered command palette triggered by Cmd+K / Ctrl+K, with a Zustand store for registering commands from anywhere in the app.

**Architecture:** The CommandBar is a global, root-mounted component that listens for keyboard events. A Zustand store (`useCommandStore`) holds registered commands as `{ id, label, action }` objects. The component renders a `<dialog>` overlay with cmdk powering the search/navigation. Commands can be registered at any time by any module.

**Tech Stack:** `cmdk`, `zustand`, existing project conventions.

---

## File Map

- Create: `packages/app/src/stores/useCommandStore.ts`
- Create: `packages/app/src/components/CommandBar.tsx`
- Modify: `packages/app/index.tsx` — mount `CommandBar` inside `ErrorBoundary`
- Test: `packages/app/src/stores/useCommandStore.test.ts`
- Test: `packages/app/src/components/CommandBar.test.tsx`

---

### Task 1: Install cmdk

- [ ] **Step 1: Install cmdk as a dependency**

Run: `cd /Users/gerson/development/lord-of-the-rinse && bun add cmdk`
Expected: `cmdk` added to `packages/app/package.json` dependencies.

---

### Task 2: Create useCommandStore

- [ ] **Step 1: Write the failing test**

`packages/app/src/stores/useCommandStore.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useCommandStore } from './useCommandStore';

describe('useCommandStore', () => {
  beforeEach(() => {
    useCommandStore.setState({ commands: [] });
  });

  it('starts with empty commands', () => {
    expect(useCommandStore.getState().commands).toHaveLength(0);
  });

  it('registers a command', () => {
    const unsubscribe = useCommandStore.getState().register({
      id: 'test-cmd',
      label: 'Test Command',
      action: () => {},
    });
    expect(useCommandStore.getState().commands).toHaveLength(1);
    expect(useCommandStore.getState().commands[0].id).toBe('test-cmd');
    unsubscribe();
  });

  it('unregisters a command', () => {
    const { register } = useCommandStore.getState();
    const unsubscribe = register({ id: 'test-cmd', label: 'Test', action: () => {} });
    unsubscribe();
    expect(useCommandStore.getState().commands).toHaveLength(0);
  });

  it('clears all commands', () => {
    useCommandStore.getState().register({ id: 'a', label: 'A', action: () => {} });
    useCommandStore.getState().register({ id: 'b', label: 'B', action: () => {} });
    useCommandStore.getState().clearCommands();
    expect(useCommandStore.getState().commands).toHaveLength(0);
  });

  it('registers multiple commands independently', () => {
    const { register } = useCommandStore.getState();
    register({ id: 'cmd-a', label: 'Command A', action: () => {} });
    register({ id: 'cmd-b', label: 'Command B', action: () => {} });
    expect(useCommandStore.getState().commands).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/gerson/development/lord-of-the-rinse && bun test src/stores/useCommandStore.test.ts`
Expected: FAIL — file does not exist.

- [ ] **Step 3: Write minimal implementation**

`packages/app/src/stores/useCommandStore.ts`:
```typescript
import { create } from 'zustand';

export interface Command {
  id: string;
  label: string;
  action: () => void;
}

interface CommandState {
  commands: Command[];
  register: (command: Command) => () => void;
  clearCommands: () => void;
}

export const useCommandStore = create<CommandState>((set, get) => ({
  commands: [],
  register: (command) => {
    set((state) => ({ commands: [...state.commands, command] }));
    return () => {
      set((state) => ({ commands: state.commands.filter((c) => c.id !== command.id) }));
    };
  },
  clearCommands: () => set({ commands: [] }),
}));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/gerson/development/lord-of-the-rinse && bun test src/stores/useCommandStore.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /Users/gerson/development/lord-of-the-rinse
git add packages/app/src/stores/useCommandStore.ts packages/app/src/stores/useCommandStore.test.ts
git commit -m "feat: create useCommandStore Zustand store for command registration"
```

---

### Task 3: Build CommandBar component

- [ ] **Step 1: Write the failing test**

`packages/app/src/components/CommandBar.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommandBar } from './CommandBar';

describe('CommandBar', () => {
  it('renders nothing when closed', () => {
    render(<CommandBar />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on Cmd+K', async () => {
    render(<CommandBar />);
    await userEvent.keyboard('{Meta}k');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens on Ctrl+K', async () => {
    render(<CommandBar />);
    await userEvent.keyboard('{Control}k');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    render(<CommandBar />);
    await userEvent.keyboard('{Meta}k');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/gerson/development/lord-of-the-rinse && bun test src/components/CommandBar.test.tsx`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Write minimal implementation**

`packages/app/src/components/CommandBar.tsx`:
```typescript
import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useCommandStore } from '../stores/useCommandStore';

export function CommandBar() {
  const [open, setOpen] = useState(false);
  const commands = useCommandStore((s) => s.commands);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal={true} aria-label="Command palette">
      <Command>
        <Command.Input placeholder="Type a command..." autoFocus />
        <Command.List>
          <Command.Empty>No results found.</Command.Empty>
          {commands.map((cmd) => (
            <Command.Item key={cmd.id} onSelect={cmd.action}>
              {cmd.label}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/gerson/development/lord-of-the-rinse && bun test src/components/CommandBar.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /Users/gerson/development/lord-of-the-rinse
git add packages/app/src/components/CommandBar.tsx packages/app/src/components/CommandBar.test.tsx
git commit -m "feat: build CommandBar component with cmdk and keyboard shortcut"
```

---

### Task 4: Mount CommandBar at app root

- [ ] **Step 1: Modify index.tsx to mount CommandBar**

Modify `packages/app/index.tsx` — add `import { CommandBar } from './src/components/CommandBar';` and render `<CommandBar />` inside the `ErrorBoundary`, after `RouterProvider`.

```typescript
import { createBrowserHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';
import { routeTree } from './src/routeTree.gen';
import './index.css';
import { setupGlobalErrorHandlers } from './src/utils/errorLogging';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { CommandBar } from './src/components/CommandBar';

setupGlobalErrorHandlers();

const router = createRouter({
  routeTree,
  history: createBrowserHistory(),
  context: {},
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <ErrorBoundary>
    <RouterProvider router={router} />
    <CommandBar />
  </ErrorBoundary>,
);
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/gerson/development/lord-of-the-rinse && bun run build`
Expected: SUCCESS

- [ ] **Step 3: Run lint**

Run: `cd /Users/gerson/development/lord-of-the-rinse && bun run lint`
Expected: SUCCESS (no new errors)

- [ ] **Step 4: Commit**

```bash
cd /Users/gerson/development/lord-of-the-rinse
git add packages/app/index.tsx
git commit -m "feat: mount CommandBar at app root inside ErrorBoundary"
```

---

## Spec Coverage Checklist

| Requirement | Task |
|---|---|
| Cmd+K / Ctrl+K opens palette | Task 3 |
| cmdk used | Task 3 |
| `useCommandStore` with register/unregister | Task 2 |
| `CommandBar` component at root | Task 3, Task 4 |
| `bun run build` succeeds | Task 4 |
| Commands searchable | Task 3 (cmdk provides this) |
| Keyboard navigation | Task 3 (cmdk provides this) |

## Placeholder Scan

No placeholders found. All steps have complete code, exact file paths, and concrete expected outputs.

## Type Consistency

- `useCommandStore` exports `Command` interface with `id`, `label`, `action`
- `CommandBar` imports same interface — consistent
- `register` returns unsubscribe function — used correctly in tests

---

**Plan complete.** Two execution options:

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?