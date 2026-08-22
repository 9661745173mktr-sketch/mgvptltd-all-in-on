'use client';
import React from 'react';

export default function SettingsPassword() {
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Password updated successfully! 🔒');
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '30px', maxWidth: '500px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '15px' }}>🔒 Password Settings</h2>
      <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Current Password / वर्तमान पासवर्ड</label>
          <input type="password" placeholder="Enter current password" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#131c31', border: '1px solid #334155', color: '#fff', fontSize: '14px', outline: 'none' }} required />
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>New Password / नया पासवर्ड</label>
          <input type="password" placeholder="Enter new password" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#131c31', border: '1px solid #334155', color: '#fff', fontSize: '14px', outline: 'none' }} required />
        </div>
        <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
          Update Password / पासवर्ड बदलें 🔒
        </button>
      </form>
    </div>
  );
}