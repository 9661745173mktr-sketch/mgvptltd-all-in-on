'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthPortalPage from './auth/login/page';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (loggedIn && raw) {
        const user = JSON.parse(raw);
        if (user?.id && String(user.accountStatus).toLowerCase() === 'active' && String(user.paymentStatus).toLowerCase() === 'verified') {
          router.replace('/dashboard');
          return;
        }
      }
    } catch {}
    setChecking(false);
  }, [router]);

  if (checking) return <main className="min-h-screen bg-[#050914] text-white grid place-items-center"><div className="text-center"><div className="text-2xl font-black text-cyan-300">MG-PVT-LTD</div><div className="mt-2 text-sm text-slate-400">Checking account…</div></div></main>;
  return <AuthPortalPage />;
}
