'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-xs font-label uppercase tracking-wider" style={{ color: 'var(--color-auth-text-secondary)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl text-sm font-body transition-colors',
            'focus:outline-none focus:ring-2',
            error ? 'focus:ring-red-500' : 'focus:ring-[#d4af37]',
            className,
          )}
          style={{
            backgroundColor: 'var(--color-auth-input-bg)',
            border: '1px solid var(--color-auth-border)',
            color: 'var(--color-auth-text)',
          }}
          {...props}
        />
        {error && (
          <p className="text-xs font-body" style={{ color: '#ba1a1a' }}>{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
