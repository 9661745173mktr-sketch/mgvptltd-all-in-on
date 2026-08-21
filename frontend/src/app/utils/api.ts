'use client';

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  return fetch(apiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
}

export function getAdminToken() {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem('admin_token') || '';
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('portal_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: any) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('portal_user', JSON.stringify(user));
}
