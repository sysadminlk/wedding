'use client';

import { useState, useEffect } from 'react';
import { Palette, Upload, Check } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const FONT_OPTIONS = [
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
];

export default function BrandingPage() {
  const [logo, setLogo] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#d4af37');
  const [tagline, setTagline] = useState('');
  const [fontFamily, setFontFamily] = useState('Playfair Display');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/admin/branding', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const cfg = data.data ?? data;
          setLogo(cfg.logo ?? '');
          setPrimaryColor(cfg.primaryColor ?? '#d4af37');
          setTagline(cfg.tagline ?? '');
          setFontFamily(cfg.fontFamily ?? 'Playfair Display');
        }
      } catch {}
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/admin/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ logo, primaryColor, tagline, fontFamily }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogo(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-3"
            style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }}
          />
          <p className="text-sm font-label" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            Loading branding config...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Branding" description="Customize your platform appearance" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-6">
          <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--color-dashboard-text)' }}>
            Configuration
          </h2>

          <div>
            <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              Logo
            </label>
            <div className="flex items-center gap-4">
              {logo && (
                <img src={logo} alt="Logo" className="w-16 h-16 rounded-xl object-contain border" style={{ borderColor: 'var(--color-dashboard-border)' }} />
              )}
              <label
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors hover:shadow-luxury font-label text-sm font-semibold"
                style={{ borderColor: 'var(--color-dashboard-border)', color: 'var(--color-dashboard-text)', backgroundColor: 'var(--color-dashboard-surface)' }}
              >
                <Upload size={16} style={{ color: '#d4af37' }} />
                {logo ? 'Change Logo' : 'Upload Logo'}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-lg border-0 cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border font-body text-sm"
                style={{
                  borderColor: 'var(--color-dashboard-border)',
                  backgroundColor: 'var(--color-dashboard-surface)',
                  color: 'var(--color-dashboard-text)',
                }}
              />
            </div>
          </div>

          <div>
            <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Your wedding, your way"
              className="w-full px-4 py-2.5 rounded-xl border font-body text-sm"
              style={{
                borderColor: 'var(--color-dashboard-border)',
                backgroundColor: 'var(--color-dashboard-surface)',
                color: 'var(--color-dashboard-text)',
              }}
            />
          </div>

          <div>
            <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              Font Family
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border font-body text-sm"
              style={{
                borderColor: 'var(--color-dashboard-border)',
                backgroundColor: 'var(--color-dashboard-surface)',
                color: 'var(--color-dashboard-text)',
              }}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} loading={saving}>
              {saved ? <><Check size={16} className="mr-2" /> Saved</> : 'Save Changes'}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-heading font-bold text-lg mb-5" style={{ color: 'var(--color-dashboard-text)' }}>
            Live Preview
          </h2>
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: primaryColor + '10', border: `2px solid ${primaryColor}40` }}
          >
            {logo && (
              <img src={logo} alt="Logo" className="w-20 h-20 mx-auto rounded-xl object-contain mb-4" />
            )}
            <h3
              className="font-heading font-bold text-2xl mb-2"
              style={{ color: primaryColor, fontFamily }}
            >
              WeddingHub
            </h3>
            {tagline && (
              <p className="font-body text-sm" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                {tagline}
              </p>
            )}
            <div className="flex justify-center gap-3 mt-6">
              <div className="px-5 py-2.5 rounded-xl font-label font-semibold text-sm" style={{ backgroundColor: primaryColor, color: '#1c1b1b' }}>
                Primary Button
              </div>
              <div className="px-5 py-2.5 rounded-xl border font-label font-semibold text-sm" style={{ borderColor: primaryColor, color: primaryColor }}>
                Secondary Button
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
