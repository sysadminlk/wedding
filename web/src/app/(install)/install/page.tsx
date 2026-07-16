'use client';

import { useState } from 'react';
import { Check, Database, UserPlus, Heart, PartyPopper, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Step1Data { dbHost: string; dbPort: string; dbName: string; dbUser: string; dbPassword: string; }
interface Step2Data { adminName: string; adminEmail: string; adminPassword: string; }
interface Step3Data { weddingName: string; partner1: string; partner2: string; weddingDate: string; }

const STEPS = [
  { label: 'Database', icon: <Database size={18} /> },
  { label: 'Admin User', icon: <UserPlus size={18} /> },
  { label: 'Wedding', icon: <Heart size={18} /> },
  { label: 'Complete', icon: <PartyPopper size={18} /> },
];

export default function InstallPage() {
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbOk, setDbOk] = useState(false);
  const [step1, setStep1] = useState<Step1Data>({ dbHost: 'localhost', dbPort: '5432', dbName: 'weddinghub', dbUser: 'postgres', dbPassword: '' });
  const [step2, setStep2] = useState<Step2Data>({ adminName: '', adminEmail: '', adminPassword: '' });
  const [step3, setStep3] = useState<Step3Data>({ weddingName: '', partner1: '', partner2: '', weddingDate: '' });

  const inputStyle = {
    borderColor: 'var(--color-dashboard-border)',
    backgroundColor: 'var(--color-dashboard-surface)',
    color: 'var(--color-dashboard-text)',
  };

  const updateStep1 = (field: keyof Step1Data, value: string) => setStep1((p) => ({ ...p, [field]: value }));
  const updateStep2 = (field: keyof Step2Data, value: string) => setStep2((p) => ({ ...p, [field]: value }));
  const updateStep3 = (field: keyof Step3Data, value: string) => setStep3((p) => ({ ...p, [field]: value }));

  const validateStep1 = () => {
    if (!step1.dbHost || !step1.dbPort || !step1.dbName || !step1.dbUser) return 'All database fields are required';
    return null;
  };

  const validateStep2 = () => {
    if (!step2.adminName || !step2.adminEmail || !step2.adminPassword) return 'All fields are required';
    if (step2.adminPassword.length < 8) return 'Password must be at least 8 characters';
    return null;
  };

  const validateStep3 = () => {
    if (!step3.weddingName || !step3.partner1 || !step3.partner2) return 'Wedding name and partner names are required';
    return null;
  };

  const handleTestDb = async () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/install/test-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(step1),
      });
      const data = await res.json();
      if (res.ok) {
        setDbOk(true);
        setError('');
      } else {
        setDbOk(false);
        setError(data.message ?? 'Database connection failed');
      }
    } catch {
      setDbOk(false);
      setError('Could not reach server');
    }
    setLoading(false);
  };

  const handleNext = async () => {
    setError('');
    if (step === 0) {
      if (!dbOk) { await handleTestDb(); return; }
      setStep(1);
    } else if (step === 1) {
      const err = validateStep2();
      if (err) { setError(err); return; }
      setLoading(true);
      try {
        const res = await fetch('/api/install/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(step2),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.message ?? 'Failed to create admin user');
          setLoading(false);
          return;
        }
        setStep(2);
      } catch {
        setError('Could not reach server');
      }
      setLoading(false);
    } else if (step === 2) {
      const err = validateStep3();
      if (err) { setError(err); return; }
      setLoading(true);
      try {
        const res = await fetch('/api/install/wedding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(step3),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.message ?? 'Failed to create wedding');
          setLoading(false);
          return;
        }
        setStep(3);
      } catch {
        setError('Could not reach server');
      }
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError('');
    if (step > 0 && step < 3) setStep(step - 1);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--color-auth-bg)' }}
    >
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-3xl mb-2" style={{ color: '#d4af37' }}>
            WeddingHub Installer
          </h1>
          <p className="font-body text-sm" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
            Set up your wedding planning platform
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-label font-bold text-xs transition-all duration-200"
                  style={{
                    backgroundColor: i <= step ? '#d4af37' : 'var(--color-dashboard-border)',
                    color: i <= step ? '#1c1b1b' : 'var(--color-dashboard-text-secondary)',
                  }}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span
                  className="font-label text-xs font-semibold hidden sm:inline"
                  style={{ color: i <= step ? '#d4af37' : 'var(--color-dashboard-text-secondary)' }}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    className="w-8 sm:w-16 h-0.5 mx-1"
                    style={{ backgroundColor: i < step ? '#d4af37' : 'var(--color-dashboard-border)' }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-dashboard-border)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%`, backgroundColor: '#d4af37' }}
            />
          </div>
        </div>

        {error && (
          <div
            className="flex items-center gap-2 p-4 rounded-xl text-sm font-body mb-6"
            style={{ backgroundColor: '#ffdad615', border: '1px solid #ffdad640', color: '#ba1a1a' }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <Card className="p-8">
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Database size={18} style={{ color: '#d4af37' }} />
                <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--color-dashboard-text)' }}>
                  Database Connection
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                    Host
                  </label>
                  <input type="text" value={step1.dbHost} onChange={(e) => updateStep1('dbHost', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border font-body text-sm" style={inputStyle} />
                </div>
                <div>
                  <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                    Port
                  </label>
                  <input type="text" value={step1.dbPort} onChange={(e) => updateStep1('dbPort', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border font-body text-sm" style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  Database Name
                </label>
                <input type="text" value={step1.dbName} onChange={(e) => updateStep1('dbName', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border font-body text-sm" style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                    Username
                  </label>
                  <input type="text" value={step1.dbUser} onChange={(e) => updateStep1('dbUser', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border font-body text-sm" style={inputStyle} />
                </div>
                <div>
                  <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                    Password
                  </label>
                  <input type="password" value={step1.dbPassword} onChange={(e) => updateStep1('dbPassword', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border font-body text-sm" style={inputStyle} />
                </div>
              </div>
              {dbOk && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-sm font-body" style={{ backgroundColor: '#16a34a15', color: '#16a34a', border: '1px solid #16a34a30' }}>
                  <Check size={16} />
                  Database connection successful
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus size={18} style={{ color: '#d4af37' }} />
                <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--color-dashboard-text)' }}>
                  Create Admin User
                </h2>
              </div>
              <div>
                <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  Full Name
                </label>
                <input type="text" value={step2.adminName} onChange={(e) => updateStep2('adminName', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border font-body text-sm" style={inputStyle} />
              </div>
              <div>
                <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  Email
                </label>
                <input type="email" value={step2.adminEmail} onChange={(e) => updateStep2('adminEmail', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border font-body text-sm" style={inputStyle} />
              </div>
              <div>
                <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  Password
                </label>
                <input type="password" value={step2.adminPassword} onChange={(e) => updateStep2('adminPassword', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border font-body text-sm" style={inputStyle} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Heart size={18} style={{ color: '#d4af37' }} />
                <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--color-dashboard-text)' }}>
                  Wedding Details
                </h2>
              </div>
              <div>
                <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  Wedding Name
                </label>
                <input type="text" value={step3.weddingName} onChange={(e) => updateStep3('weddingName', e.target.value)} placeholder="Smith & Johnson Wedding" className="w-full px-4 py-2.5 rounded-xl border font-body text-sm" style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                    Partner 1
                  </label>
                  <input type="text" value={step3.partner1} onChange={(e) => updateStep3('partner1', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border font-body text-sm" style={inputStyle} />
                </div>
                <div>
                  <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                    Partner 2
                  </label>
                  <input type="text" value={step3.partner2} onChange={(e) => updateStep3('partner2', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border font-body text-sm" style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block font-label text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                  Wedding Date
                </label>
                <input type="date" value={step3.weddingDate} onChange={(e) => updateStep3('weddingDate', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border font-body text-sm" style={inputStyle} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8 space-y-4">
              <div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                style={{ backgroundColor: '#16a34a20', color: '#16a34a' }}
              >
                <PartyPopper size={32} />
              </div>
              <h2 className="font-heading font-bold text-2xl" style={{ color: 'var(--color-dashboard-text)' }}>
                Installation Complete
              </h2>
              <p className="font-body text-sm" style={{ color: 'var(--color-dashboard-text-secondary)' }}>
                WeddingHub is ready. You can now log in with your admin credentials.
              </p>
              <div className="pt-4">
                <Button onClick={() => window.location.href = '/login'}>
                  Go to Login
                </Button>
              </div>
            </div>
          )}
        </Card>

        {step < 3 && (
          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={handleBack} disabled={step === 0}>
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <Button onClick={handleNext} loading={loading}>
              {step === 0 ? 'Test & Next' : step === 2 ? 'Complete Setup' : 'Next'}
              {step < 2 && <ArrowRight size={16} className="ml-2" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
