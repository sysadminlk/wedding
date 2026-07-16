'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Users,
  ClipboardList,
  LayoutGrid,
  CheckSquare,
  DollarSign,
  Store,
  Heart,
  Clock,
  Palette,
  Camera,
  Film,
  Gift,
  MessageSquare,
  UserPlus,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

const sections = [
  { icon: Globe, label: 'Wedding Website', href: '/website' },
  { icon: Users, label: 'Guest List', href: '/guests' },
  { icon: ClipboardList, label: 'RSVP', href: '/rsvp' },
  { icon: LayoutGrid, label: 'Seating Chart', href: '/seating' },
  { icon: CheckSquare, label: 'Checklists', href: '/checklist' },
  { icon: DollarSign, label: 'Budget', href: '/budget' },
  { icon: Store, label: 'Vendors', href: '/vendors' },
  { icon: Heart, label: 'Wedding Party', href: '/crew' },
  { icon: Clock, label: 'Timeline', href: '/timeline' },
  { icon: Palette, label: 'Inspiration', href: '/inspiration' },
  { icon: Camera, label: 'Photos', href: '/photos' },
  { icon: Film, label: 'Memories', href: '/memories' },
  { icon: Gift, label: 'Gift Registry', href: '/gifts' },
  { icon: MessageSquare, label: 'Messages', href: '/messages' },
  { icon: UserPlus, label: 'Collaborators', href: '/collaborators' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <button
        className={cn(
          'fixed top-4 left-4 z-50 lg:hidden',
          'p-2 rounded-lg glass transition-colors',
        )}
        style={{ color: 'var(--color-dashboard-text-secondary)' }}
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'glass h-screen flex flex-col font-label transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-64',
          'lg:flex',
          'max-lg:hidden',
          mobileOpen &&
            'max-lg:!fixed max-lg:!inset-y-0 max-lg:!left-0 max-lg:!z-50 max-lg:!flex max-lg:!w-[280px]',
        )}
        style={{
          border: 'none',
          borderRight: '1px solid var(--color-dashboard-border)',
        }}
        aria-label="Main navigation"
      >
        <div
          className={cn(
            'flex items-center px-5 py-4 border-b shrink-0',
            collapsed ? 'justify-center' : 'justify-between',
          )}
          style={{ borderColor: 'var(--color-dashboard-border)' }}
        >
          {!collapsed && (
            <span className="font-heading text-xl font-bold gold-text select-none">
              WeddingHub
            </span>
          )}

          <button
            className="lg:hidden p-1.5 rounded-lg transition-colors hover:bg-[var(--color-dashboard-border)]"
            style={{ color: 'var(--color-dashboard-text-secondary)' }}
            onClick={closeMobile}
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>

          <button
            className="hidden lg:flex p-1.5 rounded-lg transition-colors hover:bg-[var(--color-dashboard-border)]"
            style={{ color: 'var(--color-dashboard-text-secondary)' }}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav
          className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5"
          role="navigation"
        >
          {sections.map((section) => {
            const active = isActive(section.href);

            return (
              <Link
                key={section.href}
                href={section.href}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm',
                  active
                    ? 'bg-[#d4af37]/10 text-[#d4af37] font-semibold'
                    : 'text-[var(--color-dashboard-text-secondary)] hover:bg-[var(--color-dashboard-border)] hover:text-[var(--color-dashboard-text)]',
                )}
                title={collapsed ? section.label : undefined}
                aria-current={active ? 'page' : undefined}
              >
                <section.icon
                  size={18}
                  strokeWidth={active ? 2.5 : 1.75}
                  className={cn(
                    'shrink-0 transition-colors duration-200',
                    active
                      ? 'text-[#d4af37]'
                      : 'group-hover:text-[var(--color-dashboard-text)]',
                  )}
                />
                {!collapsed && <span className="truncate">{section.label}</span>}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div
            className="px-4 py-3 border-t shrink-0"
            style={{ borderColor: 'var(--color-dashboard-border)' }}
          >
            <p
              className="text-xs text-center"
              style={{ color: 'var(--color-dashboard-text-secondary)' }}
            >
              &copy; 2024 WeddingHub
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
