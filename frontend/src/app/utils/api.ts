'use client';

function normalizeBase(raw: string) {
  const value = String(raw || '').trim();
  if (!value) return '';
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return '';
  }
}

// Support both variable names used by earlier deployments. If the value is
// missing/invalid, fall back to same-origin /api instead of passing a malformed
// URL to fetch(), which caused Safari's "The string did not match the expected
// pattern" error on login and ID creation.
export const API_BASE_URL = normalizeBase(
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || ''
);

export function apiUrl(path: string) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
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
