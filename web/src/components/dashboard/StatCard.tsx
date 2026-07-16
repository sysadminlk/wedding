'use client';

import { Card } from '@/components/ui/Card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

export function StatCard({ label, value, icon, color = '#d4af37' }: StatCardProps) {
  return (
    <Card className="p-5 hover:shadow-luxury transition-shadow">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs font-label uppercase tracking-wider" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            {label}
          </p>
          <p className="text-2xl font-heading font-bold" style={{ color: 'var(--color-dashboard-text)' }}>
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}
