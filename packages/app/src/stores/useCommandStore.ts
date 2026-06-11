import { create } from 'zustand';

export type CommandSurface = 'storefront' | 'admin';

export interface Command {
  id: string;
  label: string;
  surface: CommandSurface;
  action: () => void;
  shortcut?: string;
  group?: string;
}

interface CommandStore {
  commands: Command[];
  register: (command: Command) => () => void;
  // Batch registration for components that add several commands at once.
  // Updates the store once instead of N times, so the CommandBar only
  // re-renders once.
  registerMany: (commands: Command[]) => () => void;
  clearCommands: () => void;
}

export const useCommandStore = create<CommandStore>()((set) => ({
  commands: [],

  register: (command) => {
    set((state) => ({
      commands: [...state.commands.filter((c) => c.id !== command.id), command],
    }));

    return () => {
      set((state) => ({
        commands: state.commands.filter((c) => c.id !== command.id),
      }));
    };
  },

  registerMany: (commands) => {
    set((state) => {
      const newIds = new Set(commands.map((c) => c.id));
      // Drop any existing entries whose id we're about to replace, then
      // append the fresh commands. Preserves the relative order of the
      // survivors (e.g. registrations made in earlier effects) so the
      // palette groups them predictably.
      const survivors = state.commands.filter((c) => !newIds.has(c.id));
      return { commands: [...survivors, ...commands] };
    });

    return () => {
      const ids = new Set(commands.map((c) => c.id));
      set((state) => ({
        commands: state.commands.filter((c) => !ids.has(c.id)),
      }));
    };
  },

  clearCommands: () => set({ commands: [] }),
}));
