import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
  collapsed: boolean;
}

interface LayoutActions {
  toggle: () => void;
}

export const useLayoutStore = create<LayoutState & LayoutActions>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((state) => ({ collapsed: !state.collapsed })),
    }),
    { name: 'soap:v1:layout' },
  ),
);
