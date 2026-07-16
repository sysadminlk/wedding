'use client';

import { useState, useEffect, useCallback } from 'react';
import { Store, Star, Search, Plus, Phone, Mail, Globe, Trash2, Edit } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Vendor, PaginatedResponse } from '@/types';
import { VendorForm } from './VendorForm';

const categories = ['All', 'Photography', 'Catering', 'Florals', 'Music', 'Venue', 'Attire', 'Beauty', 'Other'];

const statusConfig: Record<Vendor['status'], { bg: string; color: string }> = {
  contacted: { bg: 'rgba(212,175,55,0.15)', color: '#d4af37' },
  booked: { bg: 'rgba(22,109,19,0.15)', color: '#166d13' },
  confirmed: { bg: 'rgba(22,109,19,0.15)', color: '#166d13' },
  declined: { bg: 'rgba(186,26,26,0.15)', color: '#ba1a1a' },
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const pageSize = 12;

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), size: String(pageSize) });
      if (activeCategory !== 'All') params.set('category', activeCategory);
      if (search.trim()) params.set('search', search.trim());
      const res = await fetch(`/api/vendors?${params}`);
      if (res.ok) {
        const data: PaginatedResponse<Vendor> = await res.json();
        setVendors(data.content);
        setTotalPages(data.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory, search]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  useEffect(() => {
    setPage(0);
  }, [activeCategory, search]);

  const handleCreate = async (data: Omit<Vendor, 'id' | 'tenantId' | 'createdAt'>) => {
    await fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setFormOpen(false);
    fetchVendors();
  };

  const handleUpdate = async (data: Omit<Vendor, 'id' | 'tenantId' | 'createdAt'>) => {
    if (!editingVendor) return;
    await fetch(`/api/vendors/${editingVendor.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setEditingVendor(null);
    setFormOpen(false);
    fetchVendors();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async (id: string) => {
    await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    fetchVendors();
  };

  const openEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormOpen(true);
  };

  const openCreate = () => {
    setEditingVendor(null);
    setFormOpen(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < Math.round(rating) ? '#d4af37' : 'none'}
        color={i < Math.round(rating) ? '#d4af37' : 'var(--color-dashboard-border)'}
      />
    ));
  };

  return (
    <div style={{ padding: '32px' }}>
      <PageHeader
        title="Vendors"
        description="Manage your wedding vendors and service providers"
        actions={
          <Button variant="primary" onClick={openCreate}>
            <Plus size={16} style={{ marginRight: '6px' }} />
            Add Vendor
          </Button>
        }
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            position: 'relative',
            flex: '1 1 280px',
            maxWidth: '400px',
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-dashboard-text-secondary)',
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors..."
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '12px',
              border: '1px solid var(--color-dashboard-border)',
              backgroundColor: 'var(--color-dashboard-surface)',
              color: 'var(--color-dashboard-text)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="font-label"
            style={{
              padding: '8px 18px',
              borderRadius: '999px',
              border: '1px solid',
              borderColor: activeCategory === cat ? '#d4af37' : 'var(--color-dashboard-border)',
              backgroundColor: activeCategory === cat ? 'rgba(212,175,55,0.12)' : 'var(--color-dashboard-surface)',
              color: activeCategory === cat ? '#d4af37' : 'var(--color-dashboard-text-secondary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '80px 0',
            color: 'var(--color-dashboard-text-secondary)',
          }}
          className="font-body"
        >
          Loading vendors...
        </div>
      ) : vendors.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 0',
            color: 'var(--color-dashboard-text-secondary)',
          }}
        >
          <Store size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p className="font-body" style={{ fontSize: '16px' }}>No vendors found</p>
          <p className="font-body" style={{ fontSize: '14px', marginTop: '4px' }}>Add your first vendor to get started</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {vendors.map((vendor) => (
            <Card key={vendor.id} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    className="font-heading"
                    style={{
                      fontSize: '17px',
                      fontWeight: 700,
                      color: 'var(--color-dashboard-text)',
                      marginBottom: '6px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {vendor.name}
                  </h3>
                  <span
                    className="font-label"
                    style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: 'rgba(212,175,55,0.1)',
                      color: '#d4af37',
                    }}
                  >
                    {vendor.category}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <button
                    onClick={() => openEdit(vendor)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-dashboard-text-secondary)',
                      padding: '6px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(vendor.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ba1a1a',
                      padding: '6px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {renderStars(vendor.rating)}
                <span
                  className="font-body"
                  style={{ fontSize: '12px', color: 'var(--color-dashboard-text-secondary)', marginLeft: '4px' }}
                >
                  {vendor.rating.toFixed(1)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  className="font-body"
                  style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-dashboard-text)' }}
                >
                  ${vendor.cost.toLocaleString()}
                </span>
                <span
                  className="font-label"
                  style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: statusConfig[vendor.status].bg,
                    color: statusConfig[vendor.status].color,
                  }}
                >
                  {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                </span>
              </div>

              {(vendor.phone || vendor.email || vendor.website) && (
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--color-dashboard-border)',
                    flexWrap: 'wrap',
                  }}
                >
                  {vendor.phone && (
                    <span
                      className="font-body"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-dashboard-text-secondary)' }}
                    >
                      <Phone size={12} /> {vendor.phone}
                    </span>
                  )}
                  {vendor.email && (
                    <span
                      className="font-body"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-dashboard-text-secondary)' }}
                    >
                      <Mail size={12} /> {vendor.email}
                    </span>
                  )}
                  {vendor.website && (
                    <span
                      className="font-body"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-dashboard-text-secondary)' }}
                    >
                      <Globe size={12} /> Website
                    </span>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '32px',
          }}
        >
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="font-body" style={{ fontSize: '13px', color: 'var(--color-dashboard-text-secondary)', padding: '0 12px' }}>
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

      {formOpen && (
        <VendorForm
          vendor={editingVendor}
          onSubmit={editingVendor ? handleUpdate : handleCreate}
          onClose={() => { setFormOpen(false); setEditingVendor(null); }}
        />
      )}

      {deletingId && (
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
          onClick={() => setDeletingId(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-dashboard-surface)',
              border: '1px solid var(--color-dashboard-border)',
              borderRadius: '20px',
              padding: '32px',
              width: '100%',
              maxWidth: '400px',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 size={36} style={{ color: '#ba1a1a', margin: '0 auto 16px' }} />
            <h3 className="font-heading" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-dashboard-text)', marginBottom: '8px' }}>
              Delete Vendor
            </h3>
            <p className="font-body" style={{ fontSize: '14px', color: 'var(--color-dashboard-text-secondary)', marginBottom: '24px' }}>
              Are you sure you want to delete this vendor? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <Button variant="secondary" onClick={() => setDeletingId(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => confirmDelete(deletingId)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
