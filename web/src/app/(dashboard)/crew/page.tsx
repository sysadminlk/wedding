'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Phone, Mail, Trash2, Edit, X, Search, Users } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CrewMember } from '@/types';

interface CrewFormProps {
  member?: CrewMember | null;
  onSubmit: (data: Partial<CrewMember>) => Promise<void>;
  onClose: () => void;
}

interface Filters {
  type: 'all' | 'internal' | 'external';
  search: string;
}

function CrewForm({ member, onSubmit, onClose }: CrewFormProps) {
  const [name, setName] = useState(member?.name ?? '');
  const [role, setRole] = useState(member?.role ?? '');
  const [email, setEmail] = useState(member?.email ?? '');
  const [phone, setPhone] = useState(member?.phone ?? '');
  const [isExternal, setIsExternal] = useState(member?.isExternal ?? false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ name, role, email, phone, isExternal });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading" style={{ color: 'var(--color-dashboard-text)' }}>
            {member ? 'Edit Member' : 'Add Member'}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-black/5">
            <X size={20} style={{ color: 'var(--color-dashboard-text-secondary)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-label mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border font-body"
              style={{
                borderColor: 'var(--color-dashboard-border)',
                backgroundColor: 'var(--color-dashboard-surface)',
                color: 'var(--color-dashboard-text)',
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-label mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              Role
            </label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Photographer, Best Man"
              className="w-full px-3 py-2 rounded-lg border font-body"
              style={{
                borderColor: 'var(--color-dashboard-border)',
                backgroundColor: 'var(--color-dashboard-surface)',
                color: 'var(--color-dashboard-text)',
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-label mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border font-body"
              style={{
                borderColor: 'var(--color-dashboard-border)',
                backgroundColor: 'var(--color-dashboard-surface)',
                color: 'var(--color-dashboard-text)',
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-label mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border font-body"
              style={{
                borderColor: 'var(--color-dashboard-border)',
                backgroundColor: 'var(--color-dashboard-surface)',
                color: 'var(--color-dashboard-text)',
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-label mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              Type
            </label>
            <div className="flex gap-2">
              {([false, true] as const).map((ext) => (
                <button
                  key={String(ext)}
                  type="button"
                  onClick={() => setIsExternal(ext)}
                  className="flex-1 px-3 py-2 rounded-lg border font-label text-sm capitalize transition-colors"
                  style={{
                    borderColor: isExternal === ext ? '#d4af37' : 'var(--color-dashboard-border)',
                    backgroundColor: isExternal === ext ? '#d4af37' : 'var(--color-dashboard-surface)',
                    color: isExternal === ext ? '#fff' : 'var(--color-dashboard-text)',
                  }}
                >
                  {ext ? 'External' : 'Internal'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={onClose} className="flex-1" variant="secondary">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1"
              style={{ backgroundColor: '#d4af37', color: '#fff' }}
            >
              {submitting ? 'Saving...' : member ? 'Update' : 'Add Member'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function CrewPage() {
  const [members, setMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Filters>({ type: 'all', search: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<CrewMember | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const pageSize = 12;

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), size: String(pageSize) });
      if (filters.type === 'internal') params.set('isExternal', 'false');
      if (filters.type === 'external') params.set('isExternal', 'true');
      if (filters.search) params.set('search', filters.search);
      const res = await fetch(`/api/crew?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.items ?? data);
        setTotalPages(data.totalPages ?? 1);
      }
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleCreate = async (data: Partial<CrewMember>) => {
    await fetch('/api/crew', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setPage(1);
    fetchMembers();
  };

  const handleUpdate = async (data: Partial<CrewMember>) => {
    if (!editingMember) return;
    await fetch(`/api/crew/${editingMember.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setEditingMember(null);
    fetchMembers();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/crew/${id}`, { method: 'DELETE' });
      fetchMembers();
    } finally {
      setDeletingId(null);
    }
  };

  const filterButtons: { label: string; value: Filters['type'] }[] = [
    { label: 'All', value: 'all' },
    { label: 'Internal', value: 'internal' },
    { label: 'External', value: 'external' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wedding Crew"
        description="Manage your wedding party and vendors"
        actions={
          <Button
            onClick={() => setShowForm(true)}
            style={{ backgroundColor: '#d4af37', color: '#fff' }}
          >
            <UserPlus size={18} className="mr-2" />
            Add Member
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-dashboard-surface)' }}>
          {filterButtons.map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilters((prev) => ({ ...prev, type: f.value })); setPage(1); }}
              className="px-4 py-1.5 rounded-md text-sm font-label transition-colors"
              style={{
                backgroundColor: filters.type === f.value ? '#d4af37' : 'transparent',
                color: filters.type === f.value ? '#fff' : 'var(--color-dashboard-text-secondary)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-dashboard-text-secondary)' }} />
          <input
            type="text"
            placeholder="Search crew..."
            value={filters.search}
            onChange={(e) => { setFilters((prev) => ({ ...prev, search: e.target.value })); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm font-body"
            style={{
              borderColor: 'var(--color-dashboard-border)',
              backgroundColor: 'var(--color-dashboard-surface)',
              color: 'var(--color-dashboard-text)',
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="h-5 w-32 rounded mb-3" style={{ backgroundColor: 'var(--color-dashboard-border)' }} />
              <div className="h-4 w-20 rounded mb-2" style={{ backgroundColor: 'var(--color-dashboard-border)' }} />
              <div className="h-4 w-40 rounded" style={{ backgroundColor: 'var(--color-dashboard-border)' }} />
            </Card>
          ))}
        </div>
      ) : members.length === 0 ? (
        <Card className="p-12 text-center">
          <Users size={48} className="mx-auto mb-4" style={{ color: 'var(--color-dashboard-border)' }} />
          <p className="font-heading text-lg" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            No crew members yet
          </p>
          <p className="font-body text-sm mt-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            Add photographers, planners, and other key people
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <Card key={member.id} className="p-5 relative group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-lg truncate" style={{ color: 'var(--color-dashboard-text)' }}>
                    {member.name}
                  </h3>
                  <p className="font-body text-sm" style={{ color: '#d4af37' }}>
                    {member.role}
                  </p>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-label capitalize shrink-0 ml-2"
                  style={{
                    backgroundColor: !member.isExternal ? '#d4af3720' : 'var(--color-dashboard-border)',
                    color: !member.isExternal ? '#d4af37' : 'var(--color-dashboard-text-secondary)',
                  }}
                >
                  {member.isExternal ? 'External' : 'Internal'}
                </span>
              </div>

              <div className="space-y-1.5">
                {member.email && (
                  <div className="flex items-center gap-2 text-sm font-body" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                    <Mail size={14} />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm font-body" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                    <Phone size={14} />
                    <span>{member.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: '1px solid var(--color-dashboard-border)' }}>
                <button
                  onClick={() => setEditingMember(member)}
                  className="p-2 rounded-lg transition-colors hover:bg-black/5"
                  style={{ color: 'var(--color-dashboard-text-secondary)' }}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  disabled={deletingId === member.id}
                  className="p-2 rounded-lg transition-colors hover:bg-red-50"
                  style={{ color: deletingId === member.id ? '#ccc' : '#e74c3c' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="secondary"
            className="px-3 py-1 text-sm"
          >
            Previous
          </Button>
          <span className="text-sm font-label" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            Page {page} of {totalPages}
          </span>
          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="secondary"
            className="px-3 py-1 text-sm"
          >
            Next
          </Button>
        </div>
      )}

      {showForm && (
        <CrewForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />
      )}

      {editingMember && (
        <CrewForm member={editingMember} onSubmit={handleUpdate} onClose={() => setEditingMember(null)} />
      )}
    </div>
  );
}
