'use client';

import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border shadow-luxury transition-all duration-200',
        className,
      )}
      style={{
        backgroundColor: 'var(--color-dashboard-surface)',
        borderColor: 'var(--color-dashboard-border)',
      }}
      {...props}
    >
      {children}
    </div>
  );
}
