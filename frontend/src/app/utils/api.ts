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

// A production build may intentionally leave this empty when the API is
// reverse-proxied from the same origin. Invalid environment values are ignored
// instead of being passed to fetch(), which caused Safari's generic
// "The string did not match the expected pattern" error.
export const API_BASE_URL = normalizeBase(
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || ''
);

export function apiUrl(path: string) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE_URL) return new URL(cleanPath, `${API_BASE_URL}/`).toString();
  if (typeof window !== 'undefined') return new URL(cleanPath, window.location.origin).toString();
  return cleanPath;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const url = apiUrl(path);
  try {
    return await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
      credentials: 'include',
      cache: 'no-store',
    });
  } catch (error: any) {
    const message = String(error?.message || '');
    if (error?.name === 'TypeError' || /expected pattern|invalid url|failed to fetch/i.test(message)) {
      throw new Error('Portal backend is not reachable. Please configure the live API URL before using Login/Create ID.');
    }
    throw error;
  }
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
  window.dispatchEvent(new Event('portal_user_updated'));
}
