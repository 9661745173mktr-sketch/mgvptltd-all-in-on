'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { apiFetch, saveCurrentUser } from '../../utils/api';

type UserRole = 'MASTER_DISTRIBUTOR' | 'SUPER_DISTRIBUTOR' | 'DISTRIBUTOR' | 'RETAILER';
const ROLE_FEES: Record<UserRole, number> = { MASTER_DISTRIBUTOR: 4999, SUPER_DISTRIBUTOR: 2999, DISTRIBUTOR: 1999, RETAILER: 999 };
const ROLE_LABELS: Record<UserRole, string> = { MASTER_DISTRIBUTOR: 'Master Distributor', SUPER_DISTRIBUTOR: 'Super Distributor', DISTRIBUTOR: 'Distributor', RETAILER: 'Retailer' };
const COMPANY_UPI_ID = '9661745173mktr-1@oksbi';
const COMPANY_NAME = 'MG PVT LTD';
const WHATSAPP_SUPPORT_NO = '9472902637';

function normalizeRole(value: any): UserRole | '' {
  const r = String(value || '').toUpperCase().replace(/[-\s]/g, '_');
  return ['MASTER_DISTRIBUTOR','SUPER_DISTRIBUTOR','DISTRIBUTOR','RETAILER'].includes(r) ? r as UserRole : '';
}

function allowedRoles(parentRole: UserRole | ''): UserRole[] {
  if (parentRole === 'MASTER_DISTRIBUTOR') return ['SUPER_DISTRIBUTOR','DISTRIBUTOR','RETAILER'];
  if (parentRole === 'SUPER_DISTRIBUTOR') return ['DISTRIBUTOR','RETAILER'];
  if (parentRole === 'DISTRIBUTOR') return ['RETAILER'];
  return ['RETAILER'];
}

export default function AuthPortalPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [utr, setUtr] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('RETAILER');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const parent = typeof window !== 'undefined' ? (() => { try { return JSON.parse(sessionStorage.getItem('portal_user') || 'null'); } catch { return null; } })() : null;
  const parentRole = normalizeRole(parent?.role);
  const roles = useMemo(() => allowedRoles(parentRole), [parentRole]);
  const currentFee = ROLE_FEES[selectedRole];
  const upiPayload = `upi://pay?pa=${encodeURIComponent(COMPANY_UPI_ID)}&pn=${encodeURIComponent(COMPANY_NAME)}&am=${currentFee.toFixed(2)}&cu=INR`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage('');
    try {
      const res = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: identifier, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      saveCurrentUser(data.user);
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('user_id', String(data.user.id));
      setMessage('Login Successful! Redirecting…');
      router.replace('/dashboard');
    } catch (error: any) { setMessage(error?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMessage('');
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) throw new Error('10-digit mobile number is required.');
      if (signupPassword.length < 6) throw new Error('Password must be at least 6 characters.');
      if (utr.trim().length < 6) throw new Error('Enter the UTR after completing the UPI payment.');
      if (selectedRole !== 'RETAILER' && !parent?.id) throw new Error('Higher-level IDs must be created by an approved parent account.');

      const res = await apiFetch('/api/id-requests/register', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), phone: cleanPhone, email: email.trim().toLowerCase(), password: signupPassword, role: selectedRole, parentId: parent?.id || null, utr: utr.trim(), paymentMethod: 'upi' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setMessage('Request submitted. Admin payment verification and approval is required before login.');
      setAuthMode('login'); setName(''); setPhone(''); setEmail(''); setSignupPassword(''); setUtr('');
    } catch (error: any) { setMessage(error?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b1329', color: '#fff', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', background: '#070b14', borderBottom: '1px solid rgba(255,255,255,.08)' }}><div style={{ fontSize: 20, fontWeight: 900, color: '#38bdf8' }}>MG-PVT-LTD Portal</div><div style={{ color: '#cbd5e1', fontSize: 13 }}>Aadhaar • PAN • BBPS • AEPS • Digital Services</div><button onClick={() => setAuthMode('login')} style={{ background: '#f59e0b', color: '#000', border: 0, padding: '8px 18px', borderRadius: 8, fontWeight: 'bold' }}>Member Login</button></header>
      <div style={{ padding: '50px 20px 20px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}><h1 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 15px' }}>India Digital Services Portal for <span style={{ color: '#38bdf8' }}>Aadhaar, PAN, PVC & More</span></h1><p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>Secure partner portal with role-based access, wallet services and admin verification.</p><div style={{ background: 'linear-gradient(135deg, rgba(14,165,233,.15), rgba(15,23,42,.95))', border: '1px solid rgba(56,189,248,.4)', borderRadius: 16, padding: 22, marginTop: 25 }}><h3 style={{ color: '#fbbf24', margin: '0 0 8px' }}>🛒 {COMPANY_NAME} Partner Portal</h3><p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>Retailer, Distributor, Super Distributor and Master Distributor panels with admin approval.</p><div style={{ marginTop: 15 }}><a href={`https://wa.me/91${WHATSAPP_SUPPORT_NO}`} target="_blank" rel="noreferrer" style={{ color: '#fff', background: '#25d366', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 'bold' }}>💬 WhatsApp Support +91 {WHATSAPP_SUPPORT_NO}</a></div></div></div>

      <div style={{ width: '100%', maxWidth: 520, margin: '20px auto 50px', background: 'rgba(15,23,42,.95)', border: '1px solid rgba(56,189,248,.35)', borderRadius: 20, padding: 30, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', background: '#1e293b', borderRadius: 10, padding: 4, marginBottom: 25 }}><button type="button" onClick={() => setAuthMode('login')} style={{ flex: 1, padding: 11, border: 0, borderRadius: 8, background: authMode === 'login' ? '#db2777' : 'transparent', color: '#fff', fontWeight: 'bold' }}>🔑 Login</button><button type="button" onClick={() => setAuthMode('signup')} style={{ flex: 1, padding: 11, border: 0, borderRadius: 8, background: authMode === 'signup' ? '#db2777' : 'transparent', color: '#fff', fontWeight: 'bold' }}>📝 Sign Up (Create ID)</button></div>
        {authMode === 'login' ? <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}><input value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="Email / Mobile / Username" required style={{ padding: 12, borderRadius: 10, background: '#1e293b', border: '1px solid #334155', color: '#fff' }} /><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required style={{ padding: 12, borderRadius: 10, background: '#1e293b', border: '1px solid #334155', color: '#fff' }} /><button disabled={loading} style={{ padding: 14, border: 0, borderRadius: 10, background: '#db2777', color: '#fff', fontWeight: 'bold' }}>{loading ? 'Checking…' : 'Login to Portal 🚀'}</button></form> : <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <select value={selectedRole} onChange={e => setSelectedRole(e.target.value as UserRole)} style={{ padding: 11, borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#fff', fontWeight: 'bold' }}>{roles.map(role => <option key={role} value={role}>{ROLE_LABELS[role]} (Fee: ₹{ROLE_FEES[role].toLocaleString('en-IN')})</option>)}</select>
          {parent?.name && <div style={{ fontSize: 12, color: '#94a3b8' }}>Creating under: <b style={{ color: '#38bdf8' }}>{parent.name}</b> ({ROLE_LABELS[parentRole] || parent.role})</div>}
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Real Full Name" required style={{ padding: 11, borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10 digit Mobile Number" required style={{ padding: 11, borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Gmail / Email" required style={{ padding: 11, borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
          <input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="Create Password" required style={{ padding: 11, borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
          <div style={{ background: 'rgba(30,41,59,.8)', borderRadius: 12, padding: 15, textAlign: 'center', border: '1px solid #334155' }}><div style={{ fontSize: 12, color: '#38bdf8', fontWeight: 'bold' }}>Scan & Pay Registration Fee: ₹{currentFee.toLocaleString('en-IN')}</div><div style={{ fontSize: 10, color: '#94a3b8', margin: '5px 0 10px' }}>UPI ID: {COMPANY_UPI_ID}</div><div style={{ background: '#fff', padding: 10, borderRadius: 10, display: 'inline-block' }}><QRCodeSVG value={upiPayload} size={140} level="M" /></div></div>
          <input value={utr} onChange={e => setUtr(e.target.value)} placeholder="UTR / Payment Reference Number" required style={{ padding: 11, borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
          <button disabled={loading} style={{ padding: 13, border: 0, borderRadius: 10, background: '#10b981', color: '#fff', fontWeight: 'bold' }}>{loading ? 'Submitting…' : 'Register & Submit ID 🚀'}</button>
        </form>}
        {message && <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: 'rgba(56,189,248,.08)', color: '#7dd3fc', fontSize: 13 }}>{message}</div>}
      </div>
    </div>
  );
}
