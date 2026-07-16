'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, Check, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type EmailProvider = 'resend' | 'smtp';

interface EmailConfig {
  provider: EmailProvider;
  resendApiKey: string;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  adminEmail: string;
}

export default function EmailPage() {
  const [config, setConfig] = useState<EmailConfig>({
    provider: 'resend',
    resendApiKey: '',
    smtpHost: '',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    adminEmail: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/admin/email', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const cfg = data.data ?? data;
          setConfig((prev) => ({ ...prev, ...cfg }));
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
      await fetch('/api/admin/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config),
      });
      const data = await res.json();
      setTestResult({ ok: res.ok, message: data.message ?? (res.ok ? 'Test email sent successfully' : 'Failed to send test email') });
    } catch {
      setTestResult({ ok: false, message: 'Connection error' });
    }
    setTesting(false);
  };

  const update = (field: keyof EmailConfig, value: string) => setConfig((prev) => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-3"
            style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }}
          />
          <p className="text-sm font-label" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            Loading email config...
          </p>
        </div>
      </div>
    );
  }

  const inputStyle = {
    borderColor: 'var(--color-dashboard-border)',
    backgroundColor: 'var(--color-dashboard-surface)',
    color: 'var(--color-dashboard-text)',
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Email Configuration" description="Configure email delivery provider" />

      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Mail size={18} style={{ color: '#d4af37' }} />
          <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--color-dashboard-text)' }}>
            Provider
          </h2>
        </div>

        <div className="flex gap-3">
          {(['resend', 'smtp'] as EmailProvider[]).map((p) => (
            <button
              key={p}
              onClick={() => update('provider', p)}
              className="px-5 py-2.5 rounded-xl border font-label font-semibold text-sm transition-all duration-200"
              style={{
                borderColor: config.provider === p ? '#d4af37' : 'var(--color-dashboard-border)',
                backgroundColor: config.provider === p ? '#d4af3720' : 'var(--color-dashboard-surface)',
                color: config.provider === p ? '#d4af37' : 'var(--color-dashboard-text)',
              }}
            >
              {p === 'resend' ? 'Resend' : 'SMTP'}
            </button>
          ))}
        </div>

        {config.provider === 'resend' && (
          <div>
            <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              API Key
            </label>
            <input
              type="password"
              value={config.resendApiKey}
              onChange={(e) => update('resendApiKey', e.target.value)}
              placeholder="re_..."
              className="w-full px-4 py-2.5 rounded-xl border font-body text-sm"
              style={inputStyle}
            />
          </div>
        )}

        {config.provider === 'smtp' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                Host
              </label>
              <input
                type="text"
                value={config.smtpHost}
                onChange={(e) => update('smtpHost', e.target.value)}
                placeholder="smtp.example.com"
                className="w-full px-4 py-2.5 rounded-xl border font-body text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                Port
              </label>
              <input
                type="text"
                value={config.smtpPort}
                onChange={(e) => update('smtpPort', e.target.value)}
                placeholder="587"
                className="w-full px-4 py-2.5 rounded-xl border font-body text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                Username
              </label>
              <input
                type="text"
                value={config.smtpUsername}
                onChange={(e) => update('smtpUsername', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border font-body text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                Password
              </label>
              <input
                type="password"
                value={config.smtpPassword}
                onChange={(e) => update('smtpPassword', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border font-body text-sm"
                style={inputStyle}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            Admin Email (for test)
          </label>
          <input
            type="email"
            value={config.adminEmail}
            onChange={(e) => update('adminEmail', e.target.value)}
            placeholder="admin@example.com"
            className="w-full px-4 py-2.5 rounded-xl border font-body text-sm"
            style={inputStyle}
          />
        </div>

        {testResult && (
          <div
            className="flex items-center gap-2 p-3 rounded-xl text-sm font-body"
            style={{
              backgroundColor: testResult.ok ? '#16a34a15' : '#ba1a1a15',
              color: testResult.ok ? '#16a34a' : '#ba1a1a',
              border: `1px solid ${testResult.ok ? '#16a34a30' : '#ba1a1a30'}`,
            }}
          >
            {testResult.ok ? <Check size={16} /> : <AlertCircle size={16} />}
            {testResult.message}
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={handleSave} loading={saving}>
            {saved ? <><Check size={16} className="mr-2" /> Saved</> : 'Save'}
          </Button>
          <Button onClick={handleTest} variant="secondary" loading={testing}>
            <Send size={16} className="mr-2" />
            Send Test Email
          </Button>
        </div>
      </Card>
    </div>
  );
}
