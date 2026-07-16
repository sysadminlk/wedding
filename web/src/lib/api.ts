import { PaginatedResponse, Guest, ChecklistItem, BudgetItem, Tenant, DashboardData } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    super(`API Error ${status}`);
    this.status = status;
    this.data = data;
  }
}

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const guests = {
  list: (tenantId: string, page = 0, size = 20, search = '') =>
    api<PaginatedResponse<Guest>>(`/api/guests?page=${page}&size=${size}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  get: (id: string) => api<Guest>(`/api/guests/${id}`),
  create: (data: Partial<Guest>) =>
    api<Guest>('/api/guests', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Guest>) =>
    api<Guest>(`/api/guests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    api<void>(`/api/guests/${id}`, { method: 'DELETE' }),
};

export const checklist = {
  list: (tenantId: string, page = 0, size = 20) =>
    api<PaginatedResponse<ChecklistItem>>(`/api/checklist?page=${page}&size=${size}`),
  get: (id: string) => api<ChecklistItem>(`/api/checklist/${id}`),
  create: (data: Partial<ChecklistItem>) =>
    api<ChecklistItem>('/api/checklist', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ChecklistItem>) =>
    api<ChecklistItem>(`/api/checklist/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    api<void>(`/api/checklist/${id}`, { method: 'DELETE' }),
  complete: (id: string) =>
    api<ChecklistItem>(`/api/checklist/${id}/complete`, { method: 'PUT' }),
  uncomplete: (id: string) =>
    api<ChecklistItem>(`/api/checklist/${id}/uncomplete`, { method: 'PUT' }),
};

export const budget = {
  list: (tenantId: string, page = 0, size = 20) =>
    api<PaginatedResponse<BudgetItem>>(`/api/budget?page=${page}&size=${size}`),
  get: (id: string) => api<BudgetItem>(`/api/budget/${id}`),
  summary: () => api<{ totalEstimated: number; totalActual: number; totalPaid: number }>('/api/budget/summary'),
  create: (data: Partial<BudgetItem>) =>
    api<BudgetItem>('/api/budget', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<BudgetItem>) =>
    api<BudgetItem>(`/api/budget/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    api<void>(`/api/budget/${id}`, { method: 'DELETE' }),
};

export const dashboard = {
  get: () => api<DashboardData>('/api/dashboard'),
};

export const tenants = {
  list: () => api<Tenant[]>('/api/tenants'),
  get: (id: string) => api<Tenant>(`/api/tenants/${id}`),
  create: (data: { name: string }) =>
    api<Tenant>('/api/tenants', { method: 'POST', body: JSON.stringify(data) }),
};

export default api;
