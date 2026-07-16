'use client';

import { useState } from 'react';
import { Search, MapPin, User } from 'lucide-react';
import api from '@/lib/api';

interface SeatResult {
  guestName: string;
  tableName: string;
  seatNumber: number;
}

export default function SeatFinder({ slug }: { slug: string }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SeatResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const data = await api<SeatResult>(`/api/public/share/${slug}/seat?name=${encodeURIComponent(query.trim())}`);
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <MapPin className="w-10 h-10 mx-auto mb-3" style={{ color: '#d4af37' }} />
        <h2 className="text-2xl font-heading font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Find Your Seat
        </h2>
        <p className="font-body text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Enter your name to find your table and seat assignment
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7f7663' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter your name..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-body transition-colors focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            style={{
              backgroundColor: '#f6f3f2',
              border: '1px solid #d0c5af',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-5 py-3 rounded-xl font-label font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #e9c349 50%, #d4af37 100%)',
            color: '#1c1b1b',
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {searched && !loading && (
        <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e2e1' }}>
          {result ? (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: '#d4af3715' }}>
                <User className="w-7 h-7" style={{ color: '#d4af37' }} />
              </div>
              <div>
                <p className="font-heading text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {result.guestName}
                </p>
              </div>
              <div className="w-12 h-px mx-auto" style={{ backgroundColor: '#d0c5af' }} />
              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                <div className="text-center">
                  <p className="font-label text-xs uppercase tracking-wider mb-1" style={{ color: '#7f7663' }}>
                    Table
                  </p>
                  <p className="font-heading text-lg font-bold" style={{ color: '#d4af37' }}>
                    {result.tableName}
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-label text-xs uppercase tracking-wider mb-1" style={{ color: '#7f7663' }}>
                    Seat
                  </p>
                  <p className="font-heading text-lg font-bold" style={{ color: '#d4af37' }}>
                    {result.seatNumber}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              <MapPin className="w-10 h-10 mx-auto" style={{ color: '#d0c5af' }} />
              <p className="font-heading text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Guest Not Found
              </p>
              <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
                We couldn&apos;t find a seat assignment for &ldquo;{query}&rdquo;. Please check the spelling or ask a wedding coordinator.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
