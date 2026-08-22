'use client';
import React from 'react';

export default function WalletLoadRequests({ transferForm, setTransferForm, handleDirectTransfer, walletRequests, handleWalletRequestAction }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '25px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '15px' }}>💸 Direct Balance Transfer</h2>
        <form onSubmit={handleDirectTransfer} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Recipient Mobile *</label>
            <input type="text" placeholder="10-digit mobile" value={transferForm.recipientPhone} onChange={(e) => setTransferForm({...transferForm, recipientPhone: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '13px' }} required />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Amount (₹) *</label>
            <input type="number" placeholder="Enter amount" value={transferForm.amount} onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '13px' }} required />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Remarks</label>
            <input type="text" placeholder="Optional remark" value={transferForm.remarks} onChange={(e) => setTransferForm({...transferForm, remarks: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontSize: '13px' }} />
          </div>
          <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>Transfer 🚀</button>
        </form>
      </div>

      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '25px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '15px' }}>💳 Pending Wallet Load Requests</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {walletRequests.map((wr: any) => (
            <div key={wr.id} style={{ background: '#1e293b', padding: '16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#fff' }}>User: {wr.user} ({wr.phone})</div>
                <div style={{ fontSize: '12px', color: '#4ade80' }}>Requested Amount: ₹{wr.amount.toFixed(2)} via {wr.mode}</div>
              </div>
              {wr.status === 'Pending' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleWalletRequestAction(wr.id, 'Approved', wr.phone, wr.amount)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Approve</button>
                  <button onClick={() => handleWalletRequestAction(wr.id, 'Rejected', wr.phone, wr.amount)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Reject</button>
                </div>
              ) : (
                <span style={{ color: wr.status === 'Approved' ? '#4ade80' : '#ef4444', fontWeight: 'bold', fontSize: '13px' }}>{wr.status}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}