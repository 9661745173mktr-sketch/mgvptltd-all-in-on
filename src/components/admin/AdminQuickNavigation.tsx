'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function AdminQuickNavigation() {
  const router = useRouter();

  return (
    <div>
      <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', marginBottom: '15px' }}>🚀 Quick Navigation & Management</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        <div 
          onClick={() => router.push('/admin/wallet-requests')}
          style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px', cursor: 'pointer', transition: '0.2s' }}
        >
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '6px' }}>💰 Wallet Requests</div>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Approve or reject retailer UTR loads</p>
        </div>

        <div 
          onClick={() => router.push('/admin/user-hierarchy')}
          style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px', cursor: 'pointer', transition: '0.2s' }}
        >
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '6px' }}>👥 User Hierarchy</div>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Manage distributors & retailers</p>
        </div>

        <div 
          onClick={() => router.push('/admin/wallet-transactions')}
          style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px', cursor: 'pointer', transition: '0.2s' }}
        >
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '6px' }}>📊 All Transactions</div>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>View portal-wide financial logs</p>
        </div>

      </div>
    </div>
  );
}