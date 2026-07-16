'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<RegisterForm>();
  const email = watch('email');

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.message || 'Registration failed');
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
          style={{ background: 'linear-gradient(135deg, #d4af37, #f1d38e)' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h1 className="text-2xl font-heading font-bold mb-2" style={{ color: 'var(--color-auth-text)' }}>
          Check your email
        </h1>
        <p className="text-sm mb-6 font-body" style={{ color: 'var(--color-auth-text-secondary)' }}>
          We&apos;ve sent a verification code to <strong>{email}</strong>. Please check your inbox.
        </p>
        <a href="/login" className="inline-block">
          <Button variant="secondary">Go to Login</Button>
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-1" style={{ color: 'var(--color-auth-text)' }}>
        Create your account
      </h1>
      <p className="text-sm mb-6 font-body" style={{ color: 'var(--color-auth-text-secondary)' }}>
        Start planning your perfect wedding
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg text-sm font-body" style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>
            {error}
          </div>
        )}
        <Input
          label="Full Name"
          placeholder="Sarah & James"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })}
        />
        <Button type="submit" loading={isSubmitting} className="w-full font-label uppercase tracking-wider text-xs">
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm font-body" style={{ color: 'var(--color-auth-text-secondary)' }}>
        Already have an account?{' '}
        <a href="/login" className="font-medium" style={{ color: 'var(--color-auth-accent)' }}>
          Sign in
        </a>
      </p>
    </div>
  );
}
