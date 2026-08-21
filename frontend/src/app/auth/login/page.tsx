'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { addAdminNotification, findUser, readUsers, saveUsers, setCurrentUser, type PortalUser } from '../../utils/authStore';
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

  // Login states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Signup states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('retailer');
  const [utr, setUtr] = useState('');
  const [signupPaymentMethod, setSignupPaymentMethod] = useState<'razorpay'|'razorpay_qr'|'upi'>('razorpay');
  const [signupQr, setSignupQr] = useState<any>(null);

  const currentFee = ROLE_FEES[selectedRole];
  const upiPayload = `upi://pay?pa=${encodeURIComponent(COMPANY_UPI_ID)}&pn=${encodeURIComponent(COMPANY_NAME)}&am=${currentFee.toFixed(2)}&cu=INR`;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      alert('कृपया मोबाइल नंबर/ईमेल और पासवर्ड दर्ज करें।');
      return;
    }

    const user = findUser(identifier, password);
    if (!user) {
      alert('Invalid credentials. कृपया सही Email/Mobile और Password डालें।');
      return;
    }

    if (String(user.accountStatus).toLowerCase() !== 'active' || String(user.paymentStatus).toLowerCase() !== 'verified') {
      alert('आपकी ID अभी DEACTIVE / PENDING VERIFICATION है। Admin payment verify करके ID ACTIVE करेगा, उसके बाद ही login होगा।');
      return;
    }

    setCurrentUser(user);
    window.dispatchEvent(new Event('storage'));
    alert(`Welcome ${user.name}! Login सफल रहा। 🚀`);
    router.push('/dashboard');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim() || !signupPassword) { alert('कृपया Name, Mobile, Gmail/Email और Password सभी भरें।'); return; }
    if (!/^\d{10}$/.test(phone.trim())) { alert('कृपया 10 digit mobile number दर्ज करें।'); return; }
    if (signupPaymentMethod==='upi' && !utr.trim()) { alert('UPI payment के बाद UTR दर्ज करें।'); return; }
    const users=readUsers(); if(users.some(u=>String(u.email).toLowerCase()===email.trim().toLowerCase()||String(u.phone)===phone.trim())){alert('इस Mobile या Email से पहले से ID मौजूद है।');return;}
    const now=new Date().toISOString(); const user:PortalUser={id:`${selectedRole}-${Date.now()}`,name:name.trim(),phone:phone.trim(),email:email.trim(),password:signupPassword,role:selectedRole,walletBalance:0,accountStatus:'Pending',paymentStatus:signupPaymentMethod==='upi'?'Pending':'Payment Pending',creationFee:currentFee,utr:utr.trim(),createdAt:now};
    try{
      const apiBase=process.env.NEXT_PUBLIC_API_URL||'http://localhost:5000';
      const rr=await fetch(`${apiBase}/api/auth/register`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:user.id,email:user.email,password:user.password,role:user.role,name:user.name,phone:user.phone})});
      const rd=await rr.json(); if(!rr.ok) throw new Error(rd.error||'Server registration failed');
      saveUsers([user,...users]);
      const existingReqs=(()=>{try{const x=JSON.parse(localStorage.getItem('id_creation_requests_db')||'[]');return Array.isArray(x)?x:[]}catch{return[];}})();
      const requestObj:any={id:`REQ-${Date.now()}`,userId:user.id,applicantName:user.name,applicantPhone:user.phone,applicantEmail:user.email,role:selectedRole,amount:currentFee,utr:user.utr,paymentMethod:signupPaymentMethod,paymentStatus:signupPaymentMethod==='upi'?'Pending Verification':'Payment Pending',accountStatus:'Pending',status:'Pending',walletBalance:0,date:new Date().toLocaleDateString('en-IN'),timestamp:now};
      localStorage.setItem('id_creation_requests_db',JSON.stringify([requestObj,...existingReqs]));
      addAdminNotification({type:'ID_CREATION',title:'New User ID Created',message:`${user.name} ने ${ROLE_LABELS[selectedRole]} ID create की है। ${signupPaymentMethod==='upi'?'UTR verify':'Razorpay payment verify'} करके ID ACTIVE करें।`,userId:user.id,applicantName:user.name,mobile:user.phone,email:user.email,utr:user.utr,status:'Unread'}); window.dispatchEvent(new Event('id_creation_updated'));
      if(signupPaymentMethod==='razorpay'){ await openRazorpayIdCheckout({amount:currentFee,userId:user.id,name:user.name,phone:user.phone,email:user.email,apiBase,onSuccess:(data)=>{const next=readUsers().map(u=>u.id===user.id?{...u,paymentStatus:'Paid',utr:data?.paymentId||u.utr}:u);saveUsers(next);alert('Razorpay payment successful. ID अभी DEACTIVE रहेगी; Admin verification के बाद ACTIVE होगी.');}}); }
      else if(signupPaymentMethod==='razorpay_qr'){ const qr=await createRazorpayQr({amount:currentFee,userId:user.id,purpose:'ID_CREATION',apiBase,description:`${ROLE_LABELS[selectedRole]} ID creation - ${user.name}`}); setSignupQr(qr); alert('Razorpay QR generate हो गया है। QR scan करके payment करें और UTR/Payment ID admin verification के लिए रखें।'); }
      else { alert(`🎉 ${user.name} की ID request submit हो गई है। अभी ID DEACTIVE है। Admin payment verify करके ACTIVE करेगा।`); setAuthMode('login'); setIdentifier(user.email); }
      setName('');setPhone('');setEmail('');setSignupPassword('');
    }catch(err:any){console.error(err);alert(err?.message||'Registration/payment process complete नहीं हुआ।');}
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#0b1329', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* 🌐 टॉप हेडर बार */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', background: '#070b14', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '20px', fontWeight: '900', color: '#38bdf8' }}>MG-PVT-LTD Portal</div>
        <div style={{ display: 'flex', gap: '25px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>
          <span style={{ cursor: 'pointer' }}>Home</span>
          <span style={{ cursor: 'pointer' }}>About Us</span>
          <span style={{ cursor: 'pointer' }}>Services</span>
          <span style={{ cursor: 'pointer' }}>Business Partners</span>
          <span style={{ cursor: 'pointer' }}>Contact</span>
        </div>
        <button onClick={() => setAuthMode('login')} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
          Member Login
        </button>
      </header>

      {/* 🚀 मुख्य हीरो सेक्शन */}
      <div style={{ padding: '50px 20px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', margin: '0 0 15px 0' }}>
          India No #1 Digital Print Portal for <span style={{ color: '#38bdf8' }}>Aadhaar, PAN, PVC & More</span>
        </h1>
        <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', maxWidth: '750px', margin: '0 auto 30px auto' }}>
          Aadhaar, PAN & PVC card printing + BBPS, AEPS, FASTag, Insurance & more. Secure invoices with instant commissions on a single print portal for retailers and VLEs.
        </p>

        {/* स्वागत बैनर */}
        <div style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(15,23,42,0.95) 100%)', border: '1px solid rgba(56,189,248,0.4)', borderRadius: '16px', padding: '25px', marginBottom: '35px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <h3 style={{ color: '#fbbf24', fontSize: '18px', fontWeight: '900', margin: '0 0 6px 0' }}>
            🛒 आप सभी दुकानदार भाइयों को {COMPANY_NAME} में स्वागत है!
          </h3>
          <p style={{ color: '#38bdf8', fontSize: '13px', fontWeight: '700', margin: '0 0 4px 0' }}>Official Advanced Services Portal</p>
          <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 15px 0' }}>हमारे यहां रिटेलर, डिस्ट्रीब्यूटर, सुपर डिस्ट्रीब्यूटर और मास्टर डिस्ट्रीब्यूटर पैनल उपलब्ध है।</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <a href={`https://wa.me/91${WHATSAPP_SUPPORT_NO}`} target="_blank" rel="noreferrer" style={{ background: '#25d366', color: '#fff', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              💬 WhatsApp Support: +91 {WHATSAPP_SUPPORT_NO}
            </a>
            <div style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
              📞 Helpline: +91 {WHATSAPP_SUPPORT_NO}
            </div>
          </div>
        </div>
      </div>

      {/* 🔐 लॉगिन / साइन-अप कार्ड बॉक्स */}
      <div style={{ width: '100%', maxWidth: '520px', margin: '0 auto 50px auto', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(56,189,248,0.35)', borderRadius: '20px', padding: '30px', boxShadow: '0 25px 50px rgba(0,0,0,0.8)', boxSizing: 'border-box' }}>
        
        {/* Toggle Tabs */}
        <div style={{ display: 'flex', background: '#1e293b', borderRadius: '10px', padding: '4px', marginBottom: '25px', border: '1px solid #334155' }}>
          <button type="button" onClick={() => setAuthMode('login')} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', background: authMode === 'login' ? '#db2777' : 'transparent', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>🔑 Login</button>
          <button type="button" onClick={() => setAuthMode('signup')} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', background: authMode === 'signup' ? '#db2777' : 'transparent', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>📝 Sign Up (Create ID)</button>
        </div>

        {authMode === 'login' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Email or Mobile Number</label>
              <input type="text" placeholder="Enter mobile or email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box', fontSize: '13px' }} required />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Password</label>
              <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box', fontSize: '13px' }} required />
            </div>
            <button type="submit" style={{ background: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', marginTop: '10px', boxShadow: '0 4px 15px rgba(219,39,119,0.4)' }}>Login to Portal 🚀</button>
          </form>
        ) : (
          /* SIGNUP FORM WITH DYNAMIC QR */
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Select Role Type *</label>
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as UserRole)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>
                <option value="master_distributor">Master Distributor (Fee: ₹4,999)</option>
                <option value="super_distributor">Super Distributor (Fee: ₹2,999)</option>
                <option value="distributor">Distributor (Fee: ₹1,999)</option>
                <option value="retailer">Retailer (Fee: ₹999)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Full Name *</label>
              <input type="text" placeholder="Enter full name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box', fontSize: '13px' }} required />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Mobile Number *</label>
              <input type="tel" placeholder="10 digit mobile" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box', fontSize: '13px' }} required />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Password *</label>
              <input type="password" placeholder="Create password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box', fontSize: '13px' }} required />
            </div>

            <div style={{background:'rgba(30,41,59,0.8)',borderRadius:12,padding:15,border:'1px solid #334155'}}>
              <div style={{fontSize:12,color:'#38bdf8',fontWeight:'bold',marginBottom:8}}>Payment Method</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                {([['razorpay','💳 Razorpay'],['razorpay_qr','▦ Razorpay QR'],['upi','📱 UPI + UTR']] as const).map(([v,l])=><button key={v} type="button" onClick={()=>{setSignupPaymentMethod(v);setSignupQr(null)}} style={{padding:'9px 5px',borderRadius:8,border:'1px solid '+(signupPaymentMethod===v?'#38bdf8':'#334155'),background:signupPaymentMethod===v?'rgba(56,189,248,.12)':'#0f172a',color:'#fff',fontSize:11,fontWeight:800}}>{l}</button>)}
              </div>
              <div style={{fontSize:10,color:'#94a3b8',marginTop:8}}>ID payment सफल होने के बाद भी account DEACTIVE रहेगा जब तक Admin verify करके Activate न करे।</div>
            </div>

            {signupPaymentMethod==='upi' && <div style={{background:'rgba(30,41,59,0.8)',borderRadius:12,padding:15,textAlign:'center',border:'1px solid #334155'}}>
              <div style={{fontSize:12,color:'#38bdf8',fontWeight:'bold',marginBottom:5}}>UPI QR • ₹{currentFee.toLocaleString('en-IN')}</div>
              <div style={{fontSize:10,color:'#94a3b8',marginBottom:10}}>UPI ID: {COMPANY_UPI_ID}</div>
              <div style={{background:'#fff',padding:10,borderRadius:10,display:'inline-block'}}><QRCodeSVG value={upiPayload} size={140} level="M" /></div>
              <input type="text" placeholder="Enter UTR after UPI payment" value={utr} onChange={e=>setUtr(e.target.value)} style={{width:'100%',marginTop:10,padding:11,borderRadius:8,background:'#1e293b',border:'1px solid #334155',color:'#fff',boxSizing:'border-box',fontSize:13}} required />
            </div>}
            {signupPaymentMethod==='razorpay_qr' && signupQr && <div style={{background:'#fff',borderRadius:12,padding:12,textAlign:'center'}}><QRCodeSVG value={signupQr.imageContent} size={190} includeMargin/><div style={{color:'#111',fontSize:11,fontWeight:800}}>Razorpay QR • ₹{currentFee.toLocaleString('en-IN')}</div></div>}
            {signupPaymentMethod==='razorpay_qr' && !signupQr && <div style={{fontSize:11,color:'#94a3b8',padding:8}}>Register button दबाने के बाद Razorpay single-use QR generate होगा।</div>}

            <button type="submit" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '13px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginTop: '5px' }}>Register & Submit ID 🚀</button>
          </form>
        )}

      </div>

      {/* ⚡ Portal Services Grid */}
      <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto 40px auto', padding: '0 20px', boxSizing: 'border-box' }}>
        <h3 style={{ textAlign: 'center', color: '#fbbf24', fontSize: '20px', fontWeight: '900', marginBottom: '25px' }}>All Your Recharges & Bills in One Print Portal Dashboard</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {PORTAL_SERVICES.map((srv, idx) => (
            <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(10px)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 8px 25px rgba(0,0,0,0.4)' }}>
              <span style={{ fontSize: '26px', background: 'rgba(56,189,248,0.1)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(56,189,248,0.2)' }}>{srv.icon}</span>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#f8fafc', margin: '0 0 4px 0' }}>{srv.title}</h4>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>{srv.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', width: '100%' }}>
        {COMPANY_NAME} Print & Digital Service Portal © 2026 | All Rights Reserved.
      </footer>

    </div>
  );
}