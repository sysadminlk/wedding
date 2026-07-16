'use client';

import { useState, useEffect, useCallback } from 'react';
import { Camera, X, ZoomIn, Download, ChevronLeft, ChevronRight } from 'lucide-react';
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

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
          <Button
            variant="primary"
            className="font-label"
            style={{ backgroundColor: '#d4af37' }}
          >
            <Camera size={16} className="mr-2" />
            Upload Photos
          </Button>
        }
      />

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
