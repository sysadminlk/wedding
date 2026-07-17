'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import GoogleSignIn from '@/components/auth/GoogleSignIn';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.message || 'Login failed');
        return;
      }
      router.push('/');
    } catch {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-1" style={{ color: 'var(--color-auth-text)' }}>
        Welcome back
      </h1>
      <p className="text-sm mb-6 font-body" style={{ color: 'var(--color-auth-text-secondary)' }}>
        Sign in to your WeddingHub account
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg text-sm font-body" style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>
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
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', { required: 'Password is required' })}
        />
        <div className="flex items-center justify-end">
          <a href="/forgot-password" className="text-sm font-medium font-body" style={{ color: 'var(--color-auth-accent)' }}>
            Forgot password?
          </a>
        </div>
        <Button type="submit" loading={isSubmitting} className="w-full font-label uppercase tracking-wider text-xs">
          Sign In
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: 'var(--color-auth-border)' }} />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 font-body" style={{ backgroundColor: 'var(--color-auth-surface)', color: 'var(--color-auth-text-secondary)' }}>
            or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <GoogleSignIn text="continue_with" className="w-full" />
        <Button variant="secondary" type="button" className="w-full text-xs" disabled>
          Apple (coming soon)
        </Button>
      </div>

      <p className="mt-6 text-center text-sm font-body" style={{ color: 'var(--color-auth-text-secondary)' }}>
        Don&apos;t have an account?{' '}
        <a href="/register" className="font-medium" style={{ color: 'var(--color-auth-accent)' }}>
          Create one
        </a>
      </p>
    </div>
  );
}
