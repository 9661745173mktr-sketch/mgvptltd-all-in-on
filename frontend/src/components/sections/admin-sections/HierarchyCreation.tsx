'use client';
import React from 'react';

export default function HierarchyCreation({ users, setShowAddUserModal, handleDeleteUser, handleTransferBalance }: any) {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '25px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>👥 Hierarchy Management & Wallet Balances</h2>
        <button onClick={() => setShowAddUserModal(true)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>+ Create New ID</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Role / Level</th>
              <th style={{ padding: '12px' }}>Phone</th>
              <th style={{ padding: '12px' }}>Wallet Balance (Points)</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#fff' }}>{u.name}</td>
                <td style={{ padding: '12px', color: '#38bdf8' }}>{u.role}</td>
                <td style={{ padding: '12px', color: '#94a3b8' }}>{u.phone}</td>
                <td style={{ padding: '12px', color: '#4ade80', fontWeight: 'bold' }}>₹{u.balance.toFixed(2)}</td>
                <td style={{ padding: '12px' }}><span style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>{u.status}</span></td>
                <td style={{ padding: '12px', display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleTransferBalance(u)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>Transfer Balance</button>
                  <button onClick={() => handleDeleteUser(u.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}