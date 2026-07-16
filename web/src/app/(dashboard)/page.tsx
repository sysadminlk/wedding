'use client';

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { SectionTile } from '@/components/dashboard/SectionTile';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Card } from '@/components/ui/Card';
import {
  LayoutDashboard,
  CheckSquare,
  DollarSign,
  Users,
  Grid3X3,
  Box,
  Store,
  UserPlus,
  Clock,
  Palette,
  UtensilsCrossed,
  Camera,
  Video,
  Globe,
  Mail,
  HeartHandshake,
  Calendar,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

const sectionTiles = [
  { label: 'My Wedding', href: '/checklist', icon: <LayoutDashboard size={20} /> },
  { label: 'Guest List', href: '/guests', icon: <Users size={20} /> },
  { label: 'Vendor Bookings', href: '/vendors', icon: <Store size={20} /> },
  { label: 'Budget Tracker', href: '/budget', icon: <DollarSign size={20} /> },
  { label: 'Design Suite', href: '/inspiration', icon: <Palette size={20} /> },
  { label: 'Settings', href: '/collaborators', icon: <CheckSquare size={20} /> },
];

const quickLinks = [
  { label: 'Plan', href: '/checklist', icon: <Calendar size={18} /> },
  { label: 'Guests', href: '/guests', icon: <Users size={18} /> },
  { label: 'Market', href: '/vendors', icon: <Store size={18} /> },
  { label: 'Registry', href: '/gifts', icon: <HeartHandshake size={18} /> },
  { label: 'More', href: '/menu', icon: <LayoutDashboard size={18} /> },
];

const milestones = [
  { label: 'Logistics & Venue', percent: 80, color: '#166d13' },
  { label: 'Guest Experience', percent: 45, color: '#d4af37' },
  { label: 'Aesthetic & Design', percent: 30, color: '#8c4b55' },
];

const journalUpdates = [
  { icon: '✓', title: 'RSVP Received', desc: 'Michael & Chloe confirmed attendance.', time: '2 hours ago', color: '#166d13' },
  { icon: '📄', title: 'Agreement Secured', desc: 'Lumière Studio photography agreement finalized.', time: '5 hours ago', color: '#d4af37' },
  { icon: '📊', title: 'Budget Notification', desc: 'Floral estimate exceeded allocation by $400.', time: 'Yesterday', color: '#ba1a1a' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    daysUntilWedding: number;
    budgetSummary: { totalEstimated: number; totalActual: number; totalPaid: number };
    guestSummary: { total: number; confirmed: number; declined: number; pending: number };
    checklistSummary: { total: number; completed: number };
  } | null>(null);

  const [countdown, setCountdown] = useState({ days: 182, hours: 14, mins: 32 });

  useEffect(() => {
    fetch('/api/dashboard', { credentials: 'include' })
      .then((res) => res.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1 };
        if (prev.hours > 0) return { days: prev.days, hours: prev.hours - 1, mins: 59 };
        if (prev.days > 0) return { days: prev.days - 1, hours: 23, mins: 59 };
        return prev;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const days = stats?.daysUntilWedding ?? countdown.days;
  const budgetPercent = stats ? Math.round((stats.budgetSummary.totalActual / stats.budgetSummary.totalEstimated) * 100) : 65;
  const confirmed = stats?.guestSummary.confirmed ?? 92;
  const pending = stats?.guestSummary.pending ?? 45;
  const declined = stats?.guestSummary.declined ?? 13;
  const totalGuests = stats?.guestSummary.total ?? 150;
  const completedTasks = stats?.checklistSummary.completed ?? 0;
  const totalTasks = stats?.checklistSummary.total ?? 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Countdown Hero */}
      <div
        className="rounded-2xl p-8 mb-8 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1c1b1b 0%, #313030 100%)' }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #d4af37 0%, transparent 50%)' }} />
        <p className="text-sm font-label uppercase tracking-[0.2em] mb-2" style={{ color: '#d4af37' }}>
          A Celebration of Elegance
        </p>
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-6">
          Your Big Day
        </h2>
        <div className="flex items-center justify-center gap-6 md:gap-10">
          <div className="text-center">
            <span className="text-4xl md:text-5xl font-heading font-bold gold-text">{days}</span>
            <p className="text-xs uppercase tracking-widest mt-1 text-gray-400">Days</p>
          </div>
          <span className="text-2xl text-gray-600">:</span>
          <div className="text-center">
            <span className="text-4xl md:text-5xl font-heading font-bold gold-text">{countdown.hours}</span>
            <p className="text-xs uppercase tracking-widest mt-1 text-gray-400">Hours</p>
          </div>
          <span className="text-2xl text-gray-600">:</span>
          <div className="text-center">
            <span className="text-4xl md:text-5xl font-heading font-bold gold-text">{countdown.mins}</span>
            <p className="text-xs uppercase tracking-widest mt-1 text-gray-400">Mins</p>
          </div>
        </div>
      </div>

      {/* Quick Section Links */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
        {sectionTiles.map((section) => (
          <SectionTile
            key={section.href}
            label={section.label}
            href={section.href}
            icon={section.icon}
          />
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-5">
          <p className="text-xs font-label uppercase tracking-wider mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>Total Guests</p>
          <p className="text-3xl font-heading font-bold" style={{ color: 'var(--color-dashboard-text)' }}>{totalGuests}</p>
          <div className="flex gap-3 mt-2">
            <span className="text-xs" style={{ color: '#166d13' }}>{confirmed} confirmed</span>
            <span className="text-xs" style={{ color: '#cba72f' }}>{pending} pending</span>
            <span className="text-xs" style={{ color: '#ba1a1a' }}>{declined} declined</span>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-label uppercase tracking-wider mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>Budget Utilized</p>
          <p className="text-3xl font-heading font-bold" style={{ color: 'var(--color-dashboard-text)' }}>{budgetPercent}%</p>
          <div className="w-full h-2 rounded-full mt-3" style={{ backgroundColor: 'var(--color-dashboard-border)' }}>
            <div className="h-full rounded-full" style={{ width: `${budgetPercent}%`, background: 'linear-gradient(90deg, #d4af37, #e9c349)' }} />
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-label uppercase tracking-wider mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>Checklist</p>
          <p className="text-3xl font-heading font-bold" style={{ color: 'var(--color-dashboard-text)' }}>
            {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '0%'}
          </p>
          <div className="w-full h-2 rounded-full mt-3" style={{ backgroundColor: 'var(--color-dashboard-border)' }}>
            <div className="h-full rounded-full" style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`, backgroundColor: '#166d13' }} />
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-label uppercase tracking-wider mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>Vendors Booked</p>
          <p className="text-3xl font-heading font-bold" style={{ color: 'var(--color-dashboard-text)' }}>4 / 12</p>
          <p className="text-xs mt-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>8 remaining</p>
        </Card>
      </div>

      {/* Planning Milestones + Journal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones */}
        <Card className="p-6">
          <h3 className="font-heading font-bold text-lg mb-4" style={{ color: 'var(--color-dashboard-text)' }}>
            Planning Milestones
          </h3>
          <div className="space-y-4">
            {milestones.map((m) => (
              <div key={m.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-dashboard-text)' }}>{m.label}</span>
                  <span className="text-sm font-bold" style={{ color: m.color }}>{m.percent}%</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--color-dashboard-border)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${m.percent}%`, backgroundColor: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Journal Updates */}
        <Card className="p-6">
          <h3 className="font-heading font-bold text-lg mb-4" style={{ color: 'var(--color-dashboard-text)' }}>
            Journal Updates
          </h3>
          <div className="space-y-4">
            {journalUpdates.map((update, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0" style={{ borderColor: 'var(--color-dashboard-border)' }}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                  style={{ backgroundColor: `${update.color}15`, color: update.color }}
                >
                  {update.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-dashboard-text)' }}>{update.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-dashboard-text-secondary)' }}>{update.desc}</p>
                </div>
                <span className="text-xs whitespace-nowrap" style={{ color: 'var(--color-dashboard-text-secondary)' }}>{update.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
