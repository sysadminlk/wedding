'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { TimelineItem, PaginatedResponse } from '@/types';
import { Clock, Plus, Trash2, Edit, X } from 'lucide-react';

function TimelineForm({
  item,
  onClose,
  onSaved,
}: {
  item: TimelineItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(item?.title ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [startTime, setStartTime] = useState(item?.startTime?.slice(0, 16) ?? '');
  const [endTime, setEndTime] = useState(item?.endTime?.slice(0, 16) ?? '');
  const [sortOrder, setSortOrder] = useState(item?.sortOrder ?? 0);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        description: description || undefined,
        startTime,
        endTime: endTime || undefined,
        sortOrder,
      };
      if (item) {
        await fetch(`/api/timeline/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/timeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-dashboard-surface)' }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--color-dashboard-border)' }}
        >
          <h2
            className="text-lg font-heading font-bold"
            style={{ color: 'var(--color-dashboard-text)' }}
          >
            {item ? 'Edit Timeline Item' : 'Add Timeline Item'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: 'var(--color-dashboard-text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label
              className="block text-xs font-label font-semibold mb-1"
              style={{ color: 'var(--color-dashboard-text-secondary)' }}
            >
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-body border outline-none transition-colors"
              style={{
                backgroundColor: 'var(--color-dashboard-surface)',
                borderColor: 'var(--color-dashboard-border)',
                color: 'var(--color-dashboard-text)',
              }}
            />
          </div>

          <div>
            <label
              className="block text-xs font-label font-semibold mb-1"
              style={{ color: 'var(--color-dashboard-text-secondary)' }}
            >
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-body border outline-none transition-colors resize-none"
              style={{
                backgroundColor: 'var(--color-dashboard-surface)',
                borderColor: 'var(--color-dashboard-border)',
                color: 'var(--color-dashboard-text)',
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-label font-semibold mb-1"
                style={{ color: 'var(--color-dashboard-text-secondary)' }}
              >
                Start Time
              </label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-body border outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--color-dashboard-surface)',
                  borderColor: 'var(--color-dashboard-border)',
                  color: 'var(--color-dashboard-text)',
                }}
              />
            </div>
            <div>
              <label
                className="block text-xs font-label font-semibold mb-1"
                style={{ color: 'var(--color-dashboard-text-secondary)' }}
              >
                End Time
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-body border outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--color-dashboard-surface)',
                  borderColor: 'var(--color-dashboard-border)',
                  color: 'var(--color-dashboard-text)',
                }}
              />
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-label font-semibold mb-1"
              style={{ color: 'var(--color-dashboard-text-secondary)' }}
            >
              Sort Order
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
              className="w-24 rounded-xl px-4 py-2.5 text-sm font-body border outline-none transition-colors"
              style={{
                backgroundColor: 'var(--color-dashboard-surface)',
                borderColor: 'var(--color-dashboard-border)',
                color: 'var(--color-dashboard-text)',
              }}
            />
          </div>

          <div
            className="flex justify-end gap-3 pt-2 border-t"
            style={{ borderColor: 'var(--color-dashboard-border)' }}
          >
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {item ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TimelinePage() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TimelineItem | null>(null);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/timeline?page=${page}&size=${pageSize}`,
        { credentials: 'include' },
      );
      const data: PaginatedResponse<TimelineItem> = await res.json();
      const sorted = (data.content || []).sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
      setItems(sorted);
      setTotal(data.totalElements || 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this timeline item?')) return;
    await fetch(`/api/timeline/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    fetchItems();
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <PageHeader
        title="Timeline"
        description={`${total} event${total !== 1 ? 's' : ''} in your wedding timeline`}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <Plus size={16} className="mr-1.5" />
            Add Event
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Clock
            size={24}
            className="animate-spin"
            style={{ color: '#d4af37' }}
          />
        </div>
      ) : items.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed"
          style={{
            borderColor: 'var(--color-dashboard-border)',
            color: 'var(--color-dashboard-text-secondary)',
          }}
        >
          <Clock size={40} className="mb-3 opacity-40" style={{ color: '#d4af37' }} />
          <p className="text-sm font-body">No timeline events yet</p>
          <p className="text-xs font-body mt-1 opacity-60">
            Add your first event to start building your wedding day schedule
          </p>
        </div>
      ) : (
        <>
          <div className="relative ml-4">
            <div
              className="absolute left-0 top-0 bottom-0 w-0.5"
              style={{ backgroundColor: '#d4af37' }}
            />

            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="relative pl-8">
                  <div
                    className="absolute left-[-5px] top-1.5 w-3 h-3 rounded-full border-2"
                    style={{
                      backgroundColor: '#d4af37',
                      borderColor: '#d4af37',
                    }}
                  />

                  <div
                    className="rounded-2xl border p-5 transition-all hover:shadow-lg"
                    style={{
                      backgroundColor: 'var(--color-dashboard-surface)',
                      borderColor: 'var(--color-dashboard-border)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-base font-heading font-bold"
                          style={{ color: 'var(--color-dashboard-text)' }}
                        >
                          {item.title}
                        </h3>
                        {item.description && (
                          <p
                            className="text-sm font-body mt-1"
                            style={{
                              color: 'var(--color-dashboard-text-secondary)',
                            }}
                          >
                            {item.description}
                          </p>
                        )}
                        <div
                          className="flex items-center gap-4 mt-3 text-xs font-label"
                          style={{
                            color: 'var(--color-dashboard-text-secondary)',
                          }}
                        >
                          <span className="flex items-center gap-1.5">
                            <Clock size={13} />
                            {formatTime(item.startTime)}
                            {item.endTime && (
                              <> &mdash; {formatTime(item.endTime)}</>
                            )}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-full text-[11px]"
                            style={{
                              backgroundColor: 'var(--color-dashboard-border)',
                              color: 'var(--color-dashboard-text-secondary)',
                            }}
                          >
                            #{item.sortOrder}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditing(item);
                            setShowForm(true);
                          }}
                          className="p-2 rounded-lg transition-colors hover:opacity-80"
                          style={{
                            color: 'var(--color-dashboard-text-secondary)',
                          }}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-lg transition-colors hover:opacity-80"
                          style={{ color: '#ba1a1a' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span
                className="text-xs font-label px-3"
                style={{ color: 'var(--color-dashboard-text-secondary)' }}
              >
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {showForm && (
        <TimelineForm
          item={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            fetchItems();
          }}
        />
      )}
    </div>
  );
}
