'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { DataTable, Column } from '@/components/dashboard/DataTable';
import { Button } from '@/components/ui/Button';
import { GuestForm } from './GuestForm';
import { Guest } from '@/types';

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), size: '20' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/guests?${params}`, { credentials: 'include' });
      const data = await res.json();
      setGuests(data.content || []);
      setTotal(data.totalElements || 0);
    } catch {
      setGuests([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchGuests(); }, [fetchGuests]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this guest?')) return;
    await fetch(`/api/guests/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchGuests();
  };

  const columns: Column<Guest>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'side', header: 'Side', render: (item) => <span className="capitalize">{item.side}</span> },
    { key: 'rsvpStatus', header: 'RSVP', render: (item) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        item.rsvpStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
        item.rsvpStatus === 'declined' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {item.rsvpStatus}
      </span>
    )},
    { key: 'partySize', header: 'Party Size' },
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
        title="Guests"
        description="Manage your guest list and RSVPs"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">Import CSV</Button>
            <Button size="sm" onClick={() => { setEditing(null); setShowForm(true); }}>Add Guest</Button>
          </div>
        }
      />

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search guests..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="px-4 py-2 rounded-lg border text-sm w-full max-w-sm"
          style={{
            backgroundColor: 'var(--input-bg)',
            borderColor: 'var(--input-border)',
            color: 'var(--color-dashboard-text)',
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={guests}
        totalElements={total}
        page={page}
        onPageChange={setPage}
      />

      {showForm && (
        <GuestForm
          guest={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); fetchGuests(); }}
        />
      )}
    </div>
  );
}
