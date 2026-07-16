'use client'

import { useState, useEffect } from 'react'
import { ClipboardList, Eye, Save, Users, Settings } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { RsvpConfig } from '@/types'

const defaultConfig: RsvpConfig = {
  id: '',
  tenantId: '',
  welcomeMessage: '',
  plusOneAllowed: false,
  dietaryField: false,
  accommodationField: false,
  customQuestions: '',
  createdAt: '',
}

export default function RsvpPage() {
  const [config, setConfig] = useState<RsvpConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/rsvp')
      .then((res) => res.json())
      .then((data: RsvpConfig) => {
        setConfig(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/rsvp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (res.ok) {
        setConfig(config)
      }
    } finally {
      setSaving(false)
    }
  }

  const updateConfig = <K extends keyof RsvpConfig>(key: K, value: RsvpConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const toggleQuestions = (config.customQuestions ?? '')
    .split('\n')
    .filter((q) => q.trim().length > 0)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-dashboard-surface)' }}>
      <PageHeader
        title="RSVP Settings"
        description="Customize how guests respond to your invitation"
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
                    <Settings className="w-5 h-5" style={{ color: '#d4af37' }} />
                    <h2 className="text-lg font-heading" style={{ color: 'var(--color-dashboard-text)' }}>
                      RSVP Configuration
                    </h2>
                  </div>

                  <div className="space-y-2">
                    <label className="font-label text-sm" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                      Welcome Message
                    </label>
                    <textarea
                      value={config.welcomeMessage}
                      onChange={(e) => updateConfig('welcomeMessage', e.target.value)}
                      placeholder="We can't wait to celebrate with you!"
                      rows={3}
                      className="w-full rounded-lg px-4 py-3 font-body text-sm outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--color-auth-input-bg)',
                        border: '1px solid var(--color-auth-border)',
                        color: 'var(--color-dashboard-text)',
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-label text-sm" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                      Custom Questions
                    </label>
                    <textarea
                      value={config.customQuestions}
                      onChange={(e) => updateConfig('customQuestions', e.target.value)}
                      placeholder={"What song will get you on the dance floor?\nAny special requests for the bar?"}
                      rows={4}
                      className="w-full rounded-lg px-4 py-3 font-body text-sm outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--color-auth-input-bg)',
                        border: '1px solid var(--color-auth-border)',
                        color: 'var(--color-dashboard-text)',
                      }}
                    />
                    <p className="text-xs font-body" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                      One question per line
                    </p>
                  </div>

                  <div
                    className="rounded-lg p-4 space-y-4"
                    style={{
                      backgroundColor: 'var(--color-auth-input-bg)',
                      border: '1px solid var(--color-dashboard-border)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-label text-sm" style={{ color: 'var(--color-dashboard-text)' }}>
                          Allow Plus Ones
                        </p>
                        <p className="text-xs font-body" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                          Guests can bring an additional guest
                        </p>
                      </div>
                      <button
                        onClick={() => updateConfig('plusOneAllowed', !config.plusOneAllowed)}
                        className="relative w-11 h-6 rounded-full transition-colors"
                        style={{
                          backgroundColor: config.plusOneAllowed ? '#d4af37' : 'var(--color-dashboard-border)',
                        }}
                      >
                        <span
                          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm"
                          style={{ transform: config.plusOneAllowed ? 'translateX(20px)' : 'translateX(0)' }}
                        />
                      </button>
                    </div>

                    <div
                      className="w-full"
                      style={{ borderTop: '1px solid var(--color-dashboard-border)' }}
                    />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-label text-sm" style={{ color: 'var(--color-dashboard-text)' }}>
                          Dietary Requirements
                        </p>
                        <p className="text-xs font-body" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                          Collect dietary restrictions from guests
                        </p>
                      </div>
                      <button
                        onClick={() => updateConfig('dietaryField', !config.dietaryField)}
                        className="relative w-11 h-6 rounded-full transition-colors"
                        style={{
                          backgroundColor: config.dietaryField ? '#d4af37' : 'var(--color-dashboard-border)',
                        }}
                      >
                        <span
                          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm"
                          style={{ transform: config.dietaryField ? 'translateX(20px)' : 'translateX(0)' }}
                        />
                      </button>
                    </div>

                    <div
                      className="w-full"
                      style={{ borderTop: '1px solid var(--color-dashboard-border)' }}
                    />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-label text-sm" style={{ color: 'var(--color-dashboard-text)' }}>
                          Accommodation Info
                        </p>
                        <p className="text-xs font-body" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                          Ask guests about accommodation needs
                        </p>
                      </div>
                      <button
                        onClick={() => updateConfig('accommodationField', !config.accommodationField)}
                        className="relative w-11 h-6 rounded-full transition-colors"
                        style={{
                          backgroundColor: config.accommodationField ? '#d4af37' : 'var(--color-dashboard-border)',
                        }}
                      >
                        <span
                          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm"
                          style={{ transform: config.accommodationField ? 'translateX(20px)' : 'translateX(0)' }}
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
                      {saving ? 'Saving...' : 'Save Changes'}
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
                        Guest Preview
                      </h2>
                    </div>

                    <div
                      className="rounded-xl overflow-hidden"
                      style={{
                        border: '1px solid var(--color-dashboard-border)',
                        backgroundColor: 'var(--color-auth-input-bg)',
                      }}
                    >
                      <div
                        className="px-5 py-4 text-center"
                        style={{ backgroundColor: '#d4af37' }}
                      >
                        <Users className="w-7 h-7 mx-auto text-white mb-2" />
                        <h3 className="font-heading text-white text-base">
                          Wedding RSVP
                        </h3>
                      </div>

                      <div className="p-5 space-y-4">
                        {config.welcomeMessage ? (
                          <p
                            className="font-body text-sm text-center italic"
                            style={{ color: 'var(--color-dashboard-text-secondary)' }}
                          >
                            &ldquo;{config.welcomeMessage}&rdquo;
                          </p>
                        ) : (
                          <p
                            className="font-body text-sm text-center italic"
                            style={{ color: 'var(--color-dashboard-text-secondary)', opacity: 0.5 }}
                          >
                            &ldquo;We can&apos;t wait to celebrate with you!&rdquo;
                          </p>
                        )}

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="font-label text-xs" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                              Your Name
                            </label>
                            <div
                              className="rounded-lg px-3 py-2 text-sm font-body"
                              style={{
                                border: '1px solid var(--color-dashboard-border)',
                                backgroundColor: 'var(--color-dashboard-surface)',
                                color: 'var(--color-dashboard-text-secondary)',
                                opacity: 0.6,
                              }}
                            >
                              Enter your name
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="font-label text-xs" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                              Attending?
                            </label>
                            <div className="flex gap-2">
                              <span
                                className="px-3 py-1.5 rounded-lg text-xs font-label text-white"
                                style={{ backgroundColor: '#d4af37' }}
                              >
                                Yes
                              </span>
                              <span
                                className="px-3 py-1.5 rounded-lg text-xs font-label"
                                style={{
                                  border: '1px solid var(--color-dashboard-border)',
                                  color: 'var(--color-dashboard-text-secondary)',
                                }}
                              >
                                No
                              </span>
                            </div>
                          </div>

                          {config.plusOneAllowed && (
                            <div className="space-y-1">
                              <label className="font-label text-xs" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                                Plus One
                              </label>
                              <div
                                className="rounded-lg px-3 py-2 text-sm font-body"
                                style={{
                                  border: '1px solid var(--color-dashboard-border)',
                                  backgroundColor: 'var(--color-dashboard-surface)',
                                  color: 'var(--color-dashboard-text-secondary)',
                                  opacity: 0.6,
                                }}
                              >
                                Guest name
                              </div>
                            </div>
                          )}

                          {config.dietaryField && (
                            <div className="space-y-1">
                              <label className="font-label text-xs" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                                Dietary Requirements
                              </label>
                              <div
                                className="rounded-lg px-3 py-2 text-sm font-body"
                                style={{
                                  border: '1px solid var(--color-dashboard-border)',
                                  backgroundColor: 'var(--color-dashboard-surface)',
                                  color: 'var(--color-dashboard-text-secondary)',
                                  opacity: 0.6,
                                }}
                              >
                                Any allergies or restrictions
                              </div>
                            </div>
                          )}

                          {config.accommodationField && (
                            <div className="space-y-1">
                              <label className="font-label text-xs" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                                Accommodation
                              </label>
                              <div
                                className="rounded-lg px-3 py-2 text-sm font-body"
                                style={{
                                  border: '1px solid var(--color-dashboard-border)',
                                  backgroundColor: 'var(--color-dashboard-surface)',
                                  color: 'var(--color-dashboard-text-secondary)',
                                  opacity: 0.6,
                                }}
                              >
                                Do you need accommodation?
                              </div>
                            </div>
                          )}

                          {toggleQuestions.length > 0 && (
                            <div className="space-y-2">
                              {toggleQuestions.map((question, i) => (
                                <div key={i} className="space-y-1">
                                  <label className="font-label text-xs" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                                    {question}
                                  </label>
                                  <div
                                    className="rounded-lg px-3 py-2 text-sm font-body"
                                    style={{
                                      border: '1px solid var(--color-dashboard-border)',
                                      backgroundColor: 'var(--color-dashboard-surface)',
                                      color: 'var(--color-dashboard-text-secondary)',
                                      opacity: 0.6,
                                    }}
                                  >
                                    Your answer
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div
                            className="w-full rounded-lg py-2.5 text-center text-sm font-label text-white mt-2"
                            style={{ backgroundColor: '#d4af37' }}
                          >
                            Submit RSVP
                          </div>
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
