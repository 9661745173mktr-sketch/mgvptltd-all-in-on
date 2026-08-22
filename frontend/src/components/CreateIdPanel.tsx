'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const COMPANY_UPI_ID = '9661745173mktr-1@oksbi';
const COMPANY_NAME = 'MG PVT LTD';

type UserRole = 'admin' | 'master_distributor' | 'super_distributor' | 'distributor' | 'retailer' | 'unknown';
type CreateRole = Exclude<UserRole, 'admin' | 'unknown'>;
type RoleConfig = { key: CreateRole; label: string; fee: number; icon: string };
const ROLES: RoleConfig[] = [
  { key: 'master_distributor', label: 'Master Distributor', fee: 4999, icon: '👑' },
  { key: 'super_distributor', label: 'Super Distributor', fee: 2999, icon: '⭐' },
  { key: 'distributor', label: 'Distributor', fee: 1999, icon: '🏢' },
  { key: 'retailer', label: 'Retailer', fee: 999, icon: '🛍️' },
];
function normalizeRole(value: unknown): UserRole {
  const role = String(value || '').toLowerCase().trim().replace(/-/g, '_').replace(/\s+/g, '_');
  if (['master', 'master_distributor', 'masterdistributor', 'master_dis'].includes(role)) return 'master_distributor';
  if (['super', 'super_distributor', 'superdistributor', 'super_dis'].includes(role)) return 'super_distributor';
  if (['distributor', 'dis'].includes(role)) return 'distributor';
  if (['retailer', 'retailor', 'retail'].includes(role)) return 'retailer';
  if (['admin', 'super_admin', 'administrator'].includes(role)) return 'admin';
  return 'unknown';
}
function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  for (const key of ['currentUser', 'user', 'loggedInUser']) {
    try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw); } catch {}
  }
  return null;
}
function allowedRoles(role: UserRole) {
  if (role === 'admin') return ROLES;
  if (role === 'master_distributor') return ROLES.filter(r => ['super_distributor', 'distributor', 'retailer'].includes(r.key));
  if (role === 'super_distributor') return ROLES.filter(r => ['distributor', 'retailer'].includes(r.key));
  if (role === 'distributor') return ROLES.filter(r => r.key === 'retailer');
  return [];
}

export default function CreateIdPanel() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole>('unknown');
  const [selected, setSelected] = useState<CreateRole | ''>('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [utr, setUtr] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    setRole(normalizeRole(current?.role || current?.userRole || current?.user_role || current?.type));
  }, []);

  const available = useMemo(() => allowedRoles(role), [role]);
  const config = useMemo(() => ROLES.find(r => r.key === selected) || null, [selected]);
  const upiPayload = useMemo(() => {
    if (!config) return `upi://pay?pa=${encodeURIComponent(COMPANY_UPI_ID)}&pn=${encodeURIComponent(COMPANY_NAME)}&cu=INR`;
    return `upi://pay?pa=${encodeURIComponent(COMPANY_UPI_ID)}&pn=${encodeURIComponent(COMPANY_NAME)}&am=${config.fee.toFixed(2)}&cu=INR`;
  }, [config]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return alert('पहले ID Role select करें।');
    if (!name.trim()) return alert('Applicant का real name दर्ज करें।');
    if (!/^\d{10}$/.test(mobile.trim())) return alert('सही 10-digit mobile number दर्ज करें।');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return alert('सही Gmail / email address दर्ज करें।');
    if (username.trim().length < 4) return alert('Username / ID कम से कम 4 characters का होना चाहिए।');
    if (password.length < 6) return alert('Password कम से कम 6 characters का होना चाहिए।');
    if (!/^\d{6,50}$/.test(utr.trim())) return alert('Payment के बाद सही numeric UTR / Transaction Reference डालें।');

    setBusy(true); setMessage('');
    try {
      const creatorId = String(user?.id || user?.userId || user?.retailerId || '');
      if (!creatorId && role !== 'admin') throw new Error('Current parent account नहीं मिला। कृपया logout करके real account से दोबारा login करें।');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (role === 'admin') {
        const adminToken = localStorage.getItem('adminToken') || '';
        if (!adminToken) throw new Error('Admin session नहीं मिला। कृपया Admin में दोबारा login करें।');
        headers['x-admin-token'] = adminToken;
      }
      const response = await fetch('/api/id-requests/register', {
        method: 'POST', headers,
        body: JSON.stringify({ name: name.trim(), phone: mobile.trim(), email: email.trim(), password, username: username.trim(), role: selected, parentId: role === 'admin' ? null : creatorId, utr: utr.trim(), paymentMethod: 'upi' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || `Registration failed (${response.status}).`);
      setMessage(`✅ ${config.label} ID request live database में submit हो गई है। ₹${config.fee.toLocaleString('en-IN')} payment का UTR Admin verify करेगा; approval के बाद ही ID ACTIVE होगी।`);
      window.dispatchEvent(new Event('id_creation_updated'));
      setSelected(''); setName(''); setMobile(''); setEmail(''); setUsername(''); setPassword(''); setUtr('');
    } catch (err: any) { alert(err?.message || 'ID creation request complete नहीं हुई।'); }
    finally { setBusy(false); }
  }

  if (!user || available.length === 0) return <div className="rounded-3xl border border-amber-400/20 bg-slate-900/80 p-8 text-center"><div className="text-4xl">🔒</div><h2 className="mt-4 text-2xl font-black">ID Creation Permission</h2><p className="mt-3 text-sm text-slate-400">Current account role: <b className="text-cyan-300">{role}</b>. इस role से कोई नया partner ID create नहीं किया जा सकता।</p></div>;

  return <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
    <form onSubmit={submit} className="rounded-3xl border border-white/5 bg-slate-900/80 p-6 shadow-2xl">
      <h2 className="text-xl font-black">📝 Create Partner ID</h2><p className="mt-1 text-xs text-slate-500">Admin / parent role के अनुसार real database में partner request बनेगी।</p>
      <label className="mt-6 block text-xs font-black text-cyan-300">Select ID Role *</label>
      <select value={selected} onChange={e => setSelected(e.target.value as CreateRole)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold outline-none"><option value="">Select Role</option>{available.map(r => <option key={r.key} value={r.key}>{r.icon} {r.label} — ₹{r.fee.toLocaleString('en-IN')}</option>)}</select>
      <div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Applicant Full Name *" value={name} onChange={setName} type="text" /><Field label="Mobile Number *" value={mobile} onChange={v => setMobile(v.replace(/\D/g, '').slice(0, 10))} type="tel" /><Field label="Gmail / Email *" value={email} onChange={setEmail} type="email" /><Field label="Login Username / ID *" value={username} onChange={setUsername} type="text" /><Field label="Login Password *" value={password} onChange={setPassword} type="password" /></div>
      <div className="mt-5"><label className="mb-2 block text-xs font-black text-cyan-300">Payment UTR / Transaction Reference *</label><input inputMode="numeric" value={utr} onChange={e => setUtr(e.target.value.replace(/\D/g, '').slice(0, 50))} maxLength={50} placeholder="UPI payment के बाद UTR डालें" className="w-full rounded-xl border border-emerald-400/20 bg-slate-800 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-400" /></div>
      <button type="submit" disabled={busy || !config} className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-sm font-black disabled:opacity-40">{busy ? 'Submitting to Live Database…' : config ? `Register & Submit ${config.label} ₹${config.fee.toLocaleString('en-IN')} 🚀` : 'Select ID Role First'}</button>
      {message && <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-xs text-emerald-300">{message}</div>}
    </form>
    <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-[#0b1324] to-[#071020] p-6 text-center shadow-2xl"><div className="text-[10px] font-black uppercase tracking-widest text-emerald-300">MG PVT LTD • UPI PAYMENT</div><h2 className="mt-3 text-xl font-black">📱 Scan & Pay</h2><div className="mt-6 flex justify-center"><div className="rounded-3xl bg-white p-5"><QRCodeSVG value={upiPayload} size={250} level="M" includeMargin /></div></div><div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5"><div className="text-[10px] uppercase tracking-widest text-slate-500">Payable Amount</div><div className="mt-1 text-4xl font-black text-emerald-300">₹{config ? config.fee.toLocaleString('en-IN') : '0'}</div>{config && <div className="mt-1 text-xs text-slate-500">{config.label} ID Creation Fee</div>}</div><div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4"><div className="text-[10px] uppercase tracking-widest text-slate-600">Pay To UPI ID</div><div className="mt-2 break-all text-sm font-black text-cyan-300">{COMPANY_UPI_ID}</div><div className="mt-1 text-[10px] text-slate-500">{COMPANY_NAME}</div></div></div>
  </div>;
}
function Field({ label, value, onChange, type }: { label: string; value: string; onChange: (value: string) => void; type: string }) { return <div><label className="mb-2 block text-xs font-black text-slate-300">{label}</label><input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none focus:border-cyan-400" /></div>; }
