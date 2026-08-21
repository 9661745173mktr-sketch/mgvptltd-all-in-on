'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname !== '/admin/login' && !sessionStorage.getItem('admin_token')) router.replace('/admin/login');
    setReady(true);
  }, [pathname, router]);

  if (!ready) return <div style={{ background: '#090d16', minHeight: '100vh' }} />;
  if (pathname === '/admin/login') return <>{children}</>;

  const menuItems = [
    ['Dashboard & Stats', '/admin/dashboard', '📊'],
    ['ID Requests', '/admin/requests', '🪪'],
    ['Service Requests', '/admin/service-requests', '📥'],
    ['Wallet Load Requests', '/admin/wallet-requests', '💰'],
    ['Aadhaar Service Control', '/admin/aadhaar-requests', '🆔'],
    ['User Hierarchy', '/admin/user-hierarchy', '👥'],
    ['Wallet & Transactions', '/admin/wallet-transactions', '💳'],
    ['Master Services Control', '/admin/services-control', '⚙️'],
  ];

  return (
    <div style={{ display: 'flex', background: '#090d16', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <aside style={{ width: 270, background: '#0f172a', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', padding: 20, position: 'fixed', height: '100vh', boxSizing: 'border-box' }}>
        <div style={{ background: '#111827', padding: 15, borderRadius: 12, border: '1px solid #334155', marginBottom: 25, display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 40, height: 40, background: '#38bdf8', borderRadius: 8, display: 'grid', placeItems: 'center', color: '#000', fontWeight: 900 }}>MG</div><div><div style={{ fontWeight: 800 }}>MG Pvt Ltd</div><div style={{ fontSize: 11, color: '#38bdf8' }}>MASTER ADMIN OS</div></div></div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {menuItems.map(([name, href, icon]) => <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 15px', borderRadius: 10, textDecoration: 'none', color: pathname === href ? '#fff' : '#94a3b8', background: pathname === href ? '#0369a1' : 'transparent', fontWeight: 600, fontSize: 14 }}><span>{icon}</span><span>{name}</span></Link>)}
        </nav>
        <button onClick={() => { sessionStorage.removeItem('admin_token'); sessionStorage.removeItem('admin_profile'); sessionStorage.removeItem('isAdminLoggedIn'); router.replace('/admin/login'); }} style={{ width: '100%', background: 'rgba(239,68,68,.1)', border: '1px solid #ef4444', color: '#ef4444', padding: 11, borderRadius: 8, fontWeight: 'bold' }}>🔒 Logout Portal</button>
      </aside>
      <main style={{ marginLeft: 270, flex: 1, padding: 30, boxSizing: 'border-box', overflowY: 'auto' }}>{children}</main>
    </div>
  );
}
