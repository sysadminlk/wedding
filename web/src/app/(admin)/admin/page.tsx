'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  DollarSign,
  Activity,
  Palette,
  Mail,
  HardDrive,
  CreditCard,
  Languages,
  Layout,
  Server,
  Database,
  Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

interface SystemInfo {
  version: string;
  uptime: string;
  databaseStatus: string;
}

const QUICK_LINKS = [
  { label: 'Branding', href: '/admin/branding', icon: <Palette size={20} /> },
  { label: 'Email', href: '/admin/email', icon: <Mail size={20} /> },
  { label: 'Storage', href: '/admin/storage', icon: <HardDrive size={20} /> },
  { label: 'Payments', href: '/admin/payments', icon: <CreditCard size={20} /> },
  { label: 'Languages', href: '/admin/languages', icon: <Languages size={20} /> },
  { label: 'Landing Pages', href: '/admin/landing', icon: <Layout size={20} /> },
];

export default function AdminPage() {
  const [stats, setStats] = useState({ tenants: 0, users: 0, revenue: 0, health: 'Good' });
  const [system, setSystem] = useState<SystemInfo>({ version: '1.0.0', uptime: '0d', databaseStatus: 'Connected' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setStats(data.data ?? data);
        }
      } catch {}
      try {
        const res = await fetch('/api/admin/system', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setSystem(data.data ?? data);
        }
      } catch {}
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-3"
            style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }}
          />
          <p className="text-sm font-label" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Tenants', value: stats.tenants.toLocaleString(), icon: <Users size={20} />, color: '#d4af37' },
    { label: 'Active Users', value: stats.users.toLocaleString(), icon: <UserCheck size={20} />, color: '#16a34a' },
    { label: 'Total Revenue', value: `LKR ${stats.revenue.toLocaleString()}`, icon: <DollarSign size={20} />, color: '#7c3aed' },
    { label: 'System Health', value: stats.health, icon: <Activity size={20} />, color: stats.health === 'Good' ? '#16a34a' : '#ba1a1a' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Admin Panel" description="System-wide configuration and monitoring" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
              >
                {stat.icon}
              </div>
              <div>
                <p className="font-label text-xs uppercase tracking-wider" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  {stat.label}
                </p>
                <p className="font-heading font-bold text-lg" style={{ color: 'var(--color-dashboard-text)' }}>
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Palette size={18} style={{ color: '#d4af37' }} />
          <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--color-dashboard-text)' }}>
            Quick Links
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_LINKS.map((link) => (
            <Link key={link.label} href={link.href}>
              <div
                className="flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-200 hover:shadow-luxury cursor-pointer text-center"
                style={{
                  borderColor: 'var(--color-dashboard-border)',
                  backgroundColor: 'var(--color-dashboard-surface)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#d4af3720', color: '#d4af37' }}
                >
                  {link.icon}
                </div>
                <span className="font-label text-sm font-semibold" style={{ color: 'var(--color-dashboard-text)' }}>
                  {link.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Server size={18} style={{ color: '#d4af37' }} />
          <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--color-dashboard-text)' }}>
            System Information
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-dashboard-bg)' }}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#d4af3720', color: '#d4af37' }}
            >
              <Server size={20} />
            </div>
            <div>
              <p className="font-label text-xs uppercase tracking-wider" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                Version
              </p>
              <p className="font-heading font-bold text-sm" style={{ color: 'var(--color-dashboard-text)' }}>
                {system.version}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-dashboard-bg)' }}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#d4af3720', color: '#d4af37' }}
            >
              <Clock size={20} />
            </div>
            <div>
              <p className="font-label text-xs uppercase tracking-wider" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                Uptime
              </p>
              <p className="font-heading font-bold text-sm" style={{ color: 'var(--color-dashboard-text)' }}>
                {system.uptime}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-dashboard-bg)' }}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: system.databaseStatus === 'Connected' ? '#16a34a20' : '#ba1a1a20',
                color: system.databaseStatus === 'Connected' ? '#16a34a' : '#ba1a1a',
              }}
            >
              <Database size={20} />
            </div>
            <div>
              <p className="font-label text-xs uppercase tracking-wider" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                Database
              </p>
              <p className="font-heading font-bold text-sm" style={{ color: 'var(--color-dashboard-text)' }}>
                {system.databaseStatus}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
