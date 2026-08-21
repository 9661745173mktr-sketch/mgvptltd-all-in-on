'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { setCurrentUser, type PortalUser } from '../../utils/authStore';
import { createRazorpayQr, openRazorpayIdCheckout } from '../../utils/razorpay';

type UserRole = 'master_distributor' | 'super_distributor' | 'distributor' | 'retailer';

const ROLE_FEES: Record<UserRole, number> = {
  master_distributor: 4999,
  super_distributor: 2999,
  distributor: 1999,
  retailer: 999,
};

const ROLE_LABELS: Record<UserRole, string> = {
  master_distributor: 'Master Distributor',
  super_distributor: 'Super Distributor',
  distributor: 'Distributor',
  retailer: 'Retailer',
};

const COMPANY_UPI_ID = '9661745173mktr-1@oksbi';
const COMPANY_NAME = 'MG PVT LTD';
const WHATSAPP_SUPPORT_NO = '9472902637';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';

const PORTAL_SERVICES = [
  { title: 'Mobile & DTH Recharge', desc: 'Instant prepaid & postpaid recharge with highest margins.', icon: '📱' },
  { title: 'Electricity & Gas Bill', desc: 'Pay utility bills instantly through Bharat BillPay.', icon: '⚡' },
  { title: 'AEPS Cash Withdrawal', desc: 'Aadhaar Enabled Payment System for micro-ATMs.', icon: '🏧' },
  { title: 'PAN Card Services', desc: 'Instant e-PAN card generation and correction.', icon: '💳' },
  { title: 'Aadhaar PVC & Print', desc: 'Order high-quality PVC Aadhaar cards securely.', icon: '🆔' },
  { title: 'Domestic Money Transfer', desc: 'Secure bank account transfers across India.', icon: '💸' },
  { title: 'GST Registration & Filing', desc: 'Complete GST management and return filing.', icon: '📄' },
  { title: 'E-Commerce & Digital SaaS', desc: 'Explore online shopping & digital utility tools.', icon: '🛒' },
];

export default function AuthPortalPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('retailer');
  const [utr, setUtr] = useState('');
  const [signupPaymentMethod, setSignupPaymentMethod] = useState<'razorpay'|'razorpay_qr'|'upi'>('razorpay');
  const [signupQr, setSignupQr] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const currentFee = ROLE_FEES[selectedRole];
  const upiPayload = `upi://pay?pa=${encodeURIComponent(COMPANY_UPI_ID)}&pn=${encodeURIComponent(COMPANY_NAME)}&am=${currentFee.toFixed(2)}&cu=INR`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) { alert('कृपया मोबाइल नंबर/ईमेल और पासवर्ड दर्ज करें।'); return; }
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: identifier, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');
      const user = data.user as PortalUser;
      if (String(user.accountStatus).toLowerCase() !== 'active' || String(user.paymentStatus).toLowerCase() !== 'verified') {
        alert('आपकी ID अभी DEACTIVE / PENDING VERIFICATION है। Admin payment verify करके ID ACTIVE करेगा।');
        return;
      }
      setCurrentUser(user);
      window.dispatchEvent(new Event('storage'));
      alert(`Welcome ${user.name}! Login सफल रहा। 🚀`);
      router.push('/dashboard');
    } catch (err: any) {
      alert(err?.message || 'Login failed.');
    } finally { setBusy(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim() || !signupPassword) { alert('कृपया Name, Mobile, Gmail/Email और Password सभी भरें।'); return; }
    if (!/^\d{10}$/.test(phone.trim())) { alert('कृपया 10 digit mobile number दर्ज करें।'); return; }
    if (signupPaymentMethod === 'upi' && !utr.trim()) { alert('UPI payment के बाद UTR दर्ज करें।'); return; }
    setBusy(true);
    try {
      const rr = await fetch(`${API_BASE}/api/id-requests/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), email: email.trim(), password: signupPassword, role: selectedRole, utr: utr.trim(), paymentMethod: signupPaymentMethod }),
      });
      const rd = await rr.json();
      if (!rr.ok) throw new Error(rd.error || 'Server registration failed.');
      const serverUser = rd.user as PortalUser;
      const userId = serverUser.id;

      if (signupPaymentMethod === 'razorpay') {
        await openRazorpayIdCheckout({
          amount: currentFee,
          userId,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          apiBase: API_BASE,
          onSuccess: () => alert('Razorpay payment successful. ID अभी DEACTIVE रहेगी; Admin verification के बाद ACTIVE होगी.'),
        });
      } else if (signupPaymentMethod === 'razorpay_qr') {
        const qr = await createRazorpayQr({ amount: currentFee, userId, purpose: 'ID_CREATION', apiBase: API_BASE, description: `${ROLE_LABELS[selectedRole]} ID creation - ${name.trim()}` });
        setSignupQr(qr);
        alert('Razorpay QR generate हो गया है। Payment के बाद Admin verification करेगा।');
      } else {
        alert(`🎉 ${name.trim()} की ID request live database में submit हो गई है। अभी ID DEACTIVE है; Admin verification के बाद ACTIVE होगी।`);
        setAuthMode('login');
        setIdentifier(email.trim());
      }
      setName(''); setPhone(''); setEmail(''); setSignupPassword(''); setUtr('');
    } catch (err: any) {
      console.error(err); alert(err?.message || 'Registration/payment process complete नहीं हुआ।');
    } finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#0b1329', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', background: '#070b14', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '20px', fontWeight: '900', color: '#38bdf8' }}>MG-PVT-LTD Portal</div>
        <div style={{ display: 'flex', gap: '25px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}><span>Home</span><span>About Us</span><span>Services</span><span>Business Partners</span><span>Contact</span></div>
        <button onClick={() => setAuthMode('login')} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px' }}>Member Login</button>
      </header>

      <div style={{ padding: '50px 20px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', margin: '0 0 15px 0' }}>India No #1 Digital Print Portal for <span style={{ color: '#38bdf8' }}>Aadhaar, PAN, PVC & More</span></h1>
        <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', maxWidth: '750px', margin: '0 auto 30px auto' }}>Aadhaar, PAN & PVC card printing + BBPS, AEPS, FASTag, Insurance & more. Secure invoices with instant commissions on a single print portal for retailers and VLEs.</p>
        <div style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(15,23,42,0.95) 100%)', border: '1px solid rgba(56,189,248,0.4)', borderRadius: '16px', padding: '25px', marginBottom: '35px' }}>
          <h3 style={{ color: '#fbbf24', fontSize: '18px', fontWeight: '900', margin: '0 0 6px 0' }}>🛒 आप सभी दुकानदार भाइयों को {COMPANY_NAME} में स्वागत है!</h3>
          <p style={{ color: '#38bdf8', fontSize: '13px', fontWeight: '700', margin: '0 0 4px 0' }}>Official Advanced Services Portal</p>
          <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 15px 0' }}>हमारे यहां रिटेलर, डिस्ट्रीब्यूटर, सुपर डिस्ट्रीब्यूटर और मास्टर डिस्ट्रीब्यूटर पैनल उपलब्ध है।</p>
          <a href={`https://wa.me/91${WHATSAPP_SUPPORT_NO}`} target="_blank" rel="noreferrer" style={{ background: '#25d366', color: '#fff', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>💬 WhatsApp Support: +91 {WHATSAPP_SUPPORT_NO}</a>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '520px', margin: '0 auto 50px auto', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56,189,248,0.35)', borderRadius: '20px', padding: '30px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', background: '#1e293b', borderRadius: '10px', padding: '4px', marginBottom: '25px', border: '1px solid #334155' }}>
          <button type="button" onClick={() => setAuthMode('login')} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', background: authMode === 'login' ? '#db2777' : 'transparent', color: '#fff', fontWeight: 'bold' }}>🔑 Login</button>
          <button type="button" onClick={() => setAuthMode('signup')} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', background: authMode === 'signup' ? '#db2777' : 'transparent', color: '#fff', fontWeight: 'bold' }}>📝 Sign Up (Create ID)</button>
        </div>

        {authMode === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="text" placeholder="Enter mobile or email" value={identifier} onChange={e => setIdentifier(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} required />
            <input type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} required />
            <button type="submit" disabled={busy} style={{ background: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: busy ? 'wait' : 'pointer', fontSize: '15px' }}>{busy ? 'Please wait…' : 'Login to Portal 🚀'}</button>
          </form>
        ) : (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <select value={selectedRole} onChange={e => setSelectedRole(e.target.value as UserRole)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontWeight: 'bold' }}>
              <option value="master_distributor">Master Distributor (Fee: ₹4,999)</option><option value="super_distributor">Super Distributor (Fee: ₹2,999)</option><option value="distributor">Distributor (Fee: ₹1,999)</option><option value="retailer">Retailer (Fee: ₹999)</option>
            </select>
            <input type="text" placeholder="Full Name *" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} required />
            <input type="tel" placeholder="10 digit mobile *" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} required />
            <input type="email" placeholder="Gmail / Email *" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} required />
            <input type="password" placeholder="Create password *" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} required />
            <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: 12, padding: 15, border: '1px solid #334155' }}>
              <div style={{ fontSize: 12, color: '#38bdf8', fontWeight: 'bold', marginBottom: 8 }}>Payment Method</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {([['razorpay','💳 Razorpay'],['razorpay_qr','▦ Razorpay QR'],['upi','📱 UPI + UTR']] as const).map(([v,l]) => <button key={v} type="button" onClick={() => { setSignupPaymentMethod(v); setSignupQr(null); }} style={{ padding: '9px 5px', borderRadius: 8, border: '1px solid '+(signupPaymentMethod===v?'#38bdf8':'#334155'), background: signupPaymentMethod===v?'rgba(56,189,248,.12)':'#0f172a', color: '#fff', fontSize: 11, fontWeight: 800 }}>{l}</button>)}
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 8 }}>Payment सफल होने के बाद भी account DEACTIVE रहेगा जब तक Admin verify करके Activate न करे।</div>
            </div>
            {signupPaymentMethod === 'upi' && <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: 12, padding: 15, textAlign: 'center', border: '1px solid #334155' }}><div style={{ fontSize: 12, color: '#38bdf8', fontWeight: 'bold' }}>UPI QR • ₹{currentFee.toLocaleString('en-IN')}</div><div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 10 }}>UPI ID: {COMPANY_UPI_ID}</div><div style={{ background: '#fff', padding: 10, borderRadius: 10, display: 'inline-block' }}><QRCodeSVG value={upiPayload} size={140} level="M" /></div><input type="text" placeholder="Enter UTR after UPI payment" value={utr} onChange={e => setUtr(e.target.value)} style={{ width: '100%', marginTop: 10, padding: 11, borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} required /></div>}
            {signupPaymentMethod === 'razorpay_qr' && signupQr && <div style={{ background: '#fff', borderRadius: 12, padding: 12, textAlign: 'center' }}><QRCodeSVG value={signupQr.imageContent} size={190} includeMargin /><div style={{ color: '#111', fontSize: 11, fontWeight: 800 }}>Razorpay QR • ₹{currentFee.toLocaleString('en-IN')}</div></div>}
            {signupPaymentMethod === 'razorpay_qr' && !signupQr && <div style={{ fontSize: 11, color: '#94a3b8', padding: 8 }}>Register button दबाने के बाद Razorpay single-use QR generate होगा।</div>}
            <button type="submit" disabled={busy} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '13px', borderRadius: '10px', fontWeight: 'bold', cursor: busy ? 'wait' : 'pointer', fontSize: '14px' }}>{busy ? 'Submitting…' : 'Register & Submit ID 🚀'}</button>
          </form>
        )}
      </div>

      <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto 40px auto', padding: '0 20px', boxSizing: 'border-box' }}>
        <h3 style={{ textAlign: 'center', color: '#fbbf24', fontSize: '20px', fontWeight: '900', marginBottom: '25px' }}>All Your Recharges & Bills in One Print Portal Dashboard</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>{PORTAL_SERVICES.map((srv, idx) => <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}><span style={{ fontSize: '26px', background: 'rgba(56,189,248,0.1)', padding: '10px', borderRadius: '10px' }}>{srv.icon}</span><div><h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#f8fafc', margin: '0 0 4px 0' }}>{srv.title}</h4><p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{srv.desc}</p></div></div>)}</div>
      </div>
      <footer style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', width: '100%' }}>{COMPANY_NAME} Print & Digital Service Portal © 2026 | All Rights Reserved.</footer>
    </div>
  );
}
