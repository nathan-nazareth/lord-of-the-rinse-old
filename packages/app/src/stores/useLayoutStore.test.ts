import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createJSONStorage } from 'zustand/middleware';
import { useLayoutStore } from '@/src/stores/useLayoutStore';
import { MockLocalStorage } from '@/src/test-utils/mock-local-storage';

describe('useLayoutStore', () => {
  let mockStorage: MockLocalStorage;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    vi.stubGlobal('localStorage', mockStorage);
    useLayoutStore.persist.setOptions({
      storage: createJSONStorage(() => mockStorage),
    });
    useLayoutStore.persist.clearStorage();
    useLayoutStore.setState({ collapsed: false });
  });

  describe('initial state', () => {
    it('starts with collapsed false', () => {
      const store = useLayoutStore.getState();
      expect(store.collapsed).toBe(false);
    });
  });

  describe('toggle', () => {
    it('flips collapsed from false to true', () => {
      useLayoutStore.getState().toggle();

      expect(useLayoutStore.getState().collapsed).toBe(true);
    });

    it('flips collapsed from true back to false', () => {
      useLayoutStore.getState().toggle();
      useLayoutStore.getState().toggle();

      expect(useLayoutStore.getState().collapsed).toBe(false);
    });
  });

  describe('persistence', () => {
    it('persists collapsed state to storage', () => {
      useLayoutStore.getState().toggle();

      const stored = mockStorage.getItem('soap:v1:layout');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored as string);
      expect(parsed.state.collapsed).toBe(true);
    });
  });
});
