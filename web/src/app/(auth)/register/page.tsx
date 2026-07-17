'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import GoogleSignIn from '@/components/auth/GoogleSignIn';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<RegisterForm>();
  const email = watch('email');

  useEffect(() => {
    if (registeredEmail) {
      router.push(`/verify-email?email=${encodeURIComponent(registeredEmail)}`);
    }
  }, [registeredEmail, router]);

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
      setRegisteredEmail(data.email);
    } catch {
      setError('Network error. Please try again.');
    }
  };

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

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: 'var(--color-auth-border)' }} />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 font-body" style={{ backgroundColor: 'var(--color-auth-surface)', color: 'var(--color-auth-text-secondary)' }}>
            or sign up with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <GoogleSignIn text="signup_with" className="w-full" />
        <Button variant="secondary" type="button" className="w-full text-xs" disabled>
          Apple (coming soon)
        </Button>
      </div>

      <p className="mt-6 text-center text-sm font-body" style={{ color: 'var(--color-auth-text-secondary)' }}>
        Already have an account?{' '}
        <a href="/login" className="font-medium" style={{ color: 'var(--color-auth-accent)' }}>
          Sign in
        </a>
      </p>
    </div>
  );
}
