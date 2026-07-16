'use client';

import { useState, useEffect } from 'react';
import { Layout, Check, Eye } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const DESIGNS = [
  { id: 'atelier', name: 'Atelier', color: '#2c2420', accent: '#d4af37' },
  { id: 'ivory', name: 'Ivory', color: '#f5f0eb', accent: '#b8a88a' },
  { id: 'cinema', name: 'Cinema', color: '#1a1a2e', accent: '#e94560' },
  { id: 'split', name: 'Split', color: '#2d3436', accent: '#00b894' },
  { id: 'editorial', name: 'Editorial', color: '#f8f4f0', accent: '#333333' },
  { id: 'minimal', name: 'Minimal', color: '#ffffff', accent: '#a0a0a0' },
  { id: 'gilded', name: 'Gilded', color: '#1c1b1b', accent: '#d4af37' },
  { id: 'folio', name: 'Folio', color: '#2d2d2d', accent: '#c9a96e' },
  { id: 'portrait', name: 'Portrait', color: '#f0ebe3', accent: '#8b7355' },
  { id: 'deco', name: 'Deco', color: '#1b1b2f', accent: '#e8d5b7' },
];

export default function LandingPage() {
  const [activeDesign, setActiveDesign] = useState('atelier');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/admin/landing', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setActiveDesign(data.activeDesign ?? data.data?.activeDesign ?? 'atelier');
        }
      } catch {}
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleSelect = async (designId: string) => {
    setSaving(true);
    setActiveDesign(designId);
    setSaved(false);
    try {
      await fetch('/api/admin/landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ activeDesign: designId }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
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
            Loading landing pages...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Landing Pages" description="Select your public website design" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {DESIGNS.map((design) => {
          const isActive = activeDesign === design.id;
          return (
            <Card
              key={design.id}
              className="overflow-hidden transition-all duration-200"
              style={isActive ? { borderColor: '#d4af37', borderWidth: '2px' } : {}}
            >
              <div
                className="relative h-40 flex items-center justify-center"
                style={{ backgroundColor: design.color }}
              >
                <div className="text-center">
                  <div className="w-16 h-0.5 mx-auto mb-3 rounded-full" style={{ backgroundColor: design.accent }} />
                  <p className="font-heading font-bold text-lg" style={{ color: design.accent }}>
                    {design.name}
                  </p>
                  <div className="w-8 h-0.5 mx-auto mt-3 rounded-full" style={{ backgroundColor: design.accent }} />
                </div>
                {isActive && (
                  <div
                    className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-label font-bold"
                    style={{ background: 'linear-gradient(135deg, #d4af37 0%, #e9c349 50%, #d4af37 100%)', color: '#1c1b1b' }}
                  >
                    <Check size={12} />
                    Active
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-heading font-bold text-sm mb-3" style={{ color: 'var(--color-dashboard-text)' }}>
                  {design.name}
                </h3>
                <div className="flex gap-2">
                  <a
                    href={`/w/demo-${design.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="ghost" size="sm" className="w-full">
                      <Eye size={14} className="mr-1" />
                      Preview
                    </Button>
                  </a>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSelect(design.id)}
                    loading={saving && activeDesign === design.id}
                  >
                    {isActive ? 'Selected' : 'Select'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {saved && (
        <div
          className="flex items-center gap-2 p-4 rounded-xl text-sm font-body"
          style={{ backgroundColor: '#16a34a15', color: '#16a34a', border: '1px solid #16a34a30' }}
        >
          <Check size={16} />
          Landing page updated successfully
        </div>
      )}
    </div>
  );
}
