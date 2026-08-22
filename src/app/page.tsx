'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthPortalPage from './auth/login/page';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function validate() {
      try {
        const raw = localStorage.getItem('currentUser');
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (loggedIn && raw) {
          const user = JSON.parse(raw);
          if (user?.id) {
            const response = await fetch(`/api/auth/check?id=${encodeURIComponent(String(user.id))}`, { cache: 'no-store' });
            const data = await response.json().catch(() => ({}));
            if (data?.active) {
              router.replace('/dashboard');
              return;
            }
          }
        }
      } catch {}
      if (!cancelled) {
        ['currentUser', 'user', 'loggedInUser', 'user_id', 'retailer_id', 'retailer_logged_in', 'isLoggedIn', 'user_role_type', 'retailerWalletBalance'].forEach(k => localStorage.removeItem(k));
        setShowAuth(true);
        setChecking(false);
      }
    }
    validate();
    return () => { cancelled = true; };
  }, [router]);

  if (checking && !showAuth) return <main className="min-h-screen bg-[#050914] text-white grid place-items-center"><div className="text-center"><div className="text-2xl font-black text-cyan-300">MG-PVT-LTD</div><div className="mt-2 text-sm text-slate-400">Opening secure portal…</div></div></main>;
  return <AuthPortalPage />;
}
