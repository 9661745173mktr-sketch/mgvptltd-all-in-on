'use client';

export type PortalUser = {
  id: string; name: string; phone: string; email: string; password: string; role: string;
  walletBalance: number; accountStatus: 'Pending' | 'Active' | 'Rejected' | string;
  paymentStatus: 'Pending' | 'Verified' | 'Rejected' | string; creationFee?: number; utr?: string;
  createdAt: string; activatedAt?: string; approvedAt?: string; approvedBy?: string;
};

export const USERS_KEY = 'appUsers';
export const ID_REQUESTS_KEY = 'id_creation_requests_db';
export const NOTIFICATIONS_KEY = 'admin_notifications';

export function readUsers(): PortalUser[] {
  if (typeof window === 'undefined') return [];
  try { const v=JSON.parse(localStorage.getItem(USERS_KEY)||'[]'); return Array.isArray(v)?v:[]; } catch { return []; }
}
export function saveUsers(users: PortalUser[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  window.dispatchEvent(new Event('users_updated'));
}
export function findUser(identifier: string, password?: string): PortalUser | undefined {
  const key=String(identifier||'').trim().toLowerCase();
  return readUsers().find(u=>{
    const match=String(u.email||'').toLowerCase()===key || String(u.phone||'')===key || String(u.id||'').toLowerCase()===key;
    return match && (password===undefined || String(u.password)===String(password));
  });
}
export function setCurrentUser(user: PortalUser) {
  if (typeof window === 'undefined') return;
  ['currentUser','user','loggedInUser'].forEach(k=>localStorage.setItem(k,JSON.stringify(user)));
  localStorage.setItem('user_id',user.id); localStorage.setItem('retailer_id',user.id);
  localStorage.setItem('user_role_type',String(user.role||'retailer')); localStorage.setItem('retailer_logged_in','true');
  localStorage.setItem('isLoggedIn','true'); localStorage.setItem('retailerWalletBalance',String(Number(user.walletBalance)||0));
}
export function clearCurrentUser() { if(typeof window==='undefined')return; ['currentUser','user','loggedInUser','user_id','retailer_id','retailer_logged_in','isLoggedIn','user_role_type'].forEach(k=>localStorage.removeItem(k)); }
export function addAdminNotification(notification:any) {
  if(typeof window==='undefined')return;
  try { const old=JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY)||'[]'); const list=Array.isArray(old)?old:[];
    list.unshift({id:`NOTIF-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,read:false,createdAt:new Date().toISOString(),...notification});
    localStorage.setItem(NOTIFICATIONS_KEY,JSON.stringify(list.slice(0,200))); window.dispatchEvent(new Event('admin_notification_updated'));
  } catch {}
}
