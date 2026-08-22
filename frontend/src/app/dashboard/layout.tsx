'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function validate() {
      try {
        const raw = localStorage.getItem('currentUser');
        if (localStorage.getItem('isLoggedIn') !== 'true' || !raw) throw new Error('no-session');
        const user = JSON.parse(raw);
        if (!user?.id) throw new Error('no-user');
        const response = await fetch(`/api/auth/check?id=${encodeURIComponent(String(user.id))}`, { cache: 'no-store' });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.active) throw new Error('inactive');
        if (!cancelled) setReady(true);
      } catch {
        ['currentUser', 'user', 'loggedInUser', 'user_id', 'retailer_id', 'retailer_logged_in', 'isLoggedIn', 'user_role_type', 'retailerWalletBalance'].forEach(k => localStorage.removeItem(k));
        if (!cancelled) router.replace('/auth/login');
      }
    }
    validate();
    return () => { cancelled = true; };
  }, [router]);

  if (!ready) return <main className="min-h-screen bg-[#050914] text-white grid place-items-center"><div className="text-sm text-slate-400">Verifying live account…</div></main>;
  return <>{children}</>;
}
