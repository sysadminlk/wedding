'use client';

import { useState, useEffect, useCallback } from 'react';
import { Palette, Plus, Trash2, X, Image } from 'lucide-react';
import { InspirationItem } from '@/types';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function InspirationPage() {
  const [items, setItems] = useState<InspirationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchItems = useCallback(async (pageNum: number, append?: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inspiration?page=${pageNum}&size=20`, { credentials: 'include' });
      const data = await res.json();
      setItems(prev => append ? [...prev, ...(data.content || [])] : (data.content || []));
      setTotalPages(data.totalPages || 0);
    } catch {
      // empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(page, page > 0);
  }, [page, fetchItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/inspiration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, caption }),
      });
      if (res.ok) {
        const newItem = await res.json();
        setItems(prev => [newItem, ...prev]);
        setImageUrl('');
        setCaption('');
        setShowForm(false);
      }
    } catch {
      // empty
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/inspiration/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
      }
    } catch {
      // empty
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Inspiration"
        description="Your mood board for wedding ideas"
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-2" />
            Add Inspiration
          </Button>
        }
      />

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowForm(false)}
        >
          <Card
            className="w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-bold" style={{ color: 'var(--color-dashboard-text)' }}>
                Add Inspiration
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg">
                <X size={20} style={{ color: 'var(--color-dashboard-text-secondary)' }} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-label uppercase tracking-wider mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  Image URL
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 rounded-lg border text-sm font-body focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                  style={{
                    backgroundColor: 'var(--color-dashboard-surface)',
                    borderColor: 'var(--color-dashboard-border)',
                    color: 'var(--color-dashboard-text)',
                  }}
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-label uppercase tracking-wider mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  Caption (optional)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border text-sm font-body focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                  style={{
                    backgroundColor: 'var(--color-dashboard-surface)',
                    borderColor: 'var(--color-dashboard-border)',
                    color: 'var(--color-dashboard-text)',
                  }}
                  placeholder="What do you love about this?"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={!imageUrl || submitting} loading={submitting} className="flex-1">
                  Add to Board
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            <Palette size={48} className="mx-auto mb-4 opacity-40" />
            <p className="font-body text-lg">Loading...</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            <Image size={48} className="mx-auto mb-4 opacity-40" />
            <p className="font-body text-lg">No inspiration yet</p>
            <p className="font-body text-sm mt-1">Start building your mood board.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <Card
                key={item.id}
                className="group relative overflow-hidden"
                style={{ padding: 0 }}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.caption || 'Inspiration'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                {item.caption && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="font-label text-white text-sm truncate">{item.caption}</p>
                    </div>
                  </div>
                )}
                <button
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center bg-red-600/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                >
                  <Trash2 size={14} />
                </button>
              </Card>
            ))}
          </div>

          {page < totalPages - 1 && (
            <div className="flex justify-center py-8">
              <Button variant="secondary" onClick={() => setPage(p => p + 1)} disabled={loading}>
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
