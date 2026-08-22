'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if (pathname !== '/admin/login') {
      const token = localStorage.getItem('adminToken');
      if (!token) router.replace('/admin/login');
      else setAuthorized(true);
    }
  }, [pathname, router]);

  if (!isClient) return <div style={{ background: '#090d16', minHeight: '100vh' }} />;
  if (pathname === '/admin/login') return <>{children}</>;
  if (!authorized) return <div style={{ background: '#090d16', minHeight: '100vh' }} />;

  const menuItems = [
    { name: 'Dashboard & Stats', href: '/admin/dashboard', icon: '📊' },
    { name: 'Service Requests', href: '/admin/service-requests', icon: '📥' },
    { name: 'Wallet Load Requests', href: '/admin/wallet-requests', icon: '💰' },
    { name: 'Aadhaar Service Control', href: '/admin/aadhaar-requests', icon: '🆔' },
    { name: 'User Hierarchy', href: '/admin/user-hierarchy', icon: '👥' },
    { name: 'Wallet & Transactions', href: '/admin/wallet-transactions', icon: '💳' },
    { name: 'Master Services Control', href: '/admin/services-control', icon: '⚙️' },
  ];

  return (
    <div style={{ display: 'flex', background: '#090d16', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <aside style={{ width: '270px', background: '#0f172a', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', padding: '20px', position: 'fixed', height: '100vh', boxSizing: 'border-box' }}>
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '15px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: '#38bdf8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000', fontSize: '18px' }}>MG</div>
          <div><div style={{ fontWeight: '800', fontSize: '15px', color: '#fff' }}>MG Pvt Ltd</div><div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '600', letterSpacing: '0.5px' }}>MASTER ADMIN OS</div></div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '600', color: isActive ? '#fff' : '#94a3b8', background: isActive ? 'linear-gradient(90deg, #0284c7 0%, #0369a1 100%)' : 'transparent', boxShadow: isActive ? '0 4px 12px rgba(2, 132, 199, 0.3)' : 'none' }}><span style={{ fontSize: '16px' }}>{item.icon}</span><span>{item.name}</span></Link>;
          })}
        </nav>
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '15px' }}>
          <button onClick={() => { localStorage.removeItem('adminToken'); localStorage.removeItem('adminProfile'); localStorage.removeItem('isAdminLoggedIn'); router.replace('/admin/login'); }} style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '11px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>🔒 Logout Portal</button>
        </div>
      </aside>
      <main style={{ marginLeft: '270px', flex: 1, padding: '30px', boxSizing: 'border-box', overflowY: 'auto' }}>{children}</main>
    </div>
  );
}
