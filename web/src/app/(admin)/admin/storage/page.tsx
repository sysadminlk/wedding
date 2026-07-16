'use client';

import { useState, useEffect } from 'react';
import { HardDrive, Check, AlertCircle, Wifi } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type StorageProvider = 's3' | 'minio';

interface StorageConfig {
  provider: StorageProvider;
  endpoint: string;
  bucket: string;
  region: string;
  accessKey: string;
  secretKey: string;
}

export default function StoragePage() {
  const [config, setConfig] = useState<StorageConfig>({
    provider: 'minio',
    endpoint: '',
    bucket: '',
    region: 'us-east-1',
    accessKey: '',
    secretKey: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/admin/storage', { credentials: 'include' });
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
      await fetch('/api/admin/storage', {
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
      const res = await fetch('/api/admin/storage/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config),
      });
      const data = await res.json();
      setTestResult({ ok: res.ok, message: data.message ?? (res.ok ? 'Connection successful' : 'Connection failed') });
    } catch {
      setTestResult({ ok: false, message: 'Connection error' });
    }
    setTesting(false);
  };

  const update = (field: keyof StorageConfig, value: string) => setConfig((prev) => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-3"
            style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }}
          />
          <p className="text-sm font-label" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            Loading storage config...
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
      <PageHeader title="Storage Configuration" description="Configure file storage provider" />

      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <HardDrive size={18} style={{ color: '#d4af37' }} />
          <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--color-dashboard-text)' }}>
            Provider
          </h2>
        </div>

        <div className="flex gap-3">
          {(['s3', 'minio'] as StorageProvider[]).map((p) => (
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
              {p === 's3' ? 'AWS S3' : 'MinIO'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              Endpoint
            </label>
            <input
              type="text"
              value={config.endpoint}
              onChange={(e) => update('endpoint', e.target.value)}
              placeholder={config.provider === 'minio' ? 'http://localhost:9000' : 's3.amazonaws.com'}
              className="w-full px-4 py-2.5 rounded-xl border font-body text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              Bucket
            </label>
            <input
              type="text"
              value={config.bucket}
              onChange={(e) => update('bucket', e.target.value)}
              placeholder="wedding-uploads"
              className="w-full px-4 py-2.5 rounded-xl border font-body text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              Region
            </label>
            <input
              type="text"
              value={config.region}
              onChange={(e) => update('region', e.target.value)}
              placeholder="us-east-1"
              className="w-full px-4 py-2.5 rounded-xl border font-body text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              Access Key
            </label>
            <input
              type="password"
              value={config.accessKey}
              onChange={(e) => update('accessKey', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border font-body text-sm"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
              Secret Key
            </label>
            <input
              type="password"
              value={config.secretKey}
              onChange={(e) => update('secretKey', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border font-body text-sm"
              style={inputStyle}
            />
          </div>
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
            <Wifi size={16} className="mr-2" />
            Test Connection
          </Button>
        </div>
      </Card>
    </div>
  );
}
