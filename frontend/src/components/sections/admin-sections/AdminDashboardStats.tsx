'use client';
import React, { useState, useEffect } from 'react';

export default function AdminDashboardStats({ requests }: { requests: Array<any> }) {
  const [totalWallet, setTotalWallet] = useState(400);

  useEffect(() => {
    const saved = localStorage.getItem('retailerWalletBalance');
    if (saved) setTotalWallet(parseFloat(saved));
  }, []);

  const totalRevenue = requests.reduce((acc, curr) => {
    const fee = parseFloat(curr.fee?.replace(/[^0-9.]/g, '') || '0');
    return acc + (curr.status === 'Approved' ? fee : 0);
  }, 0);

  return (
    <div>
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '6px' }}>Master Admin Dashboard</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Real-time analytics and network hierarchy tracking across all panels.</p>
      </div>

      {/* Main Financial Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <StatCard title="Total Revenue (Approved)" value={`₹${totalRevenue.toFixed(2)}`} color="#38bdf8" icon="📈" />
        <StatCard title="Total Merged Requests" value={requests.length.toString()} color="#4ade80" icon="📋" />
        <StatCard title="Total Wallet Pool" value={`₹${totalWallet.toFixed(2)}`} color="#f59e0b" icon="💳" />
        <StatCard title="Pending Verifications" value={requests.filter(r => r.status === 'Pending').length.toString()} color="#ef4444" icon="⏳" />
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: '850', color: '#f8fafc', marginBottom: '15px' }}>Network Hierarchy Overview</h3>
      
      {/* Hierarchy Level Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <StatCard title="Master Distributors" value="02 Active" color="#6366f1" icon="🌐" />
        <StatCard title="Super Distributors" value="08 Active" color="#8b5cf6" icon="⭐" />
        <StatCard title="Distributors" value="24 Active" color="#0ea5e9" icon="🏢" />
        <StatCard title="Retailers" value="142 Active" color="#ec4899" icon="👤" />
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon }: { title: string; value: string; color: string; icon: string }) {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold' }}>{title}</span>
        <span style={{ fontSize: '18px' }}>{icon}</span>
      </div>
      <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#f8fafc', margin: 0 }}>{value}</h2>
    </div>
  );
}