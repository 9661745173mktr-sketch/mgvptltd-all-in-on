'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../utils/api';

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Admin login failed');
      sessionStorage.setItem('admin_token', data.token);
      sessionStorage.setItem('admin_profile', JSON.stringify(data.admin || {}));
      sessionStorage.setItem('isAdminLoggedIn', 'true');
      router.replace('/admin/dashboard');
    } catch (error: any) {
      alert(error?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090d16', fontFamily: 'Inter, sans-serif', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ background: '#111827', border: '1px solid rgba(16,185,129,.3)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px rgba(0,0,0,.9)', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '60px', height: '60px', background: '#10b981', borderRadius: '15px', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>🛡️</div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff', margin: '0 0 5px' }}>MG-PVT-LTD Admin</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Master Control Portal</p>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <input value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="Admin username / email" required style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: '#1f2937', border: '1px solid #374151', color: '#fff', boxSizing: 'border-box' }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Admin password" required style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: '#1f2937', border: '1px solid #374151', color: '#fff', boxSizing: 'border-box' }} />
          <button type="submit" disabled={loading} style={{ padding: '14px', borderRadius: '10px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 'bold', fontSize: '15px', cursor: loading ? 'wait' : 'pointer' }}>{loading ? 'Signing in…' : 'Admin Secure Sign In 🚀'}</button>
        </form>
      </div>
    </div>
  );
}
