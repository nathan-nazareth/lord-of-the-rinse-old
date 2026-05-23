import {
  IconLayoutDashboard,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
  IconTags,
  IconPackages,
  IconBoxSeam,
  IconReceipt,
  IconHammer,
  IconArrowLeft,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useLayoutStore } from '../stores/useLayoutStore';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  {
    to: '/admin',
    label: 'Dashboard',
    icon: <IconLayoutDashboard size={20} className="shrink-0" />,
  },
  {
    to: '/admin/attributes',
    label: 'Attributes',
    icon: <IconTags size={20} className="shrink-0" />,
  },
  {
    to: '/admin/variants',
    label: 'Variants',
    icon: <IconPackages size={20} className="shrink-0" />,
  },
  {
    to: '/admin/orders',
    label: 'Orders',
    icon: <IconReceipt size={20} className="shrink-0" />,
  },
  {
    to: '/admin/production',
    label: 'Production',
    icon: <IconHammer size={20} className="shrink-0" />,
  },
  {
    to: '/admin/stock',
    label: 'Stock',
    icon: <IconBoxSeam size={20} className="shrink-0" />,
  },
  {
    to: '/admin/settings',
    label: 'Settings',
    icon: <IconSettings size={20} className="shrink-0" />,
  },
];

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  const collapsed = useLayoutStore((s) => s.collapsed);
  const toggle = useLayoutStore((s) => s.toggle);
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(to);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-parchment-100">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-parchment-300/60 bg-parchment-50 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[56px]' : 'w-[240px]'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex h-14 items-center justify-between border-b border-parchment-300/60 px-3">
          {!collapsed && (
            <div className="flex items-center gap-2.5 pl-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-terra-400">
                <span className="text-[10px] font-bold text-white font-accent">LR</span>
              </div>
              <span className="font-display text-sm font-semibold tracking-wide text-ink-700">
                Lord of the Rinse
              </span>
            </div>
          )}
          {collapsed && (
            <div className="flex w-full justify-center">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-terra-400">
                <span className="text-[10px] font-bold text-white font-accent">LR</span>
              </div>
            </div>
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

        {/* Sidebar nav */}
        <nav className="flex-1 px-2 py-4 space-y-1" aria-label="Admin navigation">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                isActive(item.to)
                  ? 'bg-terra-100/80 text-terra-600 font-medium'
                  : 'text-ink-500 hover:bg-parchment-200/60 hover:text-ink-700'
              }`}
              aria-current={isActive(item.to) ? 'page' : undefined}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-parchment-300/60 px-2 py-3 space-y-1">
          <Link
            to="/"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-400 transition-all duration-200 hover:bg-parchment-200/60 hover:text-ink-600 ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Back to Store' : undefined}
          >
            <IconArrowLeft size={18} className="shrink-0" />
            {!collapsed && <span>Back to Store</span>}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
