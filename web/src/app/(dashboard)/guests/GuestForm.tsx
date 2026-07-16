'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Guest } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  side: z.enum(['bride', 'groom', 'mutual']),
  dietaryRestrictions: z.string().optional().or(z.literal('')),
  plusOne: z.boolean(),
  partySize: z.number().min(1),
});

type GuestFormType = z.infer<typeof schema>;

interface GuestFormProps {
  guest: Guest | null;
  onClose: () => void;
  onSaved: () => void;
}

export function GuestForm({ guest, onClose, onSaved }: GuestFormProps) {
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<GuestFormType>({
    defaultValues: guest ? {
      name: guest.name,
      email: guest.email || '',
      phone: guest.phone || '',
      side: guest.side,
      dietaryRestrictions: guest.dietaryRestrictions || '',
      plusOne: guest.plusOne,
      partySize: guest.partySize,
    } : { side: 'mutual', plusOne: false, partySize: 1 },
  });

  const onSubmit = async (data: GuestFormType) => {
    setError('');
    try {
      const url = guest ? `/api/guests/${guest.id}` : '/api/guests';
      const method = guest ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const result = await res.json();
        setError(result.message || 'Failed to save guest');
        return;
      }
      onSaved();
    } catch {
      setError('Network error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="w-full max-w-lg rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card-bg)' }}
      >
        <h2 className="text-xl font-heading font-bold mb-4" style={{ color: 'var(--color-dashboard-text)' }}>
          {guest ? 'Edit Guest' : 'Add Guest'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
              {error}
            </div>
          )}

          <Input label="Name" placeholder="Full name" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
          <Input label="Email" type="email" placeholder="email@example.com" error={errors.email?.message} {...register('email')} />
          <Input label="Phone" placeholder="+94 77 123 4567" error={errors.phone?.message} {...register('phone')} />

          <div className="space-y-1">
            <label className="block text-sm font-medium" style={{ color: 'var(--input-label)' }}>Side</label>
            <select
              {...register('side')}
              className="w-full px-4 py-2.5 rounded-lg border"
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--color-dashboard-text)' }}
            >
              <option value="bride">Bride</option>
              <option value="groom">Groom</option>
              <option value="mutual">Mutual</option>
            </select>
          </div>

          <Input label="Dietary Restrictions" placeholder="Vegetarian, gluten-free..." {...register('dietaryRestrictions')} />

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-dashboard-text)' }}>
              <input type="checkbox" {...register('plusOne')} className="rounded" />
              Plus One
            </label>
          </div>

          <Input label="Party Size" type="number" min={1} {...register('partySize', { valueAsNumber: true, min: { value: 1, message: 'Min 1' } })} error={errors.partySize?.message} />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{guest ? 'Update' : 'Add'} Guest</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
