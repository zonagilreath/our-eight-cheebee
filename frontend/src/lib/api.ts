import type { ProductSearchResult, Cart, SessionStatus } from '../types';

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  searchProducts: (query: string, limit = 20) =>
    request<ProductSearchResult>(`/search?q=${encodeURIComponent(query)}&limit=${limit}`),

  getCart: () => request<Cart>('/cart'),

  syncToCart: () => request<{ success: boolean; added: number; errors: string[] }>('/cart/sync', { method: 'POST' }),

  getSessionStatus: () => request<SessionStatus>('/session/status'),

  refreshSession: () => request<{ success: boolean }>('/session/refresh', { method: 'POST' }),
};
