'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { readUsers, saveUsers, addAdminNotification, type PortalUser } from '../app/utils/authStore';

type UserRole = 'admin' | 'master_distributor' | 'super_distributor' | 'distributor' | 'retailer' | 'unknown';
type CreateRole = Exclude<UserRole, 'unknown' | 'admin'>;

type RoleConfig = { key: CreateRole; label: string; fee: number; icon: string };

const ROLES: RoleConfig[] = [
  { key: 'master_distributor', label: 'Master Distributor', fee: 4999, icon: '👑' },
  { key: 'super_distributor', label: 'Super Distributor', fee: 2999, icon: '⭐' },
  { key: 'distributor', label: 'Distributor', fee: 1999, icon: '🏢' },
  { key: 'retailer', label: 'Retailer', fee: 999, icon: '🛍️' },
];

const UPI_ID = '9661745173mktr-1@oksbi';
const COMPANY = 'MG PVT LTD';

function normalizeRole(value: unknown): UserRole {
  const role = String(value || '').toLowerCase().trim().replace(/-/g, '_').replace(/\s+/g, '_');
  if (['master', 'master_distributor', 'masterdistributor', 'master_dis'].includes(role)) return 'master_distributor';
  if (['super', 'super_distributor', 'superdistributor', 'super_dis'].includes(role)) return 'super_distributor';
  if (['distributor', 'dis'].includes(role)) return 'distributor';
  if (['retailer', 'retailor', 'retail'].includes(role)) return 'retailer';
  if (['admin', 'super_admin', 'administrator'].includes(role)) return 'admin';
  return 'unknown';
}

function currentUser(): any {
  if (typeof window === 'undefined') return null;
  for (const key of ['currentUser', 'user', 'loggedInUser']) {
    try {
      const value = localStorage.getItem(key);
      if (value) return JSON.parse(value);
    } catch {}
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

function getApiBase() {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || '';
  if (!raw.trim()) throw new Error('Backend API URL configured नहीं है। Vercel Production में NEXT_PUBLIC_API_BASE_URL सेट करें।');
  let parsed: URL;
  try { parsed = new URL(raw.trim()); } catch { throw new Error('Backend API URL गलत है। NEXT_PUBLIC_API_BASE_URL में पूरा https:// URL डालें।'); }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Backend API URL में केवल http/https allowed है।');
  return parsed.toString().replace(/\/$/, '');
}

export default function CreateIdPanelFixed() {
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
    const u = currentUser();
    setUser(u);
    const detected = normalizeRole(u?.role || u?.userRole || u?.user_role || u?.type || u?.accountType || u?.designation);
    setRole(detected);
    if (u?.name) setName(String(u.name));
    if (u?.phone || u?.mobile) setMobile(String(u.phone || u.mobile));
    if (u?.email) setEmail(String(u.email));
  }, []);

  const available = useMemo(() => allowedRoles(role), [role]);
  const config = useMemo(() => ROLES.find(r => r.key === selected) || null, [selected]);
  const qr = useMemo(() => {
    if (!config) return '';
    const p = new URLSearchParams({ pa: UPI_ID, pn: COMPANY, am: config.fee.toFixed(2), cu: 'INR' });
    return `upi://pay?${p.toString()}`;
  }, [config]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return alert('पहले ID Role select करें।');
    if (!name.trim()) return alert('Applicant का नाम दर्ज करें।');
    if (!/^\d{10,15}$/.test(mobile.trim())) return alert('सही mobile number दर्ज करें।');
    if (!username.trim() || username.trim().length < 4) return alert('Username कम से कम 4 characters का होना चाहिए।');
    if (password.length < 6) return alert('Password कम से कम 6 characters का होना चाहिए।');
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return alert('सही email address दर्ज करें।');
    if (!/^\d{6,50}$/.test(utr.trim())) return alert('Payment का सही numeric UTR / Transaction Reference डालें।');

    setBusy(true); setMessage('');
    try {
      const apiBase = getApiBase();
      const creatorId = String(user?.id || user?.userId || user?.retailerId || user?.phone || localStorage.getItem('retailer_id') || 'unknown');
      const users = readUsers();
      const duplicate = users.some(u => String(u.email || '').toLowerCase() === email.trim().toLowerCase() || String(u.phone || '') === mobile.trim() || String(u.id || '').toLowerCase() === username.trim().toLowerCase());
      if (duplicate) throw new Error('इस Mobile/Email/ID से user पहले से मौजूद है।');

      const newUser: PortalUser = {
        id: username.trim(), name: name.trim(), phone: mobile.trim(), email: email.trim(), password,
        role: config.key, walletBalance: 0, accountStatus: 'Pending', paymentStatus: 'Pending',
        creationFee: config.fee, utr: utr.trim(), createdAt: new Date().toISOString(),
      };

      const response = await fetch(`${apiBase}/api/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newUser.id, email: newUser.email, password: newUser.password, role: newUser.role, name: newUser.name, phone: newUser.phone, parentId: creatorId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || `Server registration failed (${response.status})`);

      saveUsers([newUser, ...users]);
      const request = {
        id: `IDREQ-${Date.now()}`, userId: newUser.id, creatorId, creatorName: String(user?.name || user?.fullName || 'Unknown User'),
        creatorMobile: String(user?.phone || user?.mobile || ''), creatorRole: role, requestedRole: config.key, requestedRoleLabel: config.label,
        amount: config.fee, applicantName: newUser.name, applicantMobile: newUser.phone, applicantEmail: newUser.email,
        username: newUser.id, utr: newUser.utr, paymentMethod: 'upi', paymentStatus: 'Pending', status: 'Pending', createdAt: new Date().toISOString(),
      };
      const old = (() => { try { const x = JSON.parse(localStorage.getItem('id_creation_requests_db') || '[]'); return Array.isArray(x) ? x : []; } catch { return []; } })();
      localStorage.setItem('id_creation_requests_db', JSON.stringify([request, ...old]));
      addAdminNotification({ type: 'ID_CREATION', title: 'New User ID Creation Request', message: `${newUser.name} ने ${config.label} ID के लिए request भेजी है। UTR verify करके ID ACTIVE करें।`, userId: newUser.id, applicantName: newUser.name, mobile: newUser.phone, email: newUser.email, utr: newUser.utr, status: 'Unread' });
      window.dispatchEvent(new Event('id_creation_updated'));
      setMessage(`Request submit हो गई। ₹${config.fee.toLocaleString('en-IN')} payment का UTR Admin verify करेगा; उसके बाद ID ACTIVE होगी।`);
      setSelected(''); setUtr(''); setUsername(''); setPassword('');
    } catch (err: any) {
      alert(err?.message || 'ID creation request complete नहीं हुई।');
    } finally { setBusy(false); }
  }

  if (role === 'retailer' || role === 'unknown' || available.length === 0) {
    return <div className="rounded-3xl border border-amber-400/20 bg-slate-900/80 p-8 text-center"><div className="text-4xl">🔒</div><h2 className="mt-4 text-2xl font-black">ID Creation Permission</h2><p className="mt-3 text-sm text-slate-400">Current account role: <b className="text-cyan-300">{role}</b>. इस role से कोई नया partner ID create नहीं किया जा सकता।</p></div>;
  }

  return <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
    <form onSubmit={submit} className="rounded-3xl border border-white/5 bg-slate-900/80 p-6 shadow-2xl">
      <h2 className="text-xl font-black">📝 Create Partner ID</h2>
      <p className="mt-1 text-xs text-slate-500">Admin / parent role के अनुसार available ID type चुनें।</p>
      <label className="mt-6 block text-xs font-black text-cyan-300">Select ID Role *</label>
      <select value={selected} onChange={e => setSelected(e.target.value as CreateRole)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold outline-none">
        <option value="">Select Role</option>{available.map(r => <option key={r.key} value={r.key}>{r.icon} {r.label} — ₹{r.fee.toLocaleString('en-IN')}</option>)}
      </select>
      {([['Applicant Full Name *', name, setName, 'text'],['Mobile Number *', mobile, setMobile, 'tel'],['Email', email, setEmail, 'email'],['Login Username / ID *', username, setUsername, 'text'],['Login Password *', password, setPassword, 'password']] as const).map(([label,value,setter,type]) => <div key={label} className="mt-4"><label className="mb-2 block text-xs font-black text-slate-300">{label}</label><input type={type} value={value} onChange={e => setter(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none focus:border-cyan-400" /></div>)}
      <div className="mt-5"><label className="mb-2 block text-xs font-black text-cyan-300">Payment UTR / Transaction Reference *</label><input inputMode="numeric" value={utr} onChange={e => setUtr(e.target.value.replace(/\D/g, ''))} maxLength={50} placeholder="Payment के बाद UTR डालें" className="w-full rounded-xl border border-emerald-400/20 bg-slate-800 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-400" /></div>
      <button type="submit" disabled={busy || !config} className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-sm font-black disabled:opacity-40">{busy ? 'Submitting...' : config ? `Submit ${config.label} Request ₹${config.fee.toLocaleString('en-IN')}` : 'Select ID Role First'}</button>
      {message && <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-xs text-emerald-300">✅ {message}</div>}
    </form>
    <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-[#0b1324] to-[#071020] p-6 text-center shadow-2xl">
      <div className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Dynamic UPI Payment</div>
      <h2 className="mt-3 text-xl font-black">📱 Scan & Pay</h2>
      <div className="mt-6 flex justify-center"><div className="rounded-3xl bg-white p-5">{qr ? <QRCodeSVG value={qr} size={250} level="M" includeMargin /> : <div className="grid h-[250px] w-[250px] place-items-center bg-slate-100 text-xs font-bold text-slate-500">पहले ID Role Select करें</div>}</div></div>
      <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5"><div className="text-[10px] uppercase tracking-widest text-slate-500">Payable Amount</div><div className="mt-1 text-4xl font-black text-emerald-300">₹{config ? config.fee.toLocaleString('en-IN') : '0'}</div>{config && <div className="mt-1 text-xs text-slate-500">{config.label} ID Creation Fee</div>}</div>
      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4"><div className="text-[10px] uppercase tracking-widest text-slate-600">Pay To UPI ID</div><div className="mt-2 break-all text-sm font-black text-cyan-300">{UPI_ID}</div><button type="button" onClick={() => navigator.clipboard.writeText(UPI_ID).then(() => alert('UPI ID copied successfully.'))} className="mt-3 rounded-lg border border-cyan-400/20 px-4 py-2 text-xs font-black text-cyan-300">Copy UPI ID</button></div>
    </div>
  </div>;
}
