'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Heart, Calendar, MapPin, Clock, Gift, Share2, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

interface WeddingData {
  id: string;
  partner1: string;
  partner2: string;
  weddingDate: string;
  venue: string;
  slug: string;
  story?: string;
  heroImageUrl?: string;
  schedule?: { title: string; time: string; description?: string }[];
  gifts?: { id: string; name: string; price: number; claimed: boolean }[];
  showGiftRegistry: boolean;
  showRsvp: boolean;
  theme?: string;
}

function useCountdown(dateStr: string) {
  const [diff, setDiff] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = new Date(dateStr).getTime();
    const tick = () => {
      const now = Date.now();
      const d = Math.max(0, target - now);
      setDiff({
        days: Math.floor(d / 86400000),
        hours: Math.floor((d % 86400000) / 3600000),
        minutes: Math.floor((d % 3600000) / 60000),
        seconds: Math.floor((d % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dateStr]);
  return diff;
}

const THEME_MAP: Record<string, string> = {
  Classic: 'classic',
  Modern: 'modern',
  Rustic: 'rustic',
  Beach: 'beach',
  Garden: 'garden',
  Royal: 'royal',
};

export default function PublicWeddingPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [wedding, setWedding] = useState<WeddingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);

  const countdown = useCountdown(wedding?.weddingDate || new Date().toISOString());

  useEffect(() => {
    api<WeddingData>(`/api/public/wedding/${slug}`)
      .then(setWedding)
      .catch(() => setError('Wedding not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!wedding?.theme) return;
    const fileName = THEME_MAP[wedding.theme] || THEME_MAP['Classic'];
    const href = `/themes/${fileName}.css`;

    const existing = document.querySelector<HTMLLinkElement>(`link[data-theme-css="${slug}"]`);
    if (existing) {
      if (existing.getAttribute('href') !== href) existing.setAttribute('href', href);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.themeCss = slug;
    document.head.appendChild(link);

    return () => {
      const el = document.querySelector<HTMLLinkElement>(`link[data-theme-css="${slug}"]`);
      if (el) el.remove();
    };
  }, [wedding?.theme, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (error || !wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Heart className="w-16 h-16 mx-auto" style={{ color: '#d4af37' }} />
          <h1 className="text-3xl font-heading font-bold" style={{ color: 'var(--color-text-primary)' }}>Wedding Not Found</h1>
          <p className="font-body" style={{ color: 'var(--color-text-muted)' }}>This wedding page does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const weddingDate = new Date(wedding.weddingDate);
  const formattedDate = weddingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleShare = async () => {
    const url = `${window.location.origin}/w/${slug}`;
    if (navigator.share) {
      await navigator.share({ title: `${wedding.partner1} & ${wedding.partner2}`, url });
    } else {
      await navigator.clipboard.writeText(url);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {wedding.heroImageUrl ? (
          <img
            src={wedding.heroImageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #1c1b1b 0%, #2a2420 50%, #1c1b1b 100%)',
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <p
            className="font-label uppercase tracking-[0.3em] text-sm mb-6"
            style={{ color: '#d4af37' }}
          >
            Together with their families
          </p>
          <h1
            className="text-5xl md:text-7xl font-heading font-bold mb-4 leading-tight"
            style={{ color: '#fcf9f8' }}
          >
            {wedding.partner1}
          </h1>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-16" style={{ backgroundColor: '#d4af37' }} />
            <Heart className="w-6 h-6" style={{ color: '#d4af37' }} fill="#d4af37" />
            <div className="h-px w-16" style={{ backgroundColor: '#d4af37' }} />
          </div>
          <h1
            className="text-5xl md:text-7xl font-heading font-bold mb-8 leading-tight"
            style={{ color: '#fcf9f8' }}
          >
            {wedding.partner2}
          </h1>

          <div className="flex items-center justify-center gap-2 mb-3">
            <Calendar className="w-4 h-4" style={{ color: '#d4af37' }} />
            <span className="font-label text-sm tracking-wide" style={{ color: '#d0c5af' }}>
              {formattedDate}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-10">
            <MapPin className="w-4 h-4" style={{ color: '#d4af37' }} />
            <span className="font-label text-sm tracking-wide" style={{ color: '#d0c5af' }}>
              {wedding.venue}
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {[
              { value: countdown.days, label: 'Days' },
              { value: countdown.hours, label: 'Hours' },
              { value: countdown.minutes, label: 'Minutes' },
              { value: countdown.seconds, label: 'Seconds' },
            ].map((item) => (
              <div key={item.label} className="text-center min-w-[72px]">
                <div
                  className="text-3xl md:text-4xl font-heading font-bold"
                  style={{ color: '#d4af37' }}
                >
                  {item.value}
                </div>
                <div className="font-label text-xs uppercase tracking-wider" style={{ color: '#d0c5af' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {wedding.showRsvp && (
            <a
              href={`/rsvp/${slug}`}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-label font-semibold text-sm transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #e9c349 50%, #d4af37 100%)',
                color: '#1c1b1b',
              }}
            >
              RSVP Now
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </section>

      {wedding.story && (
        <section className="py-24 px-4" style={{ backgroundColor: '#fcf9f8' }}>
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-label uppercase tracking-[0.2em] text-xs mb-4" style={{ color: '#d4af37' }}>
              Our Story
            </p>
            <h2
              className="text-3xl md:text-4xl font-heading font-bold mb-8"
              style={{ color: 'var(--color-text-primary)' }}
            >
              How We Met
            </h2>
            <div className="w-16 h-px mx-auto mb-8" style={{ backgroundColor: '#d4af37' }} />
            <p className="font-body text-lg leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-text-secondary)' }}>
              {wedding.story}
            </p>
          </div>
        </section>
      )}

      {wedding.schedule && wedding.schedule.length > 0 && (
        <section className="py-24 px-4" style={{ backgroundColor: '#f0eded' }}>
          <div className="max-w-3xl mx-auto">
            <p className="font-label uppercase tracking-[0.2em] text-xs mb-4 text-center" style={{ color: '#d4af37' }}>
              Schedule
            </p>
            <h2
              className="text-3xl md:text-4xl font-heading font-bold mb-12 text-center"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Wedding Day Timeline
            </h2>
            <div className="space-y-0">
              {wedding.schedule.map((item, i) => (
                <div key={i} className="flex gap-6 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-3 h-3 rounded-full border-2 shrink-0 mt-1.5"
                      style={{ borderColor: '#d4af37', backgroundColor: i === 0 ? '#d4af37' : 'transparent' }}
                    />
                    {i < wedding.schedule!.length - 1 && (
                      <div className="w-px flex-1" style={{ backgroundColor: '#d0c5af' }} />
                    )}
                  </div>
                  <div className="pb-10">
                    <div className="flex items-center gap-3 mb-1">
                      <Clock className="w-3.5 h-3.5" style={{ color: '#d4af37' }} />
                      <span className="font-label text-xs font-semibold uppercase tracking-wider" style={{ color: '#d4af37' }}>
                        {item.time}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="font-body text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {wedding.showGiftRegistry && wedding.gifts && wedding.gifts.length > 0 && (
        <section className="py-24 px-4" style={{ backgroundColor: '#fcf9f8' }}>
          <div className="max-w-4xl mx-auto text-center">
            <p className="font-label uppercase tracking-[0.2em] text-xs mb-4" style={{ color: '#d4af37' }}>
              Gift Registry
            </p>
            <h2
              className="text-3xl md:text-4xl font-heading font-bold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Gift Registry
            </h2>
            <div className="w-16 h-px mx-auto mb-12" style={{ backgroundColor: '#d4af37' }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wedding.gifts.map((gift) => (
                <div
                  key={gift.id}
                  className="rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-lg"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e2e1',
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Gift className="w-5 h-5" style={{ color: '#d4af37' }} />
                    {gift.claimed && (
                      <span
                        className="font-label text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#166d1310', color: '#166d13' }}
                      >
                        Claimed
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    {gift.name}
                  </h3>
                  <p className="font-body text-sm" style={{ color: '#d4af37' }}>
                    ${gift.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="py-12 px-4 text-center" style={{ backgroundColor: '#1c1b1b' }}>
        <div className="max-w-2xl mx-auto space-y-6">
          <Heart className="w-6 h-6 mx-auto" style={{ color: '#d4af37' }} fill="#d4af37" />
          <p className="font-heading text-xl font-semibold" style={{ color: '#fcf9f8' }}>
            {wedding.partner1} & {wedding.partner2}
          </p>
          <p className="font-label text-xs uppercase tracking-wider" style={{ color: '#7f7663' }}>
            {formattedDate}
          </p>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-label text-xs font-semibold transition-all duration-200 hover:scale-105"
            style={{
              border: '1px solid #d4af37',
              color: '#d4af37',
            }}
          >
            <Share2 className="w-3.5 h-3.5" />
            {shareSuccess ? 'Link Copied!' : 'Share This Page'}
          </button>
        </div>
      </footer>
    </div>
  );
}
