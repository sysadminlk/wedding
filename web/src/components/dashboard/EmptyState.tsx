'use client';

interface EmptyStateProps {
  title?: string;
  description?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, message, icon, action }: EmptyStateProps) {
  const displayTitle = title || 'Coming Soon';
  const displayDescription = description || message || '';

  return (
    <div
      className="flex flex-col items-center justify-center py-16 text-center rounded-xl"
      style={{ backgroundColor: 'var(--color-dashboard-surface)' }}
    >
      {icon && (
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)', color: '#d4af37' }}
        >
          {icon}
        </div>
      )}
      <h3 className="text-lg font-heading font-bold mb-1" style={{ color: 'var(--color-dashboard-text)' }}>
        {displayTitle}
      </h3>
      <p className="text-sm font-body mb-4" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
        {displayDescription}
      </p>
      {action}
    </div>
  );
}
