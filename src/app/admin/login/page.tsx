'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Admin login failed.');
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminProfile', JSON.stringify(data.admin || {}));
      localStorage.setItem('isAdminLoggedIn', 'true');
      router.replace('/admin/dashboard');
    } catch (err: any) {
      setMessage(err.message || 'Unable to login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090d16', position: 'fixed', top: 0, left: 0, zIndex: 9999, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#111827', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.9)', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '60px', height: '60px', background: '#10b981', borderRadius: '15px', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', color: '#fff' }}>🛡️</div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff', margin: '0 0 5px 0' }}>MG-PVT-LTD Admin</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Master Control Portal</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Admin Username / Email</label>
            <input type="text" placeholder="Configured admin email or name" value={identifier} onChange={(e) => setIdentifier(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: '#1f2937', border: '1px solid #374151', color: '#fff', outline: 'none', boxSizing: 'border-box' }} required />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Password</label>
            <input type="password" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: '#1f2937', border: '1px solid #374151', color: '#fff', outline: 'none', boxSizing: 'border-box' }} required />
          </div>
          <button type="submit" disabled={loading} style={{ marginTop: '10px', padding: '14px', borderRadius: '10px', border: 'none', background: loading ? '#475569' : '#10b981', color: '#fff', fontWeight: 'bold', fontSize: '15px', cursor: loading ? 'wait' : 'pointer' }}>{loading ? 'Signing in…' : 'Admin Secure Sign In 🚀'}</button>
        </form>
        {message && <p style={{ marginTop: '16px', textAlign: 'center', color: '#f87171', fontSize: '13px', fontWeight: 700 }}>{message}</p>}
      </div>
    </div>
  );
}
