import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCommandStore } from '@/stores/useCommandStore';

describe('useCommandStore', () => {
  beforeEach(() => {
    useCommandStore.getState().clearCommands();
  });

  describe('register', () => {
    it('adds a command to the store', () => {
      const action = vi.fn();
      useCommandStore.getState().register({
        id: 'nav.cart',
        label: 'Go to Cart',
        surface: 'storefront',
        action,
      });

      const { commands } = useCommandStore.getState();
      expect(commands).toHaveLength(1);
      expect(commands[0].id).toBe('nav.cart');
      expect(commands[0].label).toBe('Go to Cart');
      expect(commands[0].surface).toBe('storefront');
      expect(commands[0].action).toBe(action);
    });

    it('returns an unsubscribe function that removes the command', () => {
      const unsubscribe = useCommandStore.getState().register({
        id: 'nav.home',
        label: 'Go Home',
        surface: 'storefront',
        action: vi.fn(),
      });

      expect(useCommandStore.getState().commands).toHaveLength(1);

      unsubscribe();

      expect(useCommandStore.getState().commands).toHaveLength(0);
    });

    it('replaces an existing command when registering with the same id', () => {
      const firstAction = vi.fn();
      const secondAction = vi.fn();

      useCommandStore.getState().register({
        id: 'nav.cart',
        label: 'Go to Cart',
        surface: 'storefront',
        action: firstAction,
      });

      useCommandStore.getState().register({
        id: 'nav.cart',
        label: 'View Cart',
        surface: 'storefront',
        action: secondAction,
      });

      const { commands } = useCommandStore.getState();
      expect(commands).toHaveLength(1);
      expect(commands[0].label).toBe('View Cart');
      expect(commands[0].action).toBe(secondAction);
    });
  });

  describe('clearCommands', () => {
    it('empties the store', () => {
      useCommandStore.getState().register({
        id: 'cmd.1',
        label: 'Command 1',
        surface: 'storefront',
        action: vi.fn(),
      });
      useCommandStore.getState().register({
        id: 'cmd.2',
        label: 'Command 2',
        surface: 'admin',
        action: vi.fn(),
      });

      expect(useCommandStore.getState().commands).toHaveLength(2);

      useCommandStore.getState().clearCommands();

      expect(useCommandStore.getState().commands).toHaveLength(0);
    });
  });

  describe('surface field', () => {
    it('carries storefront surface correctly', () => {
      useCommandStore.getState().register({
        id: 'store.cmd',
        label: 'Store Command',
        surface: 'storefront',
        action: vi.fn(),
      });

      expect(useCommandStore.getState().commands[0].surface).toBe('storefront');
    });

    it('carries admin surface correctly', () => {
      useCommandStore.getState().register({
        id: 'admin.cmd',
        label: 'Admin Command',
        surface: 'admin',
        action: vi.fn(),
      });

      expect(useCommandStore.getState().commands[0].surface).toBe('admin');
    });
  });
});
