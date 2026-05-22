import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandBar } from './CommandBar';
import { useCommandStore } from '../stores/useCommandStore';

// cmdk uses Radix Dialog which requires IntersectionObserver in tests
beforeEach(() => {
  // Clean up any registered commands from previous tests
  useCommandStore.getState().clearCommands();
});

describe('CommandBar', () => {
  it('is not visible by default', () => {
    render(<CommandBar />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens on Cmd+K (Mac meta key)', async () => {
    render(<CommandBar />);
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });
  });

  it('opens on Ctrl+K (Windows/Linux)', async () => {
    render(<CommandBar />);
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });
  });

  it('closes on Escape', async () => {
    render(<CommandBar />);
    // Open first
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });
    // Close
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('toggles on repeated Cmd+K', async () => {
    render(<CommandBar />);
    // Open
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });
    // Close (toggle)
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('renders commands grouped by surface', async () => {
    useCommandStore.getState().register({
      id: 'go-home',
      label: 'Go to Home',
      surface: 'storefront',
      action: vi.fn(),
    });
    useCommandStore.getState().register({
      id: 'admin-dashboard',
      label: 'Open Dashboard',
      surface: 'admin',
      action: vi.fn(),
    });

    render(<CommandBar />);
    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    // Both group headings should be visible
    expect(screen.getByText('Storefront')).toBeTruthy();
    expect(screen.getByText('Admin')).toBeTruthy();
    // Both command items should be visible
    expect(screen.getByText('Go to Home')).toBeTruthy();
    expect(screen.getByText('Open Dashboard')).toBeTruthy();
  });

  it('shows storefront group before admin group', async () => {
    useCommandStore.getState().register({
      id: 'admin-cmd',
      label: 'Admin Command',
      surface: 'admin',
      action: vi.fn(),
    });
    useCommandStore.getState().register({
      id: 'store-cmd',
      label: 'Store Command',
      surface: 'storefront',
      action: vi.fn(),
    });

    render(<CommandBar />);
    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    // Storefront heading should appear before Admin heading
    const storefront = screen.getByText('Storefront');
    const admin = screen.getByText('Admin');
    const storefrontPos = storefront.compareDocumentPosition(admin);
    // Node.DOCUMENT_POSITION_FOLLOWING = 4 — admin follows storefront
    expect(storefrontPos & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('executes command action and closes on item selection', async () => {
    const action = vi.fn();
    useCommandStore.getState().register({
      id: 'test-cmd',
      label: 'Test Command',
      surface: 'storefront',
      action,
    });

    render(<CommandBar />);
    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    // Click on the command item — cmdk uses data-value attributes
    const item = screen.getByText('Test Command');
    fireEvent.click(item.closest('[cmdk-item]') ?? item);

    expect(action).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('displays shortcut hint when provided', async () => {
    useCommandStore.getState().register({
      id: 'shortcut-cmd',
      label: 'Shortcut Command',
      surface: 'storefront',
      action: vi.fn(),
      shortcut: '⌘S',
    });

    render(<CommandBar />);
    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    await waitFor(() => {
      expect(screen.getByText('⌘S')).toBeTruthy();
    });
  });

  it('closes on overlay click', async () => {
    render(<CommandBar />);
    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    // Click on the overlay (the backdrop div)
    const overlay = screen.getByRole('dialog').querySelector('[aria-hidden="true"]');
    if (overlay) {
      fireEvent.click(overlay);
    }

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('has accessible dialog semantics', async () => {
    render(<CommandBar />);
    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeTruthy();
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(dialog.getAttribute('aria-label')).toBe('Command palette');
    });
  });

  it('only renders groups that have commands', async () => {
    // Only register a storefront command
    useCommandStore.getState().register({
      id: 'store-cmd',
      label: 'Store Command',
      surface: 'storefront',
      action: vi.fn(),
    });

    render(<CommandBar />);
    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    expect(screen.getByText('Storefront')).toBeTruthy();
    expect(screen.queryByText('Admin')).toBeNull();
  });
});
