'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { UtensilsCrossed, Plus, Trash2, Edit, X, Search, Leaf, Upload } from 'lucide-react';
import { MenuItem } from '@/types';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type CourseType = 'All' | 'Appetizer' | 'Main' | 'Dessert' | 'Beverage';

const COURSES: CourseType[] = ['All', 'Appetizer', 'Main', 'Dessert', 'Beverage'];

const COURSE_COLORS: Record<string, string> = {
  Appetizer: '#d4af37',
  Main: '#166d13',
  Dessert: '#8c4b55',
  Beverage: '#2563eb',
};

interface MenuFormData {
  name: string;
  description: string;
  course: CourseType;
  dietaryTags: string;
  imageUrl: string;
}

const EMPTY_FORM: MenuFormData = {
  name: '',
  description: '',
  course: 'Appetizer',
  dietaryTags: '',
  imageUrl: '',
};

interface UploadFile {
  file: File;
  title: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<CourseType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async (reset = false) => {
    setIsLoading(true);
    try {
      const currentPage = reset ? 0 : page;
      const res = await fetch(`/api/menu?page=${currentPage}&size=20`);
      if (!res.ok) throw new Error('Failed to fetch menu items');
      const data = await res.json();
      const content = data.content ?? data;
      setItems(prev => (reset ? content : [...prev, ...content]));
      setHasMore(!data.last);
      if (reset) setPage(0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchItems(true);
  }, []);

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
            category: 'menu',
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
          body: JSON.stringify({ s3Key, title: item.title, category: 'menu' }),
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
    fetchItems(true);
    setTimeout(() => setUploadQueue([]), 2000);
  }, [fetchItems]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const queue: UploadFile[] = files.map(file => ({
      file,
      title: '',
      status: 'pending',
    }));
    setUploadQueue(queue);
    e.target.value = '';
  };

  const updateUploadTitle = (index: number, value: string) => {
    setUploadQueue(prev => prev.map((q, idx) => (idx === index ? { ...q, title: value } : q)));
  };

  const filtered = items.filter(item => {
    const matchesCourse = activeTab === 'All' || item.course === activeTab;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  const openCreate = () => {
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description ?? '',
      course: (item.course as CourseType) ?? 'Appetizer',
      dietaryTags: item.dietaryTags ?? '',
      imageUrl: item.imageUrl ?? '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        dietaryTags: formData.dietaryTags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
      };

      const url = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu';
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save menu item');
      await fetchItems(true);
      closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-dashboard-surface)' }}>
      <PageHeader
        title="Wedding Menu"
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
              <Upload size={16} className="mr-1" />
              Upload Pages
            </Button>
            <Button onClick={openCreate}>
              <Plus size={16} className="mr-1" />
              Add Item
            </Button>
          </div>
        }
      />

      {uploadQueue.length > 0 && (
        <div
          className="mb-6 rounded-xl border p-4"
          style={{
            backgroundColor: 'var(--color-dashboard-surface)',
            borderColor: 'var(--color-dashboard-border)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Upload size={16} style={{ color: '#d4af37' }} />
              <span className="font-label text-sm font-semibold" style={{ color: 'var(--color-dashboard-text)' }}>
                Uploading {uploadQueue.length} menu page{uploadQueue.length > 1 ? 's' : ''}
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
                    alt=""
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
                  placeholder="Menu page title..."
                  value={item.title}
                  onChange={(e) => updateUploadTitle(index, e.target.value)}
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

      <div className="mt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {COURSES.map(course => (
              <button
                key={course}
                onClick={() => setActiveTab(course)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors font-label ${
                  activeTab === course
                    ? 'text-white'
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor:
                    activeTab === course
                      ? course === 'All'
                        ? '#d4af37'
                        : COURSE_COLORS[course]
                      : 'var(--color-dashboard-border)',
                  color: activeTab === course ? '#fff' : 'var(--color-dashboard-text)',
                }}
              >
                {course}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2"
                size={16}
                style={{ color: 'var(--color-dashboard-text-secondary)' }}
              />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border py-2 pl-9 pr-4 text-sm font-body outline-none focus:ring-2"
                style={{
                  borderColor: 'var(--color-dashboard-border)',
                  backgroundColor: 'var(--color-dashboard-surface)',
                  color: 'var(--color-dashboard-text)',
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(item => (
            <Card
              key={item.id}
              className="group relative flex flex-col gap-3 p-4 transition-shadow hover:shadow-md"
              style={{
                backgroundColor: 'var(--color-dashboard-surface)',
                borderColor: 'var(--color-dashboard-border)',
              }}
            >
              <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => openEdit(item)}
                  className="rounded p-1.5 transition-colors hover:bg-black/10"
                  style={{ color: 'var(--color-dashboard-text-secondary)' }}
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded p-1.5 transition-colors hover:bg-red-100"
                  style={{ color: '#dc2626' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex items-start justify-between gap-2 pr-12">
                <h3
                  className="text-base font-semibold font-heading"
                  style={{ color: 'var(--color-dashboard-text)' }}
                >
                  {item.name}
                </h3>
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium font-label"
                  style={{
                    backgroundColor: `${COURSE_COLORS[item.course] ?? '#d4af37'}20`,
                    color: COURSE_COLORS[item.course] ?? '#d4af37',
                  }}
                >
                  {item.course}
                </span>
              </div>

              {item.description && (
                <p
                  className="text-sm leading-relaxed font-body"
                  style={{ color: 'var(--color-dashboard-text-secondary)' }}
                >
                  {item.description}
                </p>
              )}

              {item.dietaryTags && item.dietaryTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {item.dietaryTags.split(',').map(tag => (
                    <span
                      key={tag.trim()}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-body"
                      style={{
                        backgroundColor: 'var(--color-dashboard-border)',
                        color: 'var(--color-dashboard-text-secondary)',
                      }}
                    >
                      <Leaf size={10} style={{ color: '#166d13' }} />
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>

        {filtered.length === 0 && !isLoading && (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            style={{ color: 'var(--color-dashboard-text-secondary)' }}
          >
            <UtensilsCrossed size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-heading">No menu items found</p>
            <p className="mt-1 text-sm font-body">Try adjusting your filter or add a new item</p>
          </div>
        )}

        {hasMore && items.length > 0 && (
          <div className="flex justify-center">
            <Button
              variant="secondary"
              onClick={() => {
                setPage(p => p + 1);
                fetchItems();
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div
            className="relative z-10 w-full max-w-lg rounded-xl border p-6 shadow-2xl"
            style={{
              backgroundColor: 'var(--color-dashboard-surface)',
              borderColor: 'var(--color-dashboard-border)',
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2
                className="text-xl font-semibold font-heading"
                style={{ color: 'var(--color-dashboard-text)' }}
              >
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 transition-colors hover:bg-black/10"
                style={{ color: 'var(--color-dashboard-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-medium font-label"
                  style={{ color: 'var(--color-dashboard-text)' }}
                >
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="rounded-lg border px-3 py-2 text-sm font-body outline-none focus:ring-2"
                  style={{
                    borderColor: 'var(--color-dashboard-border)',
                    backgroundColor: 'var(--color-dashboard-surface)',
                    color: 'var(--color-dashboard-text)',
                  }}
                  placeholder="e.g. Grilled Salmon"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-medium font-label"
                  style={{ color: 'var(--color-dashboard-text)' }}
                >
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="rounded-lg border px-3 py-2 text-sm font-body outline-none focus:ring-2 resize-none"
                  style={{
                    borderColor: 'var(--color-dashboard-border)',
                    backgroundColor: 'var(--color-dashboard-surface)',
                    color: 'var(--color-dashboard-text)',
                  }}
                  placeholder="Describe the dish..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-medium font-label"
                  style={{ color: 'var(--color-dashboard-text)' }}
                >
                  Course *
                </label>
                <select
                  required
                  value={formData.course}
                  onChange={e => setFormData(f => ({ ...f, course: e.target.value as CourseType }))}
                  className="rounded-lg border px-3 py-2 text-sm font-body outline-none focus:ring-2"
                  style={{
                    borderColor: 'var(--color-dashboard-border)',
                    backgroundColor: 'var(--color-dashboard-surface)',
                    color: 'var(--color-dashboard-text)',
                  }}
                >
                  {COURSES.filter(c => c !== 'All').map(course => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-medium font-label"
                  style={{ color: 'var(--color-dashboard-text)' }}
                >
                  Dietary Tags
                </label>
                <input
                  type="text"
                  value={formData.dietaryTags}
                  onChange={e => setFormData(f => ({ ...f, dietaryTags: e.target.value }))}
                  className="rounded-lg border px-3 py-2 text-sm font-body outline-none focus:ring-2"
                  style={{
                    borderColor: 'var(--color-dashboard-border)',
                    backgroundColor: 'var(--color-dashboard-surface)',
                    color: 'var(--color-dashboard-text)',
                  }}
                  placeholder="e.g. Vegetarian, Gluten-free, Vegan"
                />
                <span
                  className="text-xs font-body"
                  style={{ color: 'var(--color-dashboard-text-secondary)' }}
                >
                  Comma-separated
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-medium font-label"
                  style={{ color: 'var(--color-dashboard-text)' }}
                >
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={e => setFormData(f => ({ ...f, imageUrl: e.target.value }))}
                  className="rounded-lg border px-3 py-2 text-sm font-body outline-none focus:ring-2"
                  style={{
                    borderColor: 'var(--color-dashboard-border)',
                    backgroundColor: 'var(--color-dashboard-surface)',
                    color: 'var(--color-dashboard-text)',
                  }}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="mt-2 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? 'Saving...'
                    : editingItem
                      ? 'Update Item'
                      : 'Add Item'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
