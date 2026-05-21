import { IconLayoutSidebar, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useLayoutStore } from '../stores/useLayoutStore';

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  const collapsed = useLayoutStore((s) => s.collapsed);
  const toggle = useLayoutStore((s) => s.toggle);

  return (
    <div className="flex h-screen overflow-hidden bg-parchment">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-ink/10 bg-parchment transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[52px]' : 'w-[240px]'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex h-12 items-center justify-between border-b border-ink/10 px-3">
          {!collapsed && (
            <span className="font-display text-sm font-semibold tracking-wide text-ink">Admin</span>
          )}
          <button
            type="button"
            onClick={toggle}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-ink/60 transition-colors hover:bg-botanical/10 hover:text-ink"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
          </button>
        </div>

        {/* Sidebar nav placeholder */}
        <nav className="flex-1 px-2 py-3">
          <div className="flex items-center gap-3 rounded px-2 py-2 text-ink/60 transition-colors hover:bg-botanical/10 hover:text-ink">
            <IconLayoutSidebar size={20} className="shrink-0" />
            {!collapsed && <span className="text-sm">Dashboard</span>}
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
