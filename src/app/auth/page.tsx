'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Normalize the public API URL before passing it to fetch(). This prevents the
// browser's native "The string did not match the expected pattern" error when
// the Vercel environment variable contains whitespace or an invalid URL.
const RAW_API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();
const API_BASE = (() => {
  if (!RAW_API_BASE) return '';
  try {
    const url = new URL(RAW_API_BASE);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return '';
  }
})();
const apiUrl = (path: string) => `${API_BASE}${path}`;

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('RETAILER');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const endpoint = isLogin ? apiUrl('/api/auth/login') : apiUrl('/api/auth/register');
    const saved = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    const payload = isLogin
      ? { email: email.trim(), password }
      : { name: name.trim(), phone: phone.trim(), email: email.trim(), password, role, parentId: saved?.id || undefined };

    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      if (isLogin) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage('Login Successful! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 400);
      } else {
        setMessage('Request submitted. Admin payment verification ke baad ID activate hogi.');
        setTimeout(() => setIsLogin(true), 1200);
      }
    } catch (err: any) { setMessage(err?.message || 'Something went wrong.'); }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '60px auto', padding: '30px', fontFamily: 'sans-serif', background: '#1e293b', color: '#fff', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', border: '1px solid #334155' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}><h1 style={{ color: '#38bdf8', margin: '0 0 5px', fontSize: '26px' }}>MG-PVT-LTD</h1><p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>B2B & Digital Services Enterprise Portal</p></div>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '18px', color: '#f8fafc' }}>{isLogin ? 'Sign In to Portal' : 'Create B2B Account'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!isLogin && <>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Real Full Name" required style={inputStyle} />
          <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Mobile Number" inputMode="numeric" required style={inputStyle} />
          <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}><option value="RETAILER">Retailer</option><option value="DISTRIBUTOR">Distributor</option><option value="SUPER_DISTRIBUTOR">Super Distributor</option></select>
        </>}
        <input type="email" placeholder="Gmail / Email Address" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
        <button type="submit" style={{ padding: '12px', fontSize: '16px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{isLogin ? 'Login Securely' : 'Submit Account Request'}</button>
      </form>
      {message && <p style={{ textAlign: 'center', marginTop: '15px', color: message.toLowerCase().includes('successful') || message.toLowerCase().includes('submitted') ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>{message}</p>}
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#94a3b8' }}>{isLogin ? "Don't have an account? " : 'Already have an account? '}<button onClick={() => { setIsLogin(!isLogin); setMessage(''); }} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold', fontSize: '14px' }}>{isLogin ? 'Register Now' : 'Login'}</button></p>
    </div>
  );
}

const inputStyle: React.CSSProperties = { padding: '10px', fontSize: '15px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff' };
