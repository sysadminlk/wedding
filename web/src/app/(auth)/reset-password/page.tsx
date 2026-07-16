'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetForm = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetForm>();

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold font-heading mb-2" style={{ color: 'var(--color-auth-text)' }}>
          Invalid Link
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-auth-text-secondary)' }}>
          This password reset link is invalid or has expired.
        </p>
        <a href="/forgot-password" className="inline-block">
          <Button variant="secondary">Request New Link</Button>
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

  const onSubmit = async (data: ResetForm) => {
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.message || 'Reset failed');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading mb-2" style={{ color: 'var(--color-auth-text)' }}>
        Set new password
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-auth-text-secondary)' }}>
        Choose a strong password for your account
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <Button type="submit" loading={isSubmitting} className="w-full">
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
