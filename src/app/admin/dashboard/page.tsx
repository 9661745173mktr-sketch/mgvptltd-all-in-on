'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ users: 0, pendingUsers: 0, activeUsers: 0, requests: 0, pendingRequests: 0, approvedRequests: 0, rejectedRequests: 0, totalWallet: 0, totalRevenue: 0, totalWalletTransactions: 0 });
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return router.replace('/admin/login');
      const res = await fetch(`${API_BASE}/api/admin/stats`, { headers: { 'x-admin-token': token } });
      const data = await res.json();
      if (res.status === 401) { localStorage.removeItem('adminToken'); return router.replace('/admin/login'); }
      if (!res.ok) throw new Error(data.error || 'Unable to load dashboard stats.');
      setStats(data.stats || {});
      setError('');
    } catch (e: any) { setError(e.message || 'Unable to load live dashboard.'); }
  };

  useEffect(() => {
    loadStats();
    const timer = window.setInterval(loadStats, 15000);
    return () => window.clearInterval(timer);
  }, []);

  const cards = [
    ['Total Users', stats.users, '#38bdf8', '👥'],
    ['Pending ID Approval', stats.pendingUsers, '#f59e0b', '⏳'],
    ['Active Users', stats.activeUsers, '#10b981', '✅'],
    ['Total Service Requests', stats.requests, '#a78bfa', '📋'],
    ['Pending Requests', stats.pendingRequests, '#fb923c', '📥'],
    ['Approved Requests', stats.approvedRequests, '#34d399', '✔️'],
    ['Rejected Requests', stats.rejectedRequests, '#f87171', '❌'],
    ['Total Wallet Balance', `₹${Number(stats.totalWallet || 0).toLocaleString('en-IN')}`, '#60a5fa', '💳'],
    ['Approved Service Revenue', `₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN')}`, '#22d3ee', '📈'],
  ];

  const nav = [
    ['/admin/service-requests', '📥 Service Requests', 'Approve/reject requests and refund wallet automatically'],
    ['/admin/wallet-requests', '💰 Wallet & UTR', 'Approve/reject recharge requests and manually credit wallets'],
    ['/admin/users', '👥 User Management', 'Real name, mobile, email, role and account approval'],
    ['/admin/user-hierarchy', '🌐 User Hierarchy', 'Role-based partner creation and hierarchy'],
    ['/admin/aadhaar-requests', '🆔 Aadhaar Service Control', 'Review retailer Aadhaar-related requests'],
    ['/admin/wallet-transactions', '📊 Wallet Transactions', 'View portal-wide wallet transaction history'],
    ['/admin/services-control', '⚙️ Master Services Control', 'Manage service availability and pricing'],
    ['/admin/super-chat', '💬 Super Chat', 'Retailer support messages and admin replies'],
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '25px', color: '#fff', fontFamily: 'Inter, Arial, sans-serif', background: '#050914' }}>
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>Master Admin Control Center</h1>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '5px 0 0' }}>Live database statistics and complete portal controls.</p>
      </div>

      {error && <div style={{ background: '#3f1d1d', border: '1px solid #ef4444', color: '#fecaca', padding: '12px 15px', borderRadius: '10px', marginBottom: '20px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '30px' }}>
        {cards.map(([title, value, accent, icon]) => <div key={String(title)} style={{ background: '#0f172a', border: '1px solid #1e293b', borderLeft: `4px solid ${accent}`, borderRadius: '14px', padding: '18px' }}><div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px', fontWeight: 700 }}><span>{title}</span><span>{icon}</span></div><div style={{ marginTop: '10px', fontSize: '24px', fontWeight: 900, color: '#f8fafc' }}>{value}</div></div>)}
      </div>

      <h2 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '15px', color: '#f8fafc' }}>🚀 Quick Navigation & Management</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {nav.map(([href, title, description]) => <button key={href} onClick={() => router.push(href)} style={{ textAlign: 'left', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '18px', cursor: 'pointer', color: '#fff' }}><div style={{ fontSize: '14px', fontWeight: 800, color: '#38bdf8', marginBottom: '6px' }}>{title}</div><div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>{description}</div></button>)}
      </div>
    </div>
  );
}
