'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import DemoModeBanner from '@/components/DemoModeBanner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) {
          router.push('/login');
        } else {
          setLoading(false);
        }
      } catch {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-dashboard-bg)' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
          <p className="text-sm font-label" style={{ color: 'var(--color-dashboard-text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <DemoModeBanner />
      <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-dashboard-bg)' }}>
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-screen lg:ml-0">
          <Topbar />
          <div className="flex-1 p-6 lg:p-8 pt-20 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
