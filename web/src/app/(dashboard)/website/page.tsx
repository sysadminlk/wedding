'use client'

import { useState, useEffect } from 'react'
import { Globe, Eye, Save, Layout, Palette, Clock, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { WebsiteConfig } from '@/types'

const THEMES = ['Classic', 'Modern', 'Rustic', 'Beach', 'Garden', 'Royal'] as const

const defaultConfig: WebsiteConfig = {
  id: '',
  tenantId: '',
  slug: '',
  theme: 'Classic',
  heroImageUrl: '',
  title: '',
  subtitle: '',
  story: '',
  schedule: [],
  showGiftRegistry: false,
  showRsvp: false,
  showGallery: false,
  createdAt: '',
}

interface ScheduleEvent {
  title: string;
  time: string;
  description: string;
}

const emptyEvent: ScheduleEvent = { title: '', time: '', description: '' };

export default function WebsitePage() {
  const [config, setConfig] = useState<WebsiteConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [events, setEvents] = useState<ScheduleEvent[]>([])

  useEffect(() => {
    fetch('/api/website')
      .then((res) => res.json())
      .then((data: WebsiteConfig) => {
        setConfig(data)
        setEvents(
          (data.schedule || []).map((e) => ({
            title: e.title,
            time: e.time,
            description: e.description || '',
          }))
        )
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const cleaned = events.filter((e) => e.title.trim().length > 0);
      const res = await fetch('/api/website', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, schedule: cleaned }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = <K extends keyof WebsiteConfig>(key: K, value: WebsiteConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const updateEvent = (index: number, field: keyof ScheduleEvent, value: string) => {
    setEvents((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
  };

  const addEvent = () => {
    setEvents((prev) => [...prev, { ...emptyEvent }]);
  };

  const removeEvent = (index: number) => {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  };

  const previewGradients: Record<string, string> = {
    Classic: 'linear-gradient(135deg, #2c1810 0%, #5a3d2b 50%, #2c1810 100%)',
    Modern: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    Rustic: 'linear-gradient(135deg, #3e2723 0%, #5d4037 50%, #4e342e 100%)',
    Beach: 'linear-gradient(135deg, #006064 0%, #00838f 50%, #0097a7 100%)',
    Garden: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)',
    Royal: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #303f9f 100%)',
  }

  const filledEvents = events.filter((e) => e.title.trim().length > 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-dashboard-surface)' }}>
      <PageHeader
        title="Public Website"
        description="Customize how guests see your wedding site"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Layout className="w-5 h-5" style={{ color: '#d4af37' }} />
                    <h2 className="text-lg font-heading" style={{ color: 'var(--color-dashboard-text)' }}>
                      Website Settings
                    </h2>
                  </div>

                  <Input
                    label="Website Title"
                    value={config.title || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateConfig('title', e.target.value)}
                    placeholder="Sarah & James"
                  />

                  <Input
                    label="Subtitle"
                    value={config.subtitle || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateConfig('subtitle', e.target.value)}
                    placeholder="Are getting married!"
                  />

                  <Input
                    label="Hero Image URL"
                    value={config.heroImageUrl || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateConfig('heroImageUrl', e.target.value)}
                    placeholder="https://example.com/hero.jpg"
                  />

                  <div className="space-y-2">
                    <label className="block text-xs font-label uppercase tracking-wider" style={{ color: 'var(--color-auth-text-secondary)' }}>
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {THEMES.map((theme) => (
                        <button
                          key={theme}
                          onClick={() => updateConfig('theme', theme)}
                          className="rounded-xl px-3 py-2.5 text-xs font-label transition-all"
                          style={{
                            backgroundColor: config.theme === theme ? '#d4af37' : 'var(--color-auth-input-bg)',
                            color: config.theme === theme ? '#1c1b1b' : 'var(--color-dashboard-text-secondary)',
                            border: `1px solid ${config.theme === theme ? '#d4af37' : 'var(--color-auth-border)'}`,
                          }}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-label uppercase tracking-wider" style={{ color: 'var(--color-auth-text-secondary)' }}>
                      Love Story
                    </label>
                    <textarea
                      value={config.story || ''}
                      onChange={(e) => updateConfig('story', e.target.value)}
                      placeholder="Tell your love story... How you met, your first date, the proposal..."
                      rows={6}
                      className="w-full rounded-lg px-4 py-3 font-body text-sm leading-relaxed resize-y outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--color-auth-input-bg)',
                        border: '1px solid var(--color-auth-border)',
                        color: 'var(--color-dashboard-text)',
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" style={{ color: '#d4af37' }} />
                        <label className="block text-xs font-label uppercase tracking-wider" style={{ color: 'var(--color-auth-text-secondary)' }}>
                          Wedding Day Schedule
                        </label>
                      </div>
                      <button
                        onClick={addEvent}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label text-xs transition-colors"
                        style={{
                          border: '1px solid #d4af37',
                          color: '#d4af37',
                        }}
                      >
                        <Plus className="w-3 h-3" />
                        Add Event
                      </button>
                    </div>

                    {events.length === 0 && (
                      <p className="font-body text-sm py-3 text-center" style={{ color: 'var(--color-dashboard-text-secondary)', opacity: 0.6 }}>
                        No schedule events yet. Click &ldquo;Add Event&rdquo; to create your wedding day timeline.
                      </p>
                    )}

                    <div className="space-y-3">
                      {events.map((event, i) => (
                        <div
                          key={i}
                          className="rounded-lg p-4 space-y-3"
                          style={{
                            backgroundColor: 'var(--color-auth-input-bg)',
                            border: '1px solid var(--color-dashboard-border)',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-label text-xs" style={{ color: '#d4af37' }}>
                              Event {i + 1}
                            </span>
                            <button
                              onClick={() => removeEvent(i)}
                              className="p-1 rounded transition-colors"
                              style={{ color: 'var(--color-dashboard-text-secondary)' }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="font-label text-xs" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                                Title
                              </label>
                              <input
                                value={event.title}
                                onChange={(e) => updateEvent(i, 'title', e.target.value)}
                                placeholder="Ceremony"
                                className="w-full rounded-lg px-3 py-2 font-body text-sm outline-none"
                                style={{
                                  backgroundColor: 'var(--color-dashboard-surface)',
                                  border: '1px solid var(--color-dashboard-border)',
                                  color: 'var(--color-dashboard-text)',
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-label text-xs" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                                Time
                              </label>
                              <input
                                value={event.time}
                                onChange={(e) => updateEvent(i, 'time', e.target.value)}
                                placeholder="3:00 PM"
                                className="w-full rounded-lg px-3 py-2 font-body text-sm outline-none"
                                style={{
                                  backgroundColor: 'var(--color-dashboard-surface)',
                                  border: '1px solid var(--color-dashboard-border)',
                                  color: 'var(--color-dashboard-text)',
                                }}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="font-label text-xs" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                              Description
                            </label>
                            <input
                              value={event.description}
                              onChange={(e) => updateEvent(i, 'description', e.target.value)}
                              placeholder="Exchange of vows at the garden altar"
                              className="w-full rounded-lg px-3 py-2 font-body text-sm outline-none"
                              style={{
                                backgroundColor: 'var(--color-dashboard-surface)',
                                border: '1px solid var(--color-dashboard-border)',
                                color: 'var(--color-dashboard-text)',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="rounded-lg p-4 space-y-4"
                    style={{
                      backgroundColor: 'var(--color-auth-input-bg)',
                      border: '1px solid var(--color-dashboard-border)',
                    }}
                  >
                    <p className="font-label text-sm" style={{ color: 'var(--color-dashboard-text)' }}>
                      Visible Sections
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-label text-sm" style={{ color: 'var(--color-dashboard-text)' }}>
                          Gift Registry
                        </p>
                        <p className="text-xs font-body" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                          Show gift registry on public site
                        </p>
                      </div>
                      <button
                        onClick={() => updateConfig('showGiftRegistry', !config.showGiftRegistry)}
                        className="relative w-11 h-6 rounded-full transition-colors"
                        style={{
                          backgroundColor: config.showGiftRegistry ? '#d4af37' : 'var(--color-dashboard-border)',
                        }}
                      >
                        <span
                          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm"
                          style={{ transform: config.showGiftRegistry ? 'translateX(20px)' : 'translateX(0)' }}
                        />
                      </button>
                    </div>

                    <div className="w-full" style={{ borderTop: '1px solid var(--color-dashboard-border)' }} />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-label text-sm" style={{ color: 'var(--color-dashboard-text)' }}>
                          RSVP
                        </p>
                        <p className="text-xs font-body" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                          Show RSVP page on public site
                        </p>
                      </div>
                      <button
                        onClick={() => updateConfig('showRsvp', !config.showRsvp)}
                        className="relative w-11 h-6 rounded-full transition-colors"
                        style={{
                          backgroundColor: config.showRsvp ? '#d4af37' : 'var(--color-dashboard-border)',
                        }}
                      >
                        <span
                          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm"
                          style={{ transform: config.showRsvp ? 'translateX(20px)' : 'translateX(0)' }}
                        />
                      </button>
                    </div>

                    <div className="w-full" style={{ borderTop: '1px solid var(--color-dashboard-border)' }} />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-label text-sm" style={{ color: 'var(--color-dashboard-text)' }}>
                          Photo Gallery
                        </p>
                        <p className="text-xs font-body" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                          Show photo gallery on public site
                        </p>
                      </div>
                      <button
                        onClick={() => updateConfig('showGallery', !config.showGallery)}
                        className="relative w-11 h-6 rounded-full transition-colors"
                        style={{
                          backgroundColor: config.showGallery ? '#d4af37' : 'var(--color-dashboard-border)',
                        }}
                      >
                        <span
                          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm"
                          style={{ transform: config.showGallery ? 'translateX(20px)' : 'translateX(0)' }}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-label text-sm text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#d4af37' }}
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-8 space-y-6">
                <Card>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <Eye className="w-5 h-5" style={{ color: '#d4af37' }} />
                      <h2 className="text-lg font-heading" style={{ color: 'var(--color-dashboard-text)' }}>
                        Live Preview
                      </h2>
                    </div>

                    <div
                      className="rounded-xl overflow-hidden"
                      style={{
                        border: '1px solid var(--color-dashboard-border)',
                      }}
                    >
                      <div
                        className="relative px-6 py-12 text-center"
                        style={{
                          background: config.heroImageUrl
                            ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${config.heroImageUrl}) center/cover`
                            : previewGradients[config.theme],
                          minHeight: '180px',
                        }}
                      >
                        <h3
                          className="font-heading text-xl text-white mb-1 drop-shadow-lg"
                        >
                          {config.title || 'Your Wedding Title'}
                        </h3>
                        <p className="font-body text-sm text-white/80 drop-shadow">
                          {config.subtitle || 'Your subtitle goes here'}
                        </p>
                      </div>

                      <div className="p-4 space-y-3" style={{ backgroundColor: 'var(--color-auth-input-bg)' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Palette className="w-3.5 h-3.5" style={{ color: '#d4af37' }} />
                          <span className="text-xs font-label" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                            {config.theme} Theme
                          </span>
                        </div>

                        {(config.story || '').trim().length > 0 && (
                          <div
                            className="rounded-lg px-3 py-2"
                            style={{
                              border: '1px solid var(--color-dashboard-border)',
                              backgroundColor: 'var(--color-dashboard-surface)',
                            }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-body" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                                Love Story
                              </span>
                              <span
                                className="text-xs font-label px-2 py-0.5 rounded"
                                style={{ backgroundColor: '#d4af37', color: '#1c1b1b' }}
                              >
                                Live
                              </span>
                            </div>
                            <p className="text-xs font-body line-clamp-2" style={{ color: 'var(--color-dashboard-text-secondary)', opacity: 0.7 }}>
                              {config.story}
                            </p>
                          </div>
                        )}

                        {filledEvents.length > 0 && (
                          <div
                            className="rounded-lg px-3 py-2"
                            style={{
                              border: '1px solid var(--color-dashboard-border)',
                              backgroundColor: 'var(--color-dashboard-surface)',
                            }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-body" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                                Schedule ({filledEvents.length} events)
                              </span>
                              <span
                                className="text-xs font-label px-2 py-0.5 rounded"
                                style={{ backgroundColor: '#d4af37', color: '#1c1b1b' }}
                              >
                                Live
                              </span>
                            </div>
                            {filledEvents.slice(0, 3).map((e, i) => (
                              <div key={i} className="flex items-center gap-2 mt-1">
                                {e.time && (
                                  <span className="text-xs font-label" style={{ color: '#d4af37' }}>
                                    {e.time}
                                  </span>
                                )}
                                <span className="text-xs font-body" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                                  {e.title}
                                </span>
                              </div>
                            ))}
                            {filledEvents.length > 3 && (
                              <p className="text-xs font-body mt-1" style={{ color: 'var(--color-dashboard-text-secondary)', opacity: 0.5 }}>
                                +{filledEvents.length - 3} more
                              </p>
                            )}
                          </div>
                        )}

                        {config.showRsvp && (
                          <div
                            className="flex items-center justify-between rounded-lg px-3 py-2"
                            style={{
                              border: '1px solid var(--color-dashboard-border)',
                              backgroundColor: 'var(--color-dashboard-surface)',
                            }}
                          >
                            <span className="text-xs font-body" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                              RSVP
                            </span>
                            <span
                              className="text-xs font-label px-2 py-0.5 rounded"
                              style={{ backgroundColor: '#d4af37', color: '#1c1b1b' }}
                            >
                              Live
                            </span>
                          </div>
                        )}

                        {config.showGiftRegistry && (
                          <div
                            className="flex items-center justify-between rounded-lg px-3 py-2"
                            style={{
                              border: '1px solid var(--color-dashboard-border)',
                              backgroundColor: 'var(--color-dashboard-surface)',
                            }}
                          >
                            <span className="text-xs font-body" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                              Gift Registry
                            </span>
                            <span
                              className="text-xs font-label px-2 py-0.5 rounded"
                              style={{ backgroundColor: '#d4af37', color: '#1c1b1b' }}
                            >
                              Live
                            </span>
                          </div>
                        )}

                        {config.showGallery && (
                          <div
                            className="flex items-center justify-between rounded-lg px-3 py-2"
                            style={{
                              border: '1px solid var(--color-dashboard-border)',
                              backgroundColor: 'var(--color-dashboard-surface)',
                            }}
                          >
                            <span className="text-xs font-body" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                              Photo Gallery
                            </span>
                            <span
                              className="text-xs font-label px-2 py-0.5 rounded"
                              style={{ backgroundColor: '#d4af37', color: '#1c1b1b' }}
                            >
                              Live
                            </span>
                          </div>
                        )}

                        {!config.showRsvp && !config.showGiftRegistry && !config.showGallery && (config.story || '').trim().length === 0 && filledEvents.length === 0 && (
                          <p className="text-xs font-body text-center py-2" style={{ color: 'var(--color-dashboard-text-secondary)', opacity: 0.5 }}>
                            Toggle on sections or add content to see them here
                          </p>
                        )}

                        <div
                          className="w-full rounded-lg py-2.5 text-center text-xs font-label text-white mt-2"
                          style={{ backgroundColor: '#d4af37' }}
                        >
                          Visit Site →
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
