'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GiftItem, CashFund, PaginatedResponse } from '@/types';
import { Gift, Plus, Trash2, Edit, X, DollarSign, Check, Heart } from 'lucide-react';

interface GiftFormProps {
  item: GiftItem | null;
  onClose: () => void;
  onSaved: () => void;
}

function GiftForm({ item, onClose, onSaved }: GiftFormProps) {
  const [name, setName] = useState(item?.name ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [price, setPrice] = useState(item?.price?.toString() ?? '');
  const [link, setLink] = useState(item?.link ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name, description, price: parseFloat(price) || 0, link };
    const url = item ? `/api/gifts/${item.id}` : '/api/gifts';
    const method = item ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border p-6 shadow-xl"
        style={{ backgroundColor: 'var(--color-dashboard-surface)', borderColor: 'var(--color-dashboard-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold" style={{ color: 'var(--color-dashboard-text)' }}>
            {item ? 'Edit Gift Item' : 'Add Gift Item'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-label font-semibold mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border px-4 py-2.5 text-sm font-body outline-none transition-colors"
              style={{ borderColor: 'var(--color-dashboard-border)', color: 'var(--color-dashboard-text)', backgroundColor: 'var(--color-dashboard-surface)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-label font-semibold mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border px-4 py-2.5 text-sm font-body outline-none transition-colors resize-none"
              style={{ borderColor: 'var(--color-dashboard-border)', color: 'var(--color-dashboard-text)', backgroundColor: 'var(--color-dashboard-surface)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-label font-semibold mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>Price ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border px-4 py-2.5 text-sm font-body outline-none transition-colors"
              style={{ borderColor: 'var(--color-dashboard-border)', color: 'var(--color-dashboard-text)', backgroundColor: 'var(--color-dashboard-surface)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-label font-semibold mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>Link (optional)</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border px-4 py-2.5 text-sm font-body outline-none transition-colors"
              style={{ borderColor: 'var(--color-dashboard-border)', color: 'var(--color-dashboard-text)', backgroundColor: 'var(--color-dashboard-surface)' }}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" loading={saving}>{item ? 'Save Changes' : 'Add Gift'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface FundFormProps {
  fund: CashFund | null;
  onClose: () => void;
  onSaved: () => void;
}

function FundForm({ fund, onClose, onSaved }: FundFormProps) {
  const [name, setName] = useState(fund?.name ?? '');
  const [description, setDescription] = useState(fund?.description ?? '');
  const [goalAmount, setGoalAmount] = useState(fund?.goalAmount?.toString() ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name, description, goalAmount: parseFloat(goalAmount) || 0 };
    const url = fund ? `/api/funds/${fund.id}` : '/api/funds';
    const method = fund ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border p-6 shadow-xl"
        style={{ backgroundColor: 'var(--color-dashboard-surface)', borderColor: 'var(--color-dashboard-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold" style={{ color: 'var(--color-dashboard-text)' }}>
            {fund ? 'Edit Cash Fund' : 'Create Cash Fund'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-label font-semibold mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>Fund Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border px-4 py-2.5 text-sm font-body outline-none transition-colors"
              style={{ borderColor: 'var(--color-dashboard-border)', color: 'var(--color-dashboard-text)', backgroundColor: 'var(--color-dashboard-surface)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-label font-semibold mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border px-4 py-2.5 text-sm font-body outline-none transition-colors resize-none"
              style={{ borderColor: 'var(--color-dashboard-border)', color: 'var(--color-dashboard-text)', backgroundColor: 'var(--color-dashboard-surface)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-label font-semibold mb-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>Goal Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              className="w-full rounded-xl border px-4 py-2.5 text-sm font-body outline-none transition-colors"
              style={{ borderColor: 'var(--color-dashboard-border)', color: 'var(--color-dashboard-text)', backgroundColor: 'var(--color-dashboard-surface)' }}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" loading={saving}>{fund ? 'Save Changes' : 'Create Fund'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GiftsPage() {
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [funds, setFunds] = useState<CashFund[]>([]);
  const [giftPage, setGiftPage] = useState(0);
  const [giftTotal, setGiftTotal] = useState(0);
  const [loadingGifts, setLoadingGifts] = useState(true);
  const [loadingFunds, setLoadingFunds] = useState(true);
  const [showGiftForm, setShowGiftForm] = useState(false);
  const [showFundForm, setShowFundForm] = useState(false);
  const [editingGift, setEditingGift] = useState<GiftItem | null>(null);
  const [editingFund, setEditingFund] = useState<CashFund | null>(null);

  const fetchGifts = useCallback(async () => {
    setLoadingGifts(true);
    try {
      const res = await fetch(`/api/gifts?page=${giftPage}&size=12`, { credentials: 'include' });
      const data: PaginatedResponse<GiftItem> = await res.json();
      setGifts(data.content || []);
      setGiftTotal(data.totalElements || 0);
    } catch {
      setGifts([]);
    } finally {
      setLoadingGifts(false);
    }
  }, [giftPage]);

  const fetchFunds = useCallback(async () => {
    setLoadingFunds(true);
    try {
      const res = await fetch('/api/funds', { credentials: 'include' });
      const data = await res.json();
      setFunds(Array.isArray(data) ? data : data.content || []);
    } catch {
      setFunds([]);
    } finally {
      setLoadingFunds(false);
    }
  }, []);

  useEffect(() => { fetchGifts(); }, [fetchGifts]);
  useEffect(() => { fetchFunds(); }, [fetchFunds]);

  const handleDeleteGift = async (id: string) => {
    if (!confirm('Delete this gift item?')) return;
    await fetch(`/api/gifts/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchGifts();
  };

  const handleClaimGift = async (id: string) => {
    await fetch(`/api/gifts/${id}/claim`, { method: 'PUT', credentials: 'include' });
    fetchGifts();
  };

  const handleDeleteFund = async (id: string) => {
    if (!confirm('Delete this cash fund?')) return;
    await fetch(`/api/funds/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchFunds();
  };

  const totalGiftPages = Math.ceil(giftTotal / 12);

  return (
    <div>
      <PageHeader
        title="Gift Registry"
        description="Manage gift items and cash funds for your wedding"
      />

      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-bold" style={{ color: 'var(--color-dashboard-text)' }}>
            Gift Items
          </h2>
          <Button size="sm" onClick={() => { setEditingGift(null); setShowGiftForm(true); }}>
            <Plus size={16} className="mr-1.5" />
            Add Gift
          </Button>
        </div>

        {loadingGifts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5 animate-pulse">
                <div className="h-5 w-2/3 rounded mb-3" style={{ backgroundColor: 'var(--color-dashboard-border)' }} />
                <div className="h-4 w-1/3 rounded mb-2" style={{ backgroundColor: 'var(--color-dashboard-border)' }} />
                <div className="h-10 w-full rounded" style={{ backgroundColor: 'var(--color-dashboard-border)' }} />
              </Card>
            ))}
          </div>
        ) : gifts.length === 0 ? (
          <Card className="p-10 text-center">
            <Gift size={40} className="mx-auto mb-3" style={{ color: 'var(--color-dashboard-border)' }} />
            <p className="font-body text-sm" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              No gift items yet. Add your first gift to get started.
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gifts.map((gift) => (
                <Card key={gift.id} className="p-5 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-semibold text-sm truncate" style={{ color: 'var(--color-dashboard-text)' }}>
                        {gift.name}
                      </h3>
                      {gift.description && (
                        <p className="font-body text-xs mt-1 line-clamp-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                          {gift.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => { setEditingGift(gift); setShowGiftForm(true); }}
                        className="p-1.5 rounded-lg transition-colors hover:bg-black/5"
                        style={{ color: 'var(--color-dashboard-text-secondary)' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteGift(gift.id)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                        style={{ color: '#ba1a1a' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <p className="font-heading font-bold text-lg mb-3" style={{ color: '#d4af37' }}>
                      ${gift.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    {gift.claimed ? (
                      <div
                        className="flex items-center justify-center gap-1.5 w-full rounded-xl py-2 text-xs font-label font-semibold"
                        style={{ backgroundColor: '#166d1315', color: '#166d13' }}
                      >
                        <Check size={14} />
                        Claimed{gift.claimedBy ? ` by ${gift.claimedBy}` : ''}
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleClaimGift(gift.id)}
                      >
                        <Heart size={14} className="mr-1.5" />
                        Claim This Gift
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {totalGiftPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setGiftPage((p) => Math.max(0, p - 1))}
                  disabled={giftPage === 0}
                >
                  Previous
                </Button>
                <span className="text-xs font-label" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  Page {giftPage + 1} of {totalGiftPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setGiftPage((p) => Math.min(totalGiftPages - 1, p + 1))}
                  disabled={giftPage >= totalGiftPages - 1}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-bold" style={{ color: 'var(--color-dashboard-text)' }}>
            Cash Funds
          </h2>
          <Button size="sm" onClick={() => { setEditingFund(null); setShowFundForm(true); }}>
            <Plus size={16} className="mr-1.5" />
            Create Fund
          </Button>
        </div>

        {loadingFunds ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5 animate-pulse">
                <div className="h-5 w-2/3 rounded mb-3" style={{ backgroundColor: 'var(--color-dashboard-border)' }} />
                <div className="h-4 w-full rounded mb-2" style={{ backgroundColor: 'var(--color-dashboard-border)' }} />
                <div className="h-3 w-full rounded" style={{ backgroundColor: 'var(--color-dashboard-border)' }} />
              </Card>
            ))}
          </div>
        ) : funds.length === 0 ? (
          <Card className="p-10 text-center">
            <DollarSign size={40} className="mx-auto mb-3" style={{ color: 'var(--color-dashboard-border)' }} />
            <p className="font-body text-sm" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              No cash funds yet. Create a fund to let guests contribute.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {funds.map((fund) => {
              const pct = fund.goalAmount > 0 ? Math.min(100, (fund.currentAmount / fund.goalAmount) * 100) : 0;
              return (
                <Card key={fund.id} className="p-5 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-semibold text-sm truncate" style={{ color: 'var(--color-dashboard-text)' }}>
                        {fund.name}
                      </h3>
                      {fund.description && (
                        <p className="font-body text-xs mt-1 line-clamp-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                          {fund.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => { setEditingFund(fund); setShowFundForm(true); }}
                        className="p-1.5 rounded-lg transition-colors hover:bg-black/5"
                        style={{ color: 'var(--color-dashboard-text-secondary)' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteFund(fund.id)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                        style={{ color: '#ba1a1a' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="font-heading font-bold text-lg" style={{ color: '#d4af37' }}>
                        ${fund.currentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="font-body text-xs" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                        of ${fund.goalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-dashboard-border)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: pct >= 100 ? '#166d13' : '#d4af37',
                        }}
                      />
                    </div>
                    <p className="text-right font-label text-[10px] mt-1" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                      {pct.toFixed(0)}% funded
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {showGiftForm && (
        <GiftForm
          item={editingGift}
          onClose={() => { setShowGiftForm(false); setEditingGift(null); }}
          onSaved={() => { setShowGiftForm(false); setEditingGift(null); fetchGifts(); }}
        />
      )}

      {showFundForm && (
        <FundForm
          fund={editingFund}
          onClose={() => { setShowFundForm(false); setEditingFund(null); }}
          onSaved={() => { setShowFundForm(false); setEditingFund(null); fetchFunds(); }}
        />
      )}
    </div>
  );
}
