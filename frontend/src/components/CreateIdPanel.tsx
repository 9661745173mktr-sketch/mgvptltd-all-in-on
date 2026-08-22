'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { apiFetch, getCurrentUser } from '../app/utils/api';

type Role = 'MASTER_DISTRIBUTOR' | 'SUPER_DISTRIBUTOR' | 'DISTRIBUTOR' | 'RETAILER';
const FEES: Record<Role, number> = { MASTER_DISTRIBUTOR: 4999, SUPER_DISTRIBUTOR: 2999, DISTRIBUTOR: 1999, RETAILER: 999 };
const LABELS: Record<Role, string> = { MASTER_DISTRIBUTOR: 'Master Distributor', SUPER_DISTRIBUTOR: 'Super Distributor', DISTRIBUTOR: 'Distributor', RETAILER: 'Retailer' };
const UPI = '9661745173mktr-1@oksbi';

function normalizeRole(value: any): Role | '' {
  const role = String(value || '').toUpperCase().replace(/[-\s]/g, '_');
  return ['MASTER_DISTRIBUTOR','SUPER_DISTRIBUTOR','DISTRIBUTOR','RETAILER'].includes(role) ? role as Role : '';
}
function allowed(parent: Role | ''): Role[] {
  if (parent === 'MASTER_DISTRIBUTOR') return ['SUPER_DISTRIBUTOR','DISTRIBUTOR','RETAILER'];
  if (parent === 'SUPER_DISTRIBUTOR') return ['DISTRIBUTOR','RETAILER'];
  if (parent === 'DISTRIBUTOR') return ['RETAILER'];
  return [];
}

export default function CreateIdPanel() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<Role | ''>('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setUser(getCurrentUser());
    const refresh = () => setUser(getCurrentUser());
    window.addEventListener('portal_user_updated', refresh);
    return () => window.removeEventListener('portal_user_updated', refresh);
  }, []);

  const parentRole = normalizeRole(user?.role);
  const roles = useMemo(() => allowed(parentRole), [parentRole]);
  const fee = role ? FEES[role] : 0;
  const qr = role ? `upi://pay?pa=${encodeURIComponent(UPI)}&pn=${encodeURIComponent('MG PVT LTD')}&am=${fee.toFixed(2)}&cu=INR` : '';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!role) return setMessage('Please select the allowed child role.');
    const cleanName = name.trim();
    const cleanMobile = mobile.replace(/\D/g, '');
    const cleanEmail = email.trim().toLowerCase();
    if (cleanName.length < 2) return setMessage('Enter the real full name of the new user.');
    if (cleanMobile.length !== 10) return setMessage('Enter a valid 10-digit mobile number.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return setMessage('Enter a valid Gmail/email address.');
    if (password.length < 6) return setMessage('Password must be at least 6 characters.');
    if (utr.trim().length < 6) return setMessage('Enter UTR after completing the payment.');
    if (!user?.id) return setMessage('Active parent session is required to create a child ID.');
    setLoading(true);
    try {
      const res = await apiFetch('/api/id-requests/register', { method: 'POST', body: JSON.stringify({ name: cleanName, phone: cleanMobile, email: cleanEmail, password, role, parentId: user.id, username: username.trim() || undefined, utr: utr.trim(), paymentMethod: 'upi' }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `ID request failed (${res.status}).`);
      setMessage(`Request submitted for ${LABELS[role]}. Admin payment verification and approval is required before activation.`);
      setName(''); setMobile(''); setEmail(''); setUsername(''); setPassword(''); setUtr(''); setRole('');
    } catch (error: any) {
      setMessage(error?.message || 'Unable to submit request.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 text-slate-300">Please login with an active partner account first.</div>;
  if (!roles.length) return <div className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5 text-amber-200">Your current role does not have permission to create a child ID.</div>;

  return (
    <div className="rounded-3xl border border-cyan-400/30 bg-[#0b1324] p-6 shadow-2xl">
      <h2 className="text-xl font-black text-cyan-300">🪪 Create Partner ID</h2>
      <p className="mt-1 text-xs text-slate-400">Parent account: <b className="text-white">{user.name || '—'}</b> ({LABELS[parentRole] || user.role})</p>
      <p className="mt-1 text-xs text-amber-200/80">Enter the <b>new user’s own</b> real name, mobile, Gmail/email, username and password below. Parent details are never copied into the new ID.</p>
      <form onSubmit={submit} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-xs font-bold text-cyan-300">Allowed Role<select value={role} onChange={e => setRole(e.target.value as Role)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-white"><option value="">Select role</option>{roles.map(r => <option key={r} value={r}>{LABELS[r]} — ₹{FEES[r].toLocaleString('en-IN')}</option>)}</select></label>
        <label className="text-xs font-bold text-cyan-300">New User Real Name<input value={name} onChange={e => setName(e.target.value)} placeholder="Full legal name" required className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-white" /></label>
        <label className="text-xs font-bold text-cyan-300">New User Mobile<input value={mobile} onChange={e => setMobile(e.target.value)} placeholder="10-digit mobile" inputMode="numeric" required className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-white" /></label>
        <label className="text-xs font-bold text-cyan-300">New User Gmail / Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@gmail.com" required className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-white" /></label>
        <label className="text-xs font-bold text-cyan-300">New Username<input value={username} onChange={e => setUsername(e.target.value)} placeholder="Optional login username" autoCapitalize="none" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-white" /></label>
        <label className="text-xs font-bold text-cyan-300">New Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 characters" required className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-white" /></label>
        {role && <div className="md:col-span-2 rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-center"><div className="text-sm font-bold text-cyan-300">Registration Fee: ₹{fee.toLocaleString('en-IN')}</div><div className="text-xs text-slate-400">UPI: {UPI}</div><div className="mt-3 inline-block rounded-xl bg-white p-3"><QRCodeSVG value={qr} size={170} /></div></div>}
        <label className="md:col-span-2 text-xs font-bold text-cyan-300">UTR / Payment Reference<input value={utr} onChange={e => setUtr(e.target.value)} required placeholder="Enter UTR after payment" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-white" /></label>
        <button disabled={loading} className="md:col-span-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 font-black text-white disabled:opacity-50">{loading ? 'Submitting…' : 'Submit ID Request 🚀'}</button>
      </form>
      {message && <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3 text-sm text-cyan-200">{message}</div>}
    </div>
  );
}
