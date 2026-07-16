'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { DataTable, Column } from '@/components/dashboard/DataTable';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/dashboard/StatCard';
import { BudgetForm } from './BudgetForm';
import { BudgetItem } from '@/types';
import { DollarSign } from 'lucide-react';

export default function BudgetPage() {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BudgetItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalEstimated: 0, totalActual: 0, totalPaid: 0 });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        fetch(`/api/budget?page=${page}&size=20`, { credentials: 'include' }),
        fetch('/api/budget/summary', { credentials: 'include' }),
      ]);
      const listData = await listRes.json();
      const summaryData = await summaryRes.json();
      setItems(listData.content || []);
      setTotal(listData.totalElements || 0);
      setSummary(summaryData);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this budget item?')) return;
    await fetch(`/api/budget/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchItems();
  };

  const columns: Column<BudgetItem>[] = [
    { key: 'category', header: 'Category', sortable: true },
    { key: 'description', header: 'Description' },
    { key: 'estimatedCost', header: 'Estimated', render: (item) => `$${item.estimatedCost.toLocaleString()}` },
    { key: 'actualCost', header: 'Actual', render: (item) => `$${item.actualCost.toLocaleString()}` },
    { key: 'paid', header: 'Status', render: (item) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        item.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {item.paid ? 'Paid' : 'Pending'}
      </span>
    )},
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
        title="Budget"
        description="Track your wedding expenses"
        actions={<Button size="sm" onClick={() => { setEditing(null); setShowForm(true); }}>Add Item</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Estimated Total" value={`$${summary.totalEstimated.toLocaleString()}`} icon={<DollarSign size={20} />} />
        <StatCard label="Actual Total" value={`$${summary.totalActual.toLocaleString()}`} icon={<DollarSign size={20} />} />
        <StatCard label="Total Paid" value={`$${summary.totalPaid.toLocaleString()}`} icon={<DollarSign size={20} />} />
      </div>

      <DataTable
        columns={columns}
        data={items}
        totalElements={total}
        page={page}
        onPageChange={setPage}
      />

      {showForm && (
        <BudgetForm
          item={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); fetchItems(); }}
        />
      )}
    </div>
  );
}
