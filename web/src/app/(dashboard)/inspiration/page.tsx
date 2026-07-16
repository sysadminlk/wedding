'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Palette, Plus, Trash2, X, Image, Upload } from 'lucide-react';
import { InspirationItem } from '@/types';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface UploadFile {
  file: File;
  caption: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

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
  const [uploadQueue, setUploadQueue] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const processUploadQueue = useCallback(async (queue: UploadFile[]) => {
    setUploading(true);
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status !== 'pending') continue;
      try {
        setUploadQueue(prev =>
          prev.map((q, idx) => (idx === i ? { ...q, status: 'uploading' as const } : q))
        );

        const presignedRes = await fetch('/api/upload/presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: item.file.name,
            contentType: item.file.type,
            category: 'inspiration',
          }),
        });
        if (!presignedRes.ok) throw new Error('Failed to get presigned URL');
        const { uploadUrl, s3Key } = await presignedRes.json();

        const putRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': item.file.type },
          body: item.file,
        });
        if (!putRes.ok) throw new Error('Failed to upload file');

        const confirmRes = await fetch('/api/photos/upload/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ s3Key, caption: item.caption, category: 'inspiration' }),
        });
        if (!confirmRes.ok) throw new Error('Failed to confirm upload');

        setUploadQueue(prev =>
          prev.map((q, idx) => (idx === i ? { ...q, status: 'done' as const } : q))
        );
      } catch {
        setUploadQueue(prev =>
          prev.map((q, idx) =>
            idx === i ? { ...q, status: 'error' as const, error: 'Upload failed' } : q
          )
        );
      }
    }
    setUploading(false);
    fetchItems(0);
    setPage(0);
    setTimeout(() => setUploadQueue([]), 2000);
  }, [fetchItems]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const queue: UploadFile[] = files.map(file => ({
      file,
      caption: '',
      status: 'pending',
    }));
    setUploadQueue(queue);
    e.target.value = '';
  };

  const updateUploadCaption = (index: number, value: string) => {
    setUploadQueue(prev => prev.map((q, idx) => (idx === index ? { ...q, caption: value } : q)));
  };

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
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} className="mr-2" />
              Upload
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus size={16} className="mr-2" />
              Add by URL
            </Button>
          </div>
        }
      />

      {uploadQueue.length > 0 && (
        <div
          className="mx-6 mb-6 rounded-xl border p-4"
          style={{
            backgroundColor: 'var(--color-dashboard-surface)',
            borderColor: 'var(--color-dashboard-border)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Upload size={16} style={{ color: '#d4af37' }} />
              <span className="font-label text-sm font-semibold" style={{ color: 'var(--color-dashboard-text)' }}>
                Uploading {uploadQueue.length} image{uploadQueue.length > 1 ? 's' : ''}
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => processUploadQueue(uploadQueue)}
              disabled={uploading}
              loading={uploading}
              style={{ backgroundColor: '#d4af37' }}
            >
              <Upload size={14} className="mr-1.5" />
              Start Upload
            </Button>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {uploadQueue.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border" style={{ borderColor: 'var(--color-dashboard-border)' }}>
                  <img
                    src={URL.createObjectURL(item.file)}
                    alt="Upload preview"
                    className="h-full w-full object-cover"
                  />
                  {item.status === 'done' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-500/80">
                      <span className="text-white text-xs font-bold">Done</span>
                    </div>
                  )}
                  {item.status === 'error' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/80">
                      <span className="text-white text-xs font-bold">Err</span>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Add a caption..."
                  value={item.caption}
                  onChange={(e) => updateUploadCaption(index, e.target.value)}
                  className="flex-1 rounded-lg border px-3 py-2 text-sm font-body outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                  style={{
                    backgroundColor: 'var(--color-dashboard-surface)',
                    borderColor: 'var(--color-dashboard-border)',
                    color: 'var(--color-dashboard-text)',
                  }}
                  disabled={item.status === 'uploading' || item.status === 'done'}
                />
                {item.status === 'uploading' && (
                  <span className="text-xs font-body" style={{ color: '#d4af37' }}>Uploading...</span>
                )}
                {item.status === 'error' && (
                  <span className="text-xs font-body text-red-500">{item.error}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
