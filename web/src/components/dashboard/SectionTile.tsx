'use client';

import Link from 'next/link';

interface SectionTileProps {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function SectionTile({ label, href, icon }: SectionTileProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 hover:shadow-luxury"
      style={{
        backgroundColor: 'var(--color-dashboard-surface)',
        border: '1px solid var(--color-dashboard-border)',
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-colors group-hover:bg-[#d4af37]"
        style={{
          backgroundColor: 'var(--color-dashboard-surface)',
          color: 'var(--color-accent-primary)',
        }}
      >
        {icon}
      </div>
      <span className="text-xs font-label font-medium text-center" style={{ color: 'var(--color-dashboard-text)' }}>
        {label}
      </span>
    </Link>
  );
}
