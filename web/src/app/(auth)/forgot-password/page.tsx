'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotForm>();

  useEffect(() => {
    if (sentEmail) {
      router.push(`/reset-password?email=${encodeURIComponent(sentEmail)}`);
    }
  }, [sentEmail, router]);

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
      setSentEmail(data.email);
    } catch {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading mb-2" style={{ color: 'var(--color-auth-text)' }}>
        Forgot your password?
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-auth-text-secondary)' }}>
        Enter your email and we&apos;ll send you a reset code
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
          Send Reset Code
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
