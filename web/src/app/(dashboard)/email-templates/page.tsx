'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, Eye, Save, FileText, Send, Edit } from 'lucide-react';
import { EmailTemplate } from '@/types';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

const TEMPLATE_TYPES = [
  { value: 'save-the-date', label: 'Save the Date', icon: Send },
  { value: 'wedding-invitation', label: 'Wedding Invitation', icon: Mail },
  { value: 'rsvp-confirmation', label: 'RSVP Confirmation', icon: FileText },
  { value: 'thank-you', label: 'Thank You', icon: Mail },
  { value: 'follow-up', label: 'Follow Up', icon: Send },
] as const;

type TemplateType = (typeof TEMPLATE_TYPES)[number]['value'];

interface PreviewPanelProps {
  subject: string;
  body: string;
}

function PreviewPanel({ subject, body }: PreviewPanelProps) {
  return (
    <Card className="p-6" style={{ backgroundColor: 'var(--color-dashboard-surface)' }}>
      <div className="flex items-center gap-2 mb-4" style={{ borderBottom: '1px solid var(--color-dashboard-border)', paddingBottom: '12px' }}>
        <Eye size={18} style={{ color: '#d4af37' }} />
        <span className="font-label text-sm" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
          Preview
        </span>
      </div>
      <div
        className="rounded-lg p-6"
        style={{
          backgroundColor: 'var(--color-auth-input-bg)',
          border: '1px solid var(--color-auth-border)',
        }}
      >
        <div className="mb-4">
          <span className="font-label text-xs uppercase tracking-wider" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            Subject
          </span>
          <p className="font-heading text-lg mt-1" style={{ color: 'var(--color-dashboard-text)' }}>
            {subject || 'No subject'}
          </p>
        </div>
        <div style={{ borderTop: '1px solid var(--color-dashboard-border)', paddingTop: '12px' }}>
          <span className="font-label text-xs uppercase tracking-wider" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            Body
          </span>
          <div className="font-body text-sm mt-2 whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--color-dashboard-text)' }}>
            {body || 'No content'}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function EmailTemplatesPage() {
  const [selectedType, setSelectedType] = useState<TemplateType>('save-the-date');
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetchTemplate = useCallback(async (type: TemplateType) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/email-templates/${type}`);
      if (res.ok) {
        const data: EmailTemplate = await res.json();
        setTemplate(data);
        setSubject(data.subject);
        setBody(data.body);
      } else {
        setTemplate(null);
        setSubject('');
        setBody('');
      }
    } catch {
      setTemplate(null);
      setSubject('');
      setBody('');
    } finally {
      setLoading(false);
      setDirty(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplate(selectedType);
  }, [selectedType, fetchTemplate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/email-templates/${selectedType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      });
      if (res.ok) {
        const data: EmailTemplate = await res.json();
        setTemplate(data);
        setDirty(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubjectChange = (value: string) => {
    setSubject(value);
    setDirty(true);
  };

  const handleBodyChange = (value: string) => {
    setBody(value);
    setDirty(true);
  };

  const selectedInfo = TEMPLATE_TYPES.find((t) => t.value === selectedType);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-dashboard-surface)' }}>
      <PageHeader
        title="Email Templates"
        description="Create and customize your wedding email communications"
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-4" style={{ backgroundColor: 'var(--color-dashboard-surface)', border: '1px solid var(--color-dashboard-border)' }}>
            <h3 className="font-heading text-sm font-semibold mb-3" style={{ color: 'var(--color-dashboard-text)' }}>
              Template Type
            </h3>
            <div className="flex flex-col gap-1">
              {TEMPLATE_TYPES.map((type) => {
                const Icon = type.icon;
                const isActive = selectedType === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => {
                      if (dirty && !window.confirm('You have unsaved changes. Discard them?')) return;
                      setSelectedType(type.value);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors"
                    style={{
                      backgroundColor: isActive ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                      border: isActive ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent',
                      color: isActive ? '#d4af37' : 'var(--color-dashboard-text-secondary)',
                    }}
                  >
                    <Icon size={16} />
                    <span className="font-label text-sm">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="p-6" style={{ backgroundColor: 'var(--color-dashboard-surface)', border: '1px solid var(--color-dashboard-border)' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {selectedInfo && <selectedInfo.icon size={20} style={{ color: '#d4af37' }} />}
                <h2 className="font-heading text-lg font-semibold" style={{ color: 'var(--color-dashboard-text)' }}>
                  {selectedInfo?.label}
                </h2>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving || !dirty}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Template'}
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8" style={{ borderTop: '2px solid #d4af37', borderRight: '2px solid transparent' }} />
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div>
                  <label className="font-label text-xs uppercase tracking-wider mb-2 block" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                    Subject Line
                  </label>
                  <div className="flex items-center gap-2">
                    <Edit size={14} style={{ color: 'var(--color-dashboard-text-secondary)' }} />
                    <Input
                      value={subject}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      placeholder="Enter email subject line..."
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-label text-xs uppercase tracking-wider mb-2 block" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                    Email Body
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => handleBodyChange(e.target.value)}
                    placeholder="Write your email content here..."
                    rows={14}
                    className="w-full rounded-lg px-4 py-3 font-body text-sm leading-relaxed resize-y focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-auth-input-bg)',
                      border: '1px solid var(--color-auth-border)',
                      color: 'var(--color-dashboard-text)',
                    }}
                  />
                </div>
              </div>
            )}
          </Card>

          <PreviewPanel subject={subject} body={body} />
        </div>
      </div>
    </div>
  );
}
