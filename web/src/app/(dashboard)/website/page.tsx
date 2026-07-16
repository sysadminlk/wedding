'use client'

import { useState, useEffect } from 'react'
import { Globe, Eye, Save, Layout, Palette } from 'lucide-react'
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
  showGiftRegistry: false,
  showRsvp: false,
  showGallery: false,
  createdAt: '',
}

export default function WebsitePage() {
  const [config, setConfig] = useState<WebsiteConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/website')
      .then((res) => res.json())
      .then((data: WebsiteConfig) => {
        setConfig(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/website', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
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

  const previewGradients: Record<string, string> = {
    Classic: 'linear-gradient(135deg, #2c1810 0%, #5a3d2b 50%, #2c1810 100%)',
    Modern: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    Rustic: 'linear-gradient(135deg, #3e2723 0%, #5d4037 50%, #4e342e 100%)',
    Beach: 'linear-gradient(135deg, #006064 0%, #00838f 50%, #0097a7 100%)',
    Garden: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)',
    Royal: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #303f9f 100%)',
  }

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

                        {!config.showRsvp && !config.showGiftRegistry && !config.showGallery && (
                          <p className="text-xs font-body text-center py-2" style={{ color: 'var(--color-dashboard-text-secondary)', opacity: 0.5 }}>
                            Toggle on sections to see them here
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
