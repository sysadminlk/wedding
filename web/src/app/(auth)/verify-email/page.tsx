'use client';

import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = useCallback((index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [code]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [code]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
    setCode(newCode);
    if (pasted.length > 0) {
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const codeStr = code.join('');
    if (codeStr.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeStr }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Verification failed');
        return;
      }
      router.push('/login');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setResendTimer(60);
    } catch {
      // Silent fail
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading mb-2" style={{ color: 'var(--color-auth-text)' }}>
        Verify your email
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-auth-text-secondary)' }}>
        Enter the 6-digit code sent to <strong>{email || 'your email'}</strong>
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
            {error}
          </div>
        )}

        <div className="flex justify-center gap-2">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className="w-12 h-14 text-center text-xl font-bold rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)]"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--color-dashboard-text)',
              }}
            />
          ))}
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Verify Email
        </Button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm" style={{ color: 'var(--color-auth-text-secondary)' }}>
          Didn&apos;t receive the code?{' '}
          {resendTimer > 0 ? (
            <span className="text-sm">Resend in {resendTimer}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="font-medium"
              style={{ color: 'var(--color-auth-accent)' }}
            >
              Resend code
            </button>
          )}
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center py-8" style={{ color: 'var(--color-auth-text-secondary)' }}>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
