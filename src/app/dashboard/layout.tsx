'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!loggedIn || !raw) {
        router.replace('/auth/login');
        return;
      }
      const user = JSON.parse(raw);
      if (!user?.id || String(user.accountStatus).toLowerCase() !== 'active' || String(user.paymentStatus).toLowerCase() !== 'verified') {
        localStorage.removeItem('isLoggedIn');
        router.replace('/auth/login');
        return;
      }
      setReady(true);
    } catch {
      router.replace('/auth/login');
    }
  }, [router]);

  if (!ready) return <main className="min-h-screen bg-[#050914] text-white grid place-items-center"><div className="text-sm text-slate-400">Opening secure dashboard…</div></main>;
  return <>{children}</>;
}
