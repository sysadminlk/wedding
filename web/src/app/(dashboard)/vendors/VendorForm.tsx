'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Vendor } from '@/types';

interface VendorFormProps {
  vendor?: Vendor | null;
  onSubmit: (data: Omit<Vendor, 'id' | 'tenantId' | 'createdAt'>) => Promise<void>;
  onClose: () => void;
}

const categories = ['Photography', 'Catering', 'Florals', 'Music', 'Venue', 'Attire', 'Beauty', 'Other'];
const statuses: Vendor['status'][] = ['contacted', 'booked', 'confirmed', 'declined'];

const defaultForm = {
  name: '',
  category: 'Photography',
  contactName: '',
  email: '',
  phone: '',
  website: '',
  cost: 0,
  rating: 0,
  status: 'contacted' as Vendor['status'],
  notes: '',
};

export function VendorForm({ vendor, onSubmit, onClose }: VendorFormProps) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (vendor) {
      setForm({
        name: vendor.name,
        category: vendor.category,
        contactName: vendor.contactName ?? '',
        email: vendor.email ?? '',
        phone: vendor.phone ?? '',
        website: vendor.website ?? '',
        cost: vendor.cost,
        rating: vendor.rating,
        status: vendor.status,
        notes: vendor.notes ?? '',
      });
    }
  }, [vendor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        name: form.name,
        category: form.category,
        contactName: form.contactName || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        website: form.website || undefined,
        cost: form.cost,
        rating: form.rating,
        status: form.status,
        notes: form.notes || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '12px',
    border: '1px solid var(--color-dashboard-border)',
    backgroundColor: 'var(--color-dashboard-surface)',
    color: 'var(--color-dashboard-text)',
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '4px',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--color-dashboard-text-secondary)',
    fontFamily: 'var(--font-label)',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-dashboard-surface)',
          border: '1px solid var(--color-dashboard-border)',
          borderRadius: '20px',
          padding: '32px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2
            className="font-heading"
            style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-dashboard-text)' }}
          >
            {vendor ? 'Edit Vendor' : 'Add Vendor'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-dashboard-text-secondary)',
              padding: '4px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="font-label" style={labelStyle}>Vendor Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Bloom Studio"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="font-label" style={labelStyle}>Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-label" style={labelStyle}>Status *</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Vendor['status'] })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="font-label" style={labelStyle}>Cost ($)</label>
              <input
                type="number"
                min={0}
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="font-label" style={labelStyle}>Rating (0–5)</label>
              <input
                type="number"
                min={0}
                max={5}
                step={0.5}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className="font-label" style={labelStyle}>Contact Name</label>
            <input
              value={form.contactName}
              onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              placeholder="Contact person"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="font-label" style={labelStyle}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="font-label" style={labelStyle}>Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className="font-label" style={labelStyle}>Website</label>
            <input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="font-label" style={labelStyle}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Additional notes..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {vendor ? 'Save Changes' : 'Add Vendor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
