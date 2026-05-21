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

  clearCommands: () => set({ commands: [] }),
}));
