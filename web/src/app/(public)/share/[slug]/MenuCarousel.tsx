'use client';

import { useEffect, useState } from 'react';
import { UtensilsCrossed, ChevronLeft, ChevronRight, X } from 'lucide-react';
import api from '@/lib/api';

interface MenuItem {
  id: string;
  title: string;
  imageUrl: string;
  sortOrder: number;
}

export default function MenuCarousel({ slug }: { slug: string }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomedItem, setZoomedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    api<MenuItem[]>(`/api/public/share/${slug}/menu`)
      .then((data) => setItems(data.sort((a, b) => a.sortOrder - b.sortOrder)))
      .catch(() => {});
  }, [slug]);

  const prev = () => setActiveIndex((i) => (i === 0 ? items.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === items.length - 1 ? 0 : i + 1));

  if (items.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <UtensilsCrossed className="w-10 h-10 mx-auto" style={{ color: '#d0c5af' }} />
        <h2 className="text-2xl font-heading font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Wedding Menu
        </h2>
        <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Menu details will be available soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <UtensilsCrossed className="w-10 h-10 mx-auto mb-3" style={{ color: '#d4af37' }} />
        <h2 className="text-2xl font-heading font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Wedding Menu
        </h2>
        <p className="font-body text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Swipe through the menu pages
        </p>
      </div>

      <div className="relative">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: '#ffffff', border: '1px solid #e5e2e1' }}
        >
          <div
            className="relative cursor-pointer group"
            onClick={() => setZoomedItem(items[activeIndex])}
          >
            <img
              src={items[activeIndex].imageUrl}
              alt={items[activeIndex].title}
              className="w-full aspect-[3/4] object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              style={{ backgroundColor: '#f6f3f2' }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
          </div>
          <div className="p-4 text-center">
            <p className="font-heading text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {items[activeIndex].title}
            </p>
            <p className="font-label text-xs mt-1" style={{ color: '#7f7663' }}>
              {activeIndex + 1} of {items.length}
            </p>
          </div>
        </div>

        {items.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/3 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ backgroundColor: '#fcf9f8', border: '1px solid #d0c5af' }}
            >
              <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/3 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ backgroundColor: '#fcf9f8', border: '1px solid #d0c5af' }}
            >
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
            </button>
          </>
        )}
      </div>

      <div className="flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className="w-2 h-2 rounded-full transition-all duration-200"
            style={{
              backgroundColor: i === activeIndex ? '#d4af37' : '#d0c5af',
              transform: i === activeIndex ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {zoomedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={() => setZoomedItem(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            onClick={() => setZoomedItem(null)}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={zoomedItem.imageUrl}
            alt={zoomedItem.title}
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-6 left-0 right-0 text-center font-heading text-sm font-semibold text-white/80">
            {zoomedItem.title}
          </p>
        </div>
      )}
    </div>
  );
}
