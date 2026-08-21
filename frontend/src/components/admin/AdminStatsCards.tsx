'use client';
import React from 'react';

export default function AdminStatsCards({ walletBalance, totalUsers, pendingUtr, onAddMoney }: any) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '25px' }}>
      
      {/* वॉलेट कार्ड */}
      <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', border: '1px solid #38bdf8', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', color: '#e0f2fe', textTransform: 'uppercase' }}>Master Admin Liquidity Wallet</div>
        <div style={{ fontSize: '32px', fontWeight: '800', color: '#fff', margin: '10px 0' }}>
          ₹{walletBalance.toLocaleString('en-IN')}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
          <span style={{ fontSize: '11px', color: '#bae6fd' }}>🔓 Unlimited Balance Control</span>
          <button 
            onClick={onAddMoney}
            style={{ background: '#fff', color: '#0369a1', border: 'none', padding: '7px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
          >
            + Add Money
          </button>
        </div>
      </div>

      {/* टोटल रजिस्टर्ड यूजर्स कार्ड */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', color: '#94a3b8', textTransform: 'uppercase' }}>Total Registered Users</div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#fff', margin: '10px 0' }}>{totalUsers}</div>
        </div>
        <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🟢 Live Network Active
        </div>
      </div>

      {/* पेंडिंग यूटीआर रिक्वेस्ट्स कार्ड */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', color: '#94a3b8', textTransform: 'uppercase' }}>Pending UTR Requests</div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#f59e0b', margin: '10px 0' }}>{pendingUtr}</div>
        </div>
        <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ⚠️ Action Required
        </div>
      </div>

    </div>
  );
}