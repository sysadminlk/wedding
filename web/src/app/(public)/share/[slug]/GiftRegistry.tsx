'use client';

import { useEffect, useState } from 'react';
import { Gift, CheckCircle, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import type { GiftItem, CashFund } from '@/types';

export default function GiftRegistry({ slug }: { slug: string }) {
  const [physicalGifts, setPhysicalGifts] = useState<GiftItem[]>([]);
  const [cashFunds, setCashFunds] = useState<CashFund[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api<GiftItem[]>(`/api/public/share/${slug}/gifts`).catch(() => []),
      api<CashFund[]>(`/api/public/share/${slug}/cash-funds`).catch(() => []),
    ]).then(([gifts, funds]) => {
      setPhysicalGifts(gifts);
      setCashFunds(funds);
    });
  }, [slug]);

  const handleClaim = async (giftId: string) => {
    setClaimingId(giftId);
    try {
      await api(`/api/public/share/${slug}/gift/${giftId}/claim`, { method: 'POST' });
      setPhysicalGifts((prev) =>
        prev.map((g) => (g.id === giftId ? { ...g, claimed: true } : g)),
      );
    } catch {
      // silent
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Gift className="w-10 h-10 mx-auto mb-3" style={{ color: '#d4af37' }} />
        <h2 className="text-2xl font-heading font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Gift Registry
        </h2>
        <p className="font-body text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Help the couple start their new chapter
        </p>
      </div>

      {cashFunds.length > 0 && (
        <div>
          <p className="font-label text-xs uppercase tracking-wider mb-4" style={{ color: '#7f7663' }}>
            Cash Funds
          </p>
          <div className="space-y-4">
            {cashFunds.map((fund) => {
              const pct = fund.goalAmount > 0 ? Math.min(100, (fund.currentAmount / fund.goalAmount) * 100) : 0;
              return (
                <div
                  key={fund.id}
                  className="rounded-2xl p-5"
                  style={{ backgroundColor: '#ffffff', border: '1px solid #e5e2e1' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-heading text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {fund.name}
                      </h3>
                      {fund.description && (
                        <p className="font-body text-sm mt-0.5" style={{ color: '#7f7663' }}>
                          {fund.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#f0eded' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, #d4af37, #e9c349)',
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <p className="font-label text-xs" style={{ color: '#7f7663' }}>
                        ${fund.currentAmount.toFixed(2)} raised
                      </p>
                      <p className="font-label text-xs" style={{ color: '#7f7663' }}>
                        ${fund.goalAmount.toFixed(2)} goal
                      </p>
                    </div>
                  </div>

                  <button
                    className="w-full py-2.5 rounded-xl font-label font-semibold text-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #166d43 0%, #1e8a55 100%)',
                      color: '#ffffff',
                    }}
                  >
                    Contribute
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {physicalGifts.length > 0 && (
        <div>
          <p className="font-label text-xs uppercase tracking-wider mb-4" style={{ color: '#7f7663' }}>
            Physical Gifts
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {physicalGifts.map((gift) => (
              <div
                key={gift.id}
                className="rounded-2xl p-5 transition-all duration-200 hover:shadow-lg"
                style={{ backgroundColor: '#ffffff', border: '1px solid #e5e2e1' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-heading text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {gift.name}
                  </h3>
                  {gift.claimed && (
                    <CheckCircle className="w-5 h-5 shrink-0" style={{ color: '#166d13' }} />
                  )}
                </div>
                {gift.description && (
                  <p className="font-body text-sm mb-2" style={{ color: '#7f7663' }}>
                    {gift.description}
                  </p>
                )}
                <p className="font-label text-sm font-semibold mb-3" style={{ color: '#d4af37' }}>
                  ${gift.price.toFixed(2)}
                </p>
                <div className="flex gap-2">
                  {gift.link && (
                    <a
                      href={gift.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-label font-semibold text-xs transition-all duration-200 hover:scale-[1.02]"
                      style={{
                        border: '1px solid #d0c5af',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View
                    </a>
                  )}
                  <button
                    onClick={() => handleClaim(gift.id)}
                    disabled={gift.claimed || claimingId === gift.id}
                    className="flex-1 py-2.5 rounded-xl font-label font-semibold text-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{
                      background: gift.claimed
                        ? '#f0eded'
                        : 'linear-gradient(135deg, #d4af37 0%, #e9c349 50%, #d4af37 100%)',
                      color: gift.claimed ? '#7f7663' : '#1c1b1b',
                    }}
                  >
                    {claimingId === gift.id ? 'Claiming...' : gift.claimed ? 'Claimed' : "I'll get this"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {physicalGifts.length === 0 && cashFunds.length === 0 && (
        <div className="text-center py-12 space-y-3">
          <Gift className="w-10 h-10 mx-auto" style={{ color: '#d0c5af' }} />
          <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
            No gifts have been added to the registry yet.
          </p>
        </div>
      )}
    </div>
  );
}
