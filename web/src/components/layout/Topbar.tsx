'use client';

import { useTheme } from '@/components/layout/ThemeProvider';
import { Sun, Moon, Bell, Search, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch {}
    };
    fetchUser();
  }, []);

  return (
    <header
      className="fixed top-0 right-0 left-0 lg:left-64 h-16 z-30 flex items-center justify-between px-6 glass border-b"
      style={{ borderColor: 'var(--color-dashboard-border)' }}
    >
      <div className="flex items-center gap-4 flex-1 max-w-md ml-12 lg:ml-0">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-dashboard-text-secondary)' }} />
          <input
            type="text"
            placeholder="Search guests, vendors, tasks..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm font-body"
            style={{
              backgroundColor: 'var(--color-dashboard-surface)',
              border: '1px solid var(--color-dashboard-border)',
              color: 'var(--color-dashboard-text)',
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl transition-colors"
          style={{ backgroundColor: 'var(--color-dashboard-surface)', color: 'var(--color-dashboard-text-secondary)' }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          className="relative p-2 rounded-xl transition-colors"
          style={{ backgroundColor: 'var(--color-dashboard-surface)', color: 'var(--color-dashboard-text-secondary)' }}
        >
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#ba1a1a' }} />
        </button>

        <div className="flex items-center gap-2 pl-3 border-l" style={{ borderColor: 'var(--color-dashboard-border)' }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-label"
            style={{ background: 'linear-gradient(135deg, #d4af37, #e9c349)', color: '#1c1b1b' }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <ChevronDown size={14} style={{ color: 'var(--color-dashboard-text-secondary)' }} />
        </div>
      </div>
    </header>
  );
}
