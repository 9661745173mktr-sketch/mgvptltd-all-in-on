'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RetailerPortal() {
  const [isSignup, setIsSignup] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const router = useRouter();

  const handleRetailerAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('appUsers') || '[]');

    if (isSignup) {
      if (!name || !phone || !password) {
        alert('Please fill all fields to create ID!');
        return;
      }
      const newUser = { name, phone, password, walletBalance: '0' };
      users.push(newUser);
      localStorage.setItem('appUsers', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      localStorage.setItem('isLoggedIn', 'true');
      alert('Retailer ID Created Successfully! 🚀');
      router.push('/dashboard');
    } else {
      const foundUser = users.find((u: any) => (u.phone === identifier || u.email === identifier) && u.password === password);
      if (foundUser || (identifier === '9267916288' && password === '123456')) {
        const activeRetailer = foundUser || { name: 'SANJAY KUMAR', phone: '9267916288', walletBalance: '400' };
        localStorage.setItem('currentUser', JSON.stringify(activeRetailer));
        localStorage.setItem('isLoggedIn', 'true');
        alert('Retailer Login Successful! 🌟');
        router.push('/dashboard');
      } else {
        alert('Invalid Credentials or Please Create an ID first!');
      }
    }
  };

  const handleForgotPassword = () => {
    const inputPhone = prompt('Enter your registered Mobile Number for password recovery:');
    if (!inputPhone) return;
    const users = JSON.parse(localStorage.getItem('appUsers') || '[]');
    const user = users.find((u: any) => u.phone === inputPhone);
    if (user) {
      alert(`Your Password is: ${user.password}`);
    } else {
      alert('Mobile number not found in database!');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px'
    }}>
      {/* 3D Glowing Animated Background Orbs */}
      <div style={{
        position: 'absolute', width: '500px', height: '500px',
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        filter: 'blur(100px)', borderRadius: '50%', top: '-15%', left: '-15%',
        animation: 'pulseGlow 6s infinite alternate', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', width: '500px', height: '500px',
        background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
        filter: 'blur(100px)', borderRadius: '50%', bottom: '-15%', right: '-15%',
        animation: 'pulseGlow 8s infinite alternate-reverse', zIndex: 0
      }} />

      {/* Glassmorphism 3D Box */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(25px)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '440px',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.15)',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{
            width: '65px', height: '65px', background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
            borderRadius: '18px', margin: '0 auto 15px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '28px', fontWeight: '900', color: '#fff',
            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.5)'
          }}>
            MG
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', margin: '0 0 5px 0' }}>
            MG-PVT-LTD Retailer
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            {isSignup ? 'Create your new Retailer ID' : 'Retailer Portal Login'}
          </p>
        </div>

        {/* Toggle between Login and Signup */}
        <div style={{ display: 'flex', background: '#1e293b', borderRadius: '12px', padding: '4px', marginBottom: '20px', border: '1px solid #334155' }}>
          <button type="button" onClick={() => setIsSignup(false)} style={{
            flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
            background: !isSignup ? '#2563eb' : 'transparent', color: !isSignup ? '#fff' : '#94a3b8',
            fontWeight: 'bold', cursor: 'pointer', transition: '0.3s'
          }}>Login</button>
          <button type="button" onClick={() => setIsSignup(true)} style={{
            flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
            background: isSignup ? '#2563eb' : 'transparent', color: isSignup ? '#fff' : '#94a3b8',
            fontWeight: 'bold', cursor: 'pointer', transition: '0.3s'
          }}>Create ID</button>
        </div>

        <form onSubmit={handleRetailerAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isSignup && (
            <>
              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '5px', fontWeight: '600' }}>Full Name</label>
                <input type="text" placeholder="Enter full name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', outline: 'none' }} required />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '5px', fontWeight: '600' }}>Mobile Number</label>
                <input type="text" placeholder="Enter mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', outline: 'none' }} required />
              </div>
            </>
          )}

          {!isSignup && (
            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '5px', fontWeight: '600' }}>Mobile Number / Email</label>
              <input type="text" placeholder="Enter mobile or email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', outline: 'none' }} required />
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '5px', fontWeight: '600' }}>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', outline: 'none' }} required />
          </div>

          <button type="submit" style={{
            marginTop: '10px', padding: '14px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)', color: '#fff',
            fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(56, 189, 248, 0.4)'
          }}>
            {isSignup ? 'Register New ID 🚀' : 'Retailer Login 🌟'}
          </button>
        </form>

        {!isSignup && (
          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <button onClick={handleForgotPassword} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>
              Forgot Password?
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#64748b' }}>
          MG-PVT-LTD Retailer Security &copy; 2026
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulseGlow {
          0% { transform: scale(1) translate(0, 0); opacity: 0.6; }
          50% { transform: scale(1.1) translate(15px, -15px); opacity: 0.9; }
          100% { transform: scale(1) translate(0, 0); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}