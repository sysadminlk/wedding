'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Camera, UtensilsCrossed, Gift, Video } from 'lucide-react';
import api from '@/lib/api';
import SeatFinder from './SeatFinder';
import GalleryUpload from './GalleryUpload';
import MenuCarousel from './MenuCarousel';
import GiftRegistry from './GiftRegistry';
import MemoryRecorder from './MemoryRecorder';

interface WeddingInfo {
  partner1: string;
  partner2: string;
  weddingDate: string;
}

const tabs = [
  { id: 'seats', label: 'Seat Finder', icon: MapPin },
  { id: 'gallery', label: 'Gallery', icon: Camera },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { id: 'gifts', label: 'Gifts', icon: Gift },
  { id: 'memory', label: 'Memory', icon: Video },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function SharePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState<TabId>('seats');
  const [wedding, setWedding] = useState<WeddingInfo | null>(null);

  useEffect(() => {
    api<WeddingInfo>(`/api/public/wedding/${slug}`).catch(() => {});
  }, [slug]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-auth-bg)' }}>
      <header
        className="sticky top-0 z-20 px-4 py-4"
        style={{
          backgroundColor: '#fcf9f8',
          borderBottom: '1px solid #e5e2e1',
        }}
      >
        <div className="max-w-2xl mx-auto text-center mb-4">
          {wedding && (
            <p className="font-heading text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {wedding.partner1} & {wedding.partner2}
            </p>
          )}
        </div>
        <nav className="max-w-2xl mx-auto flex overflow-x-auto scrollbar-hide gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-label text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, #d4af37 0%, #e9c349 50%, #d4af37 100%)'
                    : 'transparent',
                  color: isActive ? '#1c1b1b' : '#7f7663',
                }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === 'seats' && <SeatFinder slug={slug} />}
        {activeTab === 'gallery' && <GalleryUpload slug={slug} />}
        {activeTab === 'menu' && <MenuCarousel slug={slug} />}
        {activeTab === 'gifts' && <GiftRegistry slug={slug} />}
        {activeTab === 'memory' && <MemoryRecorder slug={slug} />}
      </main>
    </div>
  );
}
