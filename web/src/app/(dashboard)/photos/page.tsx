'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Camera, X, ZoomIn, Download, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { Photo } from '@/types';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface PhotoResponse {
  content: Photo[];
  totalElements: number;
  totalPages: number;
  number: number;
}

interface UploadFile {
  file: File;
  caption: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [uploadQueue, setUploadQueue] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/photos?page=${pageNum}&size=20`);
      if (!res.ok) throw new Error('Failed to fetch photos');
      const data: PhotoResponse = await res.json();
      setPhotos((prev) => (pageNum === 0 ? data.content : [...prev, ...data.content]));
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching photos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos(page);
  }, [page, fetchPhotos]);

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
            category: 'photos',
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
          body: JSON.stringify({ s3Key, caption: item.caption }),
        });
        if (!confirmRes.ok) throw new Error('Failed to confirm upload');

        setUploadQueue(prev =>
          prev.map((q, idx) => (idx === i ? { ...q, status: 'done' as const } : q))
        );
      } catch (err) {
        setUploadQueue(prev =>
          prev.map((q, idx) =>
            idx === i ? { ...q, status: 'error' as const, error: 'Upload failed' } : q
          )
        );
      }
    }
    setUploading(false);
    fetchPhotos(0);
    setPage(0);
    setTimeout(() => setUploadQueue([]), 2000);
  }, [fetchPhotos]);

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

  const updateUploadCaption = (index: number, caption: string) => {
    setUploadQueue(prev => prev.map((q, idx) => (idx === index ? { ...q, caption } : q)));
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = () => {
    if (lightboxIndex !== null && lightboxIndex < photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const goPrev = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className="min-h-screen" style={{ color: 'var(--color-dashboard-text)' }}>
      <PageHeader
        title="Wedding Photos"
        actions={
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="primary"
              className="font-label"
              style={{ backgroundColor: '#d4af37' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={16} className="mr-2" />
              Upload Photos
            </Button>
          </>
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
                Uploading {uploadQueue.length} photo{uploadQueue.length > 1 ? 's' : ''}
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

      {loading && photos.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            <Camera size={48} className="mx-auto mb-4 opacity-40" />
            <p className="font-body text-lg">Loading photos...</p>
          </div>
        </div>
      ) : photos.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            <Camera size={48} className="mx-auto mb-4 opacity-40" />
            <p className="font-body text-lg">No photos yet</p>
            <p className="font-body text-sm mt-1">Upload your wedding photos to see them here.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
            {photos.map((photo, index) => (
              <Card
                key={photo.id}
                className="group relative overflow-hidden cursor-pointer hover:ring-2 transition-all"
                style={{
                  backgroundColor: 'var(--color-dashboard-surface)',
                  borderColor: 'var(--color-dashboard-border)',
                  ...(index === lightboxIndex ? { ringColor: '#d4af37' } : {}),
                }}
                onClick={() => openLightbox(index)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={photo.thumbnailUrl || photo.imageUrl}
                    alt={photo.caption || 'Wedding photo'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="font-label text-white text-sm truncate">
                      {photo.caption || 'Untitled'}
                    </p>
                    <p className="font-body text-white/70 text-xs mt-0.5">
                      {photo.uploadedBy} &middot; {formatDate(photo.createdAt)}
                    </p>
                  </div>
                  <div className="absolute top-2 right-2">
                    <ZoomIn size={18} className="text-white/80" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {page < totalPages - 1 && (
            <div className="flex justify-center pb-8">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                style={{ borderColor: 'var(--color-dashboard-border)' }}
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-50"
            onClick={closeLightbox}
          >
            <X size={28} />
          </button>

          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors z-50 p-2 rounded-full hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {lightboxIndex < photos.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors z-50 p-2 rounded-full hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
            >
              <ChevronRight size={32} />
            </button>
          )}

          <div
            className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[lightboxIndex].imageUrl}
              alt={photos[lightboxIndex].caption || 'Wedding photo'}
              className="max-w-full max-h-[75vh] object-contain rounded-lg"
            />
            <div className="mt-4 flex items-center gap-6 text-white text-center">
              <div>
                <p className="font-heading text-lg" style={{ color: '#d4af37' }}>
                  {photos[lightboxIndex].caption || 'Untitled'}
                </p>
                <p className="font-body text-sm text-white/60 mt-1">
                  Uploaded by {photos[lightboxIndex].uploadedBy} &middot;{' '}
                  {formatDate(photos[lightboxIndex].createdAt)}
                </p>
              </div>
              <a
                href={photos[lightboxIndex].imageUrl}
                download
                className="text-white/70 hover:text-white transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={20} />
              </a>
            </div>
            <p className="font-body text-xs text-white/40 mt-3">
              {lightboxIndex + 1} / {photos.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
