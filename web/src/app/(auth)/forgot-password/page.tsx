'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotForm>();

  const onSubmit = async (data: ForgotForm) => {
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.message || 'Request failed');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Network error. Please try again.');
    }
  };

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
          Check your email
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-auth-text-secondary)' }}>
          If an account exists with that email, you&apos;ll receive a password reset link shortly.
        </p>
        <a href="/login" className="inline-block">
          <Button variant="secondary">Back to Login</Button>
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading mb-2" style={{ color: 'var(--color-auth-text)' }}>
        Forgot your password?
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-auth-text-secondary)' }}>
        Enter your email and we&apos;ll send you a reset link
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
            {error}
          </div>
        )}
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Send Reset Link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-auth-text-secondary)' }}>
        Remember your password?{' '}
        <a href="/login" className="font-medium" style={{ color: 'var(--color-auth-accent)' }}>
          Login
        </a>
      </p>
    </div>
  );
}
