'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if ((username === 'admin' || username === 'admin@mg.com') && password === 'admin123') {
      localStorage.setItem('isAdminLoggedIn', 'true');
      alert('Admin Login Successful! 🛡️');
      router.push('/admin');
    } else {
      alert('Invalid Credentials! Use admin / admin123');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#090d16',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Glassmorphism Card */}
      <div style={{
        background: '#111827',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.9)',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '60px', height: '60px', background: '#10b981',
            borderRadius: '15px', margin: '0 auto 15px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '26px', color: '#fff'
          }}>
            🛡️
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff', margin: '0 0 5px 0' }}>
            MG-PVT-LTD Admin
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Master Control Portal
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Admin Username / Email</label>
            <input 
              type="text" 
              placeholder="admin" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: '#1f2937', border: '1px solid #374151', color: '#fff', outline: 'none', boxSizing: 'border-box' }} 
              required 
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Password</label>
            <input 
              type="password" 
              placeholder="admin123" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: '#1f2937', border: '1px solid #374151', color: '#fff', outline: 'none', boxSizing: 'border-box' }} 
              required 
            />
          </div>

          <button type="submit" style={{
            marginTop: '10px', padding: '14px', borderRadius: '10px', border: 'none',
            background: '#10b981', color: '#fff', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer'
          }}>
            Admin Secure Sign In 🚀
          </button>
        </form>
      </div>
    </div>
  );
}