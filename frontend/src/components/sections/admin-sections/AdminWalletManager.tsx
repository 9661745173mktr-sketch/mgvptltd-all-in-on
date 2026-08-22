'use client';
import React, { useState, useEffect } from 'react';

export default function AdminWalletManager() {
  const [targetUser, setTargetUser] = useState('');
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [transactions, setTransactions] = useState<Array<any>>([
    { id: 'tx-101', user: 'Rajesh Kumar (Retailer)', type: 'Credit (Wallet Load)', amount: '+₹500.00', date: '2026-08-18 11:15 AM', status: 'Success' },
    { id: 'tx-102', user: 'Amit Sharma (Distributor)', type: 'Credit (Wallet Load)', amount: '+₹2,500.00', date: '2026-08-18 01:45 PM', status: 'Success' }
  ]);

  const [retailerBalance, setRetailerBalance] = useState<number>(400.00);

  useEffect(() => {
    const saved = localStorage.getItem('retailerWalletBalance');
    if (saved) setRetailerBalance(parseFloat(saved));
  }, []);

  const handleAddBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const addAmt = parseFloat(amount);
    if (!addAmt || addAmt <= 0) {
      alert('Please enter a valid amount!');
      return;
    }

    const newBal = retailerBalance + addAmt;
    setRetailerBalance(newBal);
    localStorage.setItem('retailerWalletBalance', newBal.toString());

    const newTx = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      user: targetUser || 'General User / Retailer',
      type: 'Admin Manual Credit',
      amount: `+₹${addAmt.toFixed(2)}`,
      date: new Date().toLocaleString(),
      status: 'Success'
    };

    setTransactions([newTx, ...transactions]);
    setTargetUser('');
    setAmount('');
    setRemark('');
    alert(`Successfully added ₹${addAmt} to user wallet! 💳`);
  };

  return (
    <div>
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '6px' }}>Wallet & Transaction Manager</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Manually allocate balance, load wallets, and monitor platform transactions.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px' }}>
        
        {/* Left Box: Add Balance Form */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '25px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#38bdf8', marginBottom: '20px' }}>➕ Allocate / Add Wallet Balance</h3>
          <form onSubmit={handleAddBalance} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Target User (Name / Mobile / ID) *</label>
              <input type="text" required placeholder="e.g. Rajesh Kumar (9876543210)" value={targetUser} onChange={(e) => setTargetUser(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0b132b', border: '1px solid #334155', color: '#fff', outline: 'none' }} />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Amount to Add (₹) *</label>
              <input type="number" required placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0b132b', border: '1px solid #334155', color: '#fff', outline: 'none' }} />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Admin Remark / Note</label>
              <input type="text" placeholder="e.g. Offline cash received" value={remark} onChange={(e) => setRemark(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0b132b', border: '1px solid #334155', color: '#fff', outline: 'none' }} />
            </div>

            <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              Credit Balance to Wallet 🚀
            </button>
          </form>
        </div>

        {/* Right Box: Recent Transactions Table */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '25px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#f8fafc', marginBottom: '20px' }}>📊 Global Transaction History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                  <th style={{ padding: '10px' }}>Tx ID</th>
                  <th style={{ padding: '10px' }}>User</th>
                  <th style={{ padding: '10px' }}>Type</th>
                  <th style={{ padding: '10px' }}>Amount</th>
                  <th style={{ padding: '10px' }}>Date</th>
                  <th style={{ padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '10px', color: '#94a3b8' }}>#{tx.id}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#fff' }}>{tx.user}</td>
                    <td style={{ padding: '10px', color: '#cbd5e1' }}>{tx.type}</td>
                    <td style={{ padding: '10px', color: '#4ade80', fontWeight: 'bold' }}>{tx.amount}</td>
                    <td style={{ padding: '10px', color: '#94a3b8', fontSize: '11px' }}>{tx.date}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '3px 8px', borderRadius: '20px', fontWeight: 'bold', fontSize: '11px' }}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}