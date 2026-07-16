'use client';

import { useState } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-heading font-bold" style={{ color: 'var(--color-dashboard-text)' }}>
          {title}
        </h1>
        {description && (
          <p className="text-sm font-body mt-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
