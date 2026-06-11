import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from 'cmdk';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CommandSurface } from '../stores/useCommandStore';
import { useCommandStore } from '../stores/useCommandStore';

const SURFACE_LABELS: Record<CommandSurface, string> = {
  storefront: 'Storefront',
  admin: 'Admin',
};

const SURFACE_ORDER: CommandSurface[] = ['storefront', 'admin'];

export function CommandBar() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const commands = useCommandStore((s) => s.commands);

  // Group commands by surface
  const grouped = SURFACE_ORDER.map((surface) => ({
    surface,
    label: SURFACE_LABELS[surface],
    commands: commands.filter((c) => c.surface === surface),
  })).filter((g) => g.commands.length > 0);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        // Ignore the key-repeat fire so holding Cmd+K doesn't toggle
        // the palette in a tight loop (the user can still tap it).
        if (e.repeat) return;
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  // Close on outside click
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-modal flex items-start justify-center pt-[20vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-ink-800/40 backdrop-blur-sm"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Command palette container */}
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-parchment-300 bg-parchment-50 shadow-lift animate-enter"
      >
        <Command label="Command palette" className="flex flex-col overflow-hidden rounded-2xl">
          {/* Search input */}
          <div className="flex items-center border-b border-parchment-300 px-4">
            <svg
              className="h-4 w-4 shrink-0 text-ink-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <CommandInput
              placeholder="Type a command..."
              className="flex-1 border-none bg-transparent px-3 py-3 font-body text-sm text-ink-700 placeholder:text-ink-300 focus:outline-none"
            />
            <kbd className="hidden rounded-md border border-parchment-300 bg-parchment-100 px-1.5 py-0.5 font-accent text-[10px] text-ink-400 sm:inline-block">
              ESC
            </kbd>
          </div>

          {/* Command list */}
          <CommandList className="max-h-72 overflow-y-auto p-2">
            <CommandEmpty className="px-4 py-8 text-center font-body text-sm text-ink-400">
              No commands found.
            </CommandEmpty>

            {grouped.map(({ surface, label, commands: cmds }) => (
              <CommandGroup
                key={surface}
                heading={
                  <span className="font-accent text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                    {label}
                  </span>
                }
                className="[&>[cmdk-group-heading]]:px-2 [&>[cmdk-group-heading]]:py-1.5 [&>[cmdk-group-items]]:flex [&>[cmdk-group-items]]:flex-col"
              >
                {cmds.map((cmd) => (
                  <CommandItem
                    key={cmd.id}
                    value={cmd.id}
                    onSelect={() => {
                      cmd.action();
                      setOpen(false);
                    }}
                    className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 font-body text-sm text-ink-600 transition-colors data-[selected=true]:bg-botanical-100 data-[selected=true]:text-ink-700"
                  >
                    <span>{cmd.label}</span>
                    {cmd.shortcut && (
                      <kbd className="ml-auto rounded-md border border-parchment-300 bg-parchment-100 px-1.5 py-0.5 font-accent text-[10px] text-ink-400">
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </div>
    </div>
  );
}
