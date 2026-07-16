'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-label font-semibold transition-all duration-200',
          size === 'sm' && 'px-3 py-1.5 text-xs',
          size === 'md' && 'px-6 py-3 text-sm',
          size === 'lg' && 'px-8 py-4 text-base',
          variant === 'primary' && 'text-white shadow-luxury hover:shadow-luxury-lg hover:scale-[1.02] active:scale-[0.98]',
          variant === 'secondary' && 'border hover:shadow-luxury',
          variant === 'danger' && 'text-white hover:shadow-luxury hover:scale-[1.02]',
          variant === 'ghost' && 'hover:shadow-luxury',
          loading && 'opacity-70 cursor-not-allowed',
          className,
        )}
        style={{
          ...(variant === 'primary' && {
            background: 'linear-gradient(135deg, #d4af37 0%, #e9c349 50%, #d4af37 100%)',
            color: '#1c1b1b',
          }),
          ...(variant === 'secondary' && {
            borderColor: 'var(--color-dashboard-border)',
            color: 'var(--color-dashboard-text)',
            backgroundColor: 'var(--color-dashboard-surface)',
          }),
          ...(variant === 'danger' && {
            backgroundColor: '#ba1a1a',
            color: 'white',
          }),
        }}
        disabled={disabled || loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
