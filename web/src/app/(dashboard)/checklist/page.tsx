'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { DataTable, Column } from '@/components/dashboard/DataTable';
import { Button } from '@/components/ui/Button';
import { ChecklistForm } from './ChecklistForm';
import { ChecklistItem } from '@/types';

export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ChecklistItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/checklist?page=${page}&size=20`, { credentials: 'include' });
      const data = await res.json();
      setItems(data.content || []);
      setTotal(data.totalElements || 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleToggleComplete = async (item: ChecklistItem) => {
    const endpoint = item.completed ? 'uncomplete' : 'complete';
    await fetch(`/api/checklist/${item.id}/${endpoint}`, { method: 'PUT', credentials: 'include' });
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    await fetch(`/api/checklist/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchItems();
  };

  const completedCount = items.filter((i) => i.completed).length;
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const columns: Column<ChecklistItem>[] = [
    { key: 'title', header: 'Task', sortable: true, render: (item) => (
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={item.completed}
          onChange={() => handleToggleComplete(item)}
          className="rounded"
        />
        <span className={item.completed ? 'line-through opacity-50' : ''}>{item.title}</span>
      </div>
    )},
    { key: 'phase', header: 'Phase', render: (item) => <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{item.phase}</span> },
    { key: 'dueDate', header: 'Due Date', render: (item) => item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—' },
    { key: 'id', header: 'Actions', render: (item) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => { setEditing(item); setShowForm(true); }}>Edit</Button>
        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Checklist"
        description={`${completedCount} of ${total} tasks completed (${progress}%)`}
        actions={<Button size="sm" onClick={() => { setEditing(null); setShowForm(true); }}>Add Task</Button>}
      />

      {/* Progress Bar */}
      <div className="mb-6 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-dashboard-border)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, backgroundColor: 'var(--color-dashboard-accent)' }}
        />
      </div>

      <DataTable
        columns={columns}
        data={items}
        totalElements={total}
        page={page}
        onPageChange={setPage}
      />

      {showForm && (
        <ChecklistForm
          item={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); fetchItems(); }}
        />
      )}
    </div>
  );
}
