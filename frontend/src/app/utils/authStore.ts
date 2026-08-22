'use client';

export type PortalUser = {
  id: string;
  name: string;
  role: string;
  mobile: string;
  email?: string;
  username?: string;
  password?: string;
  walletBalance?: number;
  balance?: number;
  status?: string;
  parentId?: string;
  createdAt?: string;
};

const USERS_KEY = 'appUsers';
const NOTIFICATIONS_KEY = 'admin_notifications';

export function readUsers(): PortalUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: PortalUser[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  window.dispatchEvent(new Event('users_updated'));
}

export function addAdminNotification(notification: any) {
  if (typeof window === 'undefined') return;
  try {
    const all = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    all.unshift({
      id: `AN-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...notification,
      createdAt: new Date().toISOString(),
      read: false,
    });
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event('admin_notifications_updated'));
  } catch {}
}
