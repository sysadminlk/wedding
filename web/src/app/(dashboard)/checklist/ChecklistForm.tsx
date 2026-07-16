'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChecklistItem } from '@/types';

const phases = [
  '12-9 Months', '9-6 Months', '6-3 Months', '3-1 Months', '1 Week', 'Day Of',
];

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().or(z.literal('')),
  phase: z.string().min(1, 'Phase is required'),
  dueDate: z.string().optional().or(z.literal('')),
  assignedTo: z.string().optional().or(z.literal('')),
});

type ChecklistFormType = z.infer<typeof schema>;

interface ChecklistFormProps {
  item: ChecklistItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ChecklistForm({ item, onClose, onSaved }: ChecklistFormProps) {
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ChecklistFormType>({
    defaultValues: item ? {
      title: item.title,
      description: item.description || '',
      phase: item.phase,
      dueDate: item.dueDate || '',
      assignedTo: item.assignedTo || '',
    } : { phase: phases[0] },
  });

  const onSubmit = async (data: ChecklistFormType) => {
    setError('');
    try {
      const url = item ? `/api/checklist/${item.id}` : '/api/checklist';
      const method = item ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...data, completed: item?.completed || false }),
      });
      if (!res.ok) {
        const result = await res.json();
        setError(result.message || 'Failed to save task');
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
          {item ? 'Edit Task' : 'Add Task'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>{error}</div>
          )}

          <Input label="Title" placeholder="Task title" error={errors.title?.message} {...register('title', { required: 'Title is required' })} />
          <Input label="Description" placeholder="Optional description" {...register('description')} />

          <div className="space-y-1">
            <label className="block text-sm font-medium" style={{ color: 'var(--input-label)' }}>Phase</label>
            <select
              {...register('phase', { required: 'Phase is required' })}
              className="w-full px-4 py-2.5 rounded-lg border"
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--color-dashboard-text)' }}
            >
              {phases.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.phase && <p className="text-sm" style={{ color: 'var(--input-error)' }}>{errors.phase.message}</p>}
          </div>

          <Input label="Due Date" type="date" {...register('dueDate')} />
          <Input label="Assigned To" placeholder="Person responsible" {...register('assignedTo')} />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{item ? 'Update' : 'Add'} Task</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
