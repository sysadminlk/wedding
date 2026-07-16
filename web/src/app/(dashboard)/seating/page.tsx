'use client';

import { useState, useEffect, useCallback } from 'react';
import { Grid3X3, Plus, Trash2, Edit, X, Users, UserMinus, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SeatingTable, Guest } from '@/types';

interface TableFormData {
  name: string;
  shape: 'round' | 'rectangular' | 'oval';
  capacity: number;
}

function TableForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TableFormData) => void;
  initialData?: TableFormData;
}) {
  const [formData, setFormData] = useState<TableFormData>(initialData || { name: '', shape: 'round', capacity: 8 });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({ name: '', shape: 'round', capacity: 8 });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl" style={{ color: 'var(--color-dashboard-text)' }}>
            {initialData ? 'Edit Table' : 'Add Table'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg">
            <X size={20} style={{ color: 'var(--color-dashboard-text-secondary)' }} />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); onClose(); }} className="space-y-4">
          <div>
            <label className="block text-xs font-label uppercase tracking-wider mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>Table Name</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm font-body" style={{ borderColor: 'var(--color-dashboard-border)', backgroundColor: 'var(--color-dashboard-surface)', color: 'var(--color-dashboard-text)' }} />
          </div>
          <div>
            <label className="block text-xs font-label uppercase tracking-wider mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>Shape</label>
            <select value={formData.shape} onChange={(e) => setFormData({ ...formData, shape: e.target.value as TableFormData['shape'] })}
              className="w-full px-3 py-2 rounded-lg border text-sm font-body" style={{ borderColor: 'var(--color-dashboard-border)', backgroundColor: 'var(--color-dashboard-surface)', color: 'var(--color-dashboard-text)' }}>
              <option value="round">Round</option>
              <option value="rectangular">Rectangular</option>
              <option value="oval">Oval</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-label uppercase tracking-wider mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>Capacity</label>
            <input type="number" min={1} max={20} required value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg border text-sm font-body" style={{ borderColor: 'var(--color-dashboard-border)', backgroundColor: 'var(--color-dashboard-surface)', color: 'var(--color-dashboard-text)' }} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">{initialData ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function SeatingPage() {
  const [tables, setTables] = useState<SeatingTable[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<{ id: string; data: TableFormData } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTables = useCallback(async () => {
    try {
      const res = await fetch('/api/tables', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTables(Array.isArray(data) ? data : data.content || []);
      }
    } catch { /* empty */ }
  }, []);

  const fetchGuests = useCallback(async () => {
    try {
      const res = await fetch('/api/guests?size=500', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setGuests(data.content || []);
      }
    } catch { /* empty */ }
  }, []);

  useEffect(() => {
    Promise.all([fetchTables(), fetchGuests()]).then(() => setLoading(false));
  }, [fetchTables, fetchGuests]);

  const handleCreate = async (data: TableFormData) => {
    await fetch('/api/tables', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(data) });
    fetchTables();
  };

  const handleUpdate = async (data: TableFormData) => {
    if (!editingTable) return;
    await fetch(`/api/tables/${editingTable.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(data) });
    setEditingTable(null);
    fetchTables();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this table?')) return;
    await fetch(`/api/tables/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchTables();
  };

  const handleAssignGuest = async (guestId: string, tableId: string) => {
    await fetch(`/api/tables/${guestId}/assign`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ tableId }) });
    fetchTables();
    fetchGuests();
  };

  const handleUnassignGuest = async (guestId: string) => {
    await fetch(`/api/tables/${guestId}/unassign`, { method: 'PUT', credentials: 'include' });
    fetchTables();
    fetchGuests();
  };

  const getAssignedGuests = (tableId: string) => guests.filter(g => g.tableId === tableId);
  const unassignedGuests = guests.filter(g => !g.tableId);

  const shapeColors: Record<string, string> = {
    round: '#166d13',
    rectangular: '#2563eb',
    oval: '#8c4b55',
  };

  return (
    <div>
      <PageHeader
        title="Seating Chart"
        description="Arrange your guests at tables"
        actions={<Button onClick={() => setIsFormOpen(true)}><Plus size={16} className="mr-2" />Add Table</Button>}
      />

      <div className="flex gap-6 mt-6 flex-col lg:flex-row">
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-5 animate-pulse">
                  <div className="h-5 w-32 rounded mb-3" style={{ backgroundColor: 'var(--color-dashboard-border)' }} />
                  <div className="h-4 w-20 rounded" style={{ backgroundColor: 'var(--color-dashboard-border)' }} />
                </Card>
              ))}
            </div>
          ) : tables.length === 0 ? (
            <Card className="p-12 text-center">
              <Grid3X3 size={48} className="mx-auto mb-4 opacity-40" style={{ color: 'var(--color-dashboard-text-secondary)' }} />
              <p className="font-heading text-lg" style={{ color: 'var(--color-dashboard-text-secondary)' }}>No tables yet</p>
              <p className="font-body text-sm mt-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>Add tables to start planning your seating</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((table) => {
                const assigned = getAssignedGuests(table.id);
                return (
                  <Card
                    key={table.id}
                    className={`p-4 cursor-pointer transition-all ${selectedTable === table.id ? 'ring-2 ring-[#d4af37]' : ''}`}
                    onClick={() => setSelectedTable(selectedTable === table.id ? null : table.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-heading text-lg" style={{ color: 'var(--color-dashboard-text)' }}>{table.name}</h3>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-label" style={{ backgroundColor: `${shapeColors[table.shape] || '#666'}20`, color: shapeColors[table.shape] || '#666' }}>
                          {table.shape}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); setEditingTable({ id: table.id, data: { name: table.name, shape: table.shape, capacity: table.capacity } }); }} className="p-1.5 rounded-lg">
                          <Edit size={14} style={{ color: 'var(--color-dashboard-text-secondary)' }} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(table.id); }} className="p-1.5 rounded-lg hover:text-red-500">
                          <Trash2 size={14} style={{ color: 'var(--color-dashboard-text-secondary)' }} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-body" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                      <Users size={14} />
                      <span>{assigned.length} / {table.capacity}</span>
                    </div>
                    {assigned.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {assigned.slice(0, 4).map(g => (
                          <span key={g.id} className="px-2 py-0.5 rounded text-xs font-body" style={{ backgroundColor: 'var(--color-dashboard-border)', color: 'var(--color-dashboard-text)' }}>
                            {g.name}
                          </span>
                        ))}
                        {assigned.length > 4 && (
                          <span className="px-2 py-0.5 rounded text-xs font-body" style={{ color: 'var(--color-dashboard-text-secondary)' }}>+{assigned.length - 4}</span>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="w-full lg:w-80 shrink-0">
          <Card className="p-4 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <UserMinus size={18} style={{ color: '#d4af37' }} />
              <h3 className="font-heading text-lg" style={{ color: 'var(--color-dashboard-text)' }}>Unassigned</h3>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {unassignedGuests.map(guest => (
                <div key={guest.id} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: 'var(--color-dashboard-border)' }}>
                  <span className="font-body text-sm" style={{ color: 'var(--color-dashboard-text)' }}>{guest.name}</span>
                  <button
                    onClick={() => selectedTable && handleAssignGuest(guest.id, selectedTable)}
                    disabled={!selectedTable}
                    className="p-1 rounded-lg disabled:opacity-30"
                    title={selectedTable ? 'Assign to selected table' : 'Select a table first'}
                  >
                    <UserPlus size={14} style={{ color: 'var(--color-dashboard-text-secondary)' }} />
                  </button>
                </div>
              ))}
              {unassignedGuests.length === 0 && (
                <p className="text-sm font-body text-center py-4" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  All guests assigned
                </p>
              )}
            </div>
            {selectedTable && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-dashboard-border)' }}>
                <p className="text-xs font-label" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  Selected: {tables.find(t => t.id === selectedTable)?.name}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <TableForm
        isOpen={isFormOpen || !!editingTable}
        onClose={() => { setIsFormOpen(false); setEditingTable(null); }}
        onSubmit={editingTable ? handleUpdate : handleCreate}
        initialData={editingTable?.data}
      />
    </div>
  );
}
