'use client';

import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type PasswordForm = z.infer<typeof passwordSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [codeVerified, setCodeVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PasswordForm>();

  const codeStr = code.join('');

  const handleCodeChange = useCallback((index: number, value: string) => {
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

  const handleVerifyCode = useCallback(() => {
    setError('');
    if (codeStr.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    setCodeVerified(true);
  }, [codeStr]);

  const handleResend = useCallback(async () => {
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
  }, [email]);

  useEffect(() => {
    if (resendTimer > 0 && !codeVerified) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer, codeVerified]);

  const onSubmitPassword = useCallback(async (data: PasswordForm) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: codeStr, newPassword: data.password }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.message || 'Reset failed');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, codeStr]);

  if (!email) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold font-heading mb-2" style={{ color: 'var(--color-auth-text)' }}>
          Invalid Request
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-auth-text-secondary)' }}>
          Please start the password reset process from the beginning.
        </p>
        <a href="/forgot-password" className="inline-block">
          <Button variant="secondary">Reset Password</Button>
        </a>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'rgba(196, 168, 130, 0.1)' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-auth-accent)" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold font-heading mb-2" style={{ color: 'var(--color-auth-text)' }}>
          Password Reset
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-auth-text-secondary)' }}>
          Your password has been successfully reset.
        </p>
        <a href="/login" className="inline-block">
          <Button>Go to Login</Button>
        </a>
      </div>
    );
  }

  if (!codeVerified) {
    return (
      <div>
        <h1 className="text-2xl font-bold font-heading mb-2" style={{ color: 'var(--color-auth-text)' }}>
          Enter reset code
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-auth-text-secondary)' }}>
          Enter the 6-digit code sent to <strong>{email}</strong>
        </p>

        <div className="space-y-6">
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
                onChange={(e) => handleCodeChange(i, e.target.value)}
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

          <Button onClick={handleVerifyCode} className="w-full">
            Verify Code
          </Button>
        </div>

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

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading mb-2" style={{ color: 'var(--color-auth-text)' }}>
        Set new password
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-auth-text-secondary)' }}>
        Choose a strong password for your account
      </p>

      <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
            {error}
          </div>
        )}
        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', { required: 'Please confirm your password' })}
        />
        <Button type="submit" loading={loading || isSubmitting} className="w-full">
          Reset Password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-8" style={{ color: 'var(--color-auth-text-secondary)' }}>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
