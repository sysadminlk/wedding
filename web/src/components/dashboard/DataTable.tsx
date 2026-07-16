'use client';

import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T & string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  totalElements?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  totalElements = 0,
  page = 0,
  onPageChange,
}: DataTableProps<T>) {
  const pageSize = 20;
  const totalPages = Math.ceil(totalElements / pageSize);

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-dashboard-border)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--color-dashboard-surface)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 font-label text-xs uppercase tracking-wider"
                  style={{ color: 'var(--color-dashboard-text-secondary)' }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center font-body text-sm"
                  style={{ color: 'var(--color-dashboard-text-secondary)' }}
                >
                  No data found
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr
                  key={i}
                  className="border-t transition-colors hover:bg-[var(--color-dashboard-surface)]"
                  style={{ borderColor: 'var(--color-dashboard-border)' }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 font-body"
                      style={{ color: 'var(--color-dashboard-text)' }}
                    >
                      {col.render ? col.render(item) : String(item[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          className="flex items-center justify-between px-4 py-3 border-t"
          style={{ borderColor: 'var(--color-dashboard-border)' }}
        >
          <span className="text-xs font-body" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            {totalElements} total
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange?.(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 rounded-lg text-xs font-label disabled:opacity-40"
              style={{
                backgroundColor: 'var(--color-dashboard-surface)',
                color: 'var(--color-dashboard-text)',
              }}
            >
              Prev
            </button>
            <span className="px-3 py-1 text-xs font-label" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange?.(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 rounded-lg text-xs font-label disabled:opacity-40"
              style={{
                backgroundColor: 'var(--color-dashboard-surface)',
                color: 'var(--color-dashboard-text)',
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
