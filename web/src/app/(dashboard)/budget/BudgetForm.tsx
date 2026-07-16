'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BudgetItem } from '@/types';

const categories = [
  'Venue', 'Catering', 'Photography', 'Videography', 'Flowers', 'Music & DJ',
  'Attire', 'Hair & Makeup', 'Transportation', 'Decorations', 'Cake', 'Stationery',
  'Favors', 'Lighting', 'Rentals', 'Other',
];

const schema = z.object({
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional().or(z.literal('')),
  estimatedCost: z.number().min(0),
  actualCost: z.number().min(0),
  vendor: z.string().optional().or(z.literal('')),
  paid: z.boolean(),
  notes: z.string().optional().or(z.literal('')),
});

type BudgetFormType = z.infer<typeof schema>;

interface BudgetFormProps {
  item: BudgetItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export function BudgetForm({ item, onClose, onSaved }: BudgetFormProps) {
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<BudgetFormType>({
    defaultValues: item ? {
      category: item.category,
      description: item.description || '',
      estimatedCost: item.estimatedCost,
      actualCost: item.actualCost,
      vendor: item.vendor || '',
      paid: item.paid,
      notes: item.notes || '',
    } : { estimatedCost: 0, actualCost: 0, paid: false },
  });

  const onSubmit = async (data: BudgetFormType) => {
    setError('');
    try {
      const url = item ? `/api/budget/${item.id}` : '/api/budget';
      const method = item ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const result = await res.json();
        setError(result.message || 'Failed to save budget item');
        return;
      }
      onSaved();
    } catch {
      setError('Network error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--card-bg)' }}>
        <h2 className="text-xl font-heading font-bold mb-4" style={{ color: 'var(--color-dashboard-text)' }}>
          {item ? 'Edit Budget Item' : 'Add Budget Item'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>{error}</div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium" style={{ color: 'var(--input-label)' }}>Category</label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full px-4 py-2.5 rounded-lg border"
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--color-dashboard-text)' }}
            >
              <option value="">Select category</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-sm" style={{ color: 'var(--input-error)' }}>{errors.category.message}</p>}
          </div>

          <Input label="Description" placeholder="Optional description" {...register('description')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Estimated Cost" type="number" min={0} step={0.01} {...register('estimatedCost', { valueAsNumber: true })} />
            <Input label="Actual Cost" type="number" min={0} step={0.01} {...register('actualCost', { valueAsNumber: true })} />
          </div>
          <Input label="Vendor" placeholder="Vendor name" {...register('vendor')} />

          <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-dashboard-text)' }}>
            <input type="checkbox" {...register('paid')} className="rounded" />
            Mark as paid
          </label>

          <Input label="Notes" placeholder="Additional notes" {...register('notes')} />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{item ? 'Update' : 'Add'} Item</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
