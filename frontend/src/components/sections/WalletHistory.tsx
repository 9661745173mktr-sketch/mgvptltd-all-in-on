'use client';
import React, { useState } from 'react';

export default function WalletHistory() {
  const [walletHistory, setWalletHistory] = useState<Array<any>>([
    { id: '101', type: 'Credit (Wallet Top-up)', amount: '+₹400.00', date: '2026-08-18 10:00 AM', status: 'Success' }
  ]);

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '25px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '15px' }}>📊 Wallet Transaction History</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
              <th style={{ padding: '12px' }}>Transaction ID</th>
              <th style={{ padding: '12px' }}>Description</th>
              <th style={{ padding: '12px' }}>Amount</th>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {walletHistory.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '12px', color: '#94a3b8' }}>#{item.id}</td>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#f8fafc' }}>{item.type}</td>
                <td style={{ padding: '12px', color: item.amount.startsWith('+') ? '#4ade80' : '#ef4444', fontWeight: 'bold' }}>{item.amount}</td>
                <td style={{ padding: '12px', color: '#94a3b8' }}>{item.date}</td>
                <td style={{ padding: '12px' }}><span style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '11px' }}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}