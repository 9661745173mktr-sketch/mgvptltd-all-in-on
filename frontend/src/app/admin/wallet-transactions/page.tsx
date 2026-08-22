'use client';
import React, { useState, useEffect } from 'react';

export default function WalletTransactionsPage() {
  const [allTransactions, setAllTransactions] = useState<any[]>([]);

  const loadAllTransactions = () => {
    try {
      // अलग-अलग डेटाबेस से डेटा लें
      const walletReqs = JSON.parse(localStorage.getItem('wallet_requests_db') || '[]');
      const serviceReqs = JSON.parse(localStorage.getItem('service_requests_db') || '[]');
      
      // दोनों को एक साथ मर्ज करें
      const combined = [...walletReqs, ...serviceReqs].sort((a, b) => 
        new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime()
      );

      setAllTransactions(combined);
    } catch (e) {
      console.error(e);
      setAllTransactions([]);
    }
  };

  useEffect(() => {
    loadAllTransactions();
    window.addEventListener('storage', loadAllTransactions);
    return () => window.removeEventListener('storage', loadAllTransactions);
  }, []);

  return (
    <div style={{ padding: '25px', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#38bdf8', margin: 0 }}>Wallet & All Transactions</h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Monitor all wallet additions, deductions, and service transactions across users.</p>
        </div>
        <span style={{ background: '#1e293b', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>
          Total Transactions: {allTransactions.length}
        </span>
      </div>

      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', overflow: 'hidden' }}>
        {allTransactions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>कोई ट्रांजेक्शन हिस्ट्री उपलब्ध नहीं है।</div>
        ) : (
          allTransactions.map((tx, index) => (
            <div key={`${tx.id}-${index}`} style={{ padding: '18px 22px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#f8fafc' }}>
                  {tx.retailerName || 'Retailer'} <span style={{ color: '#38bdf8', fontSize: '13px' }}>({tx.mobile || 'N/A'})</span>
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                  {tx.serviceName ? `Service: ${tx.serviceName}` : `Type: Wallet Load`} | Ref: {tx.utr || tx.id || 'N/A'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Date: {tx.date || 'N/A'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: tx.status === 'Rejected' ? '#ef4444' : '#10b981' }}>
                  {tx.status === 'Rejected' ? '-' : '+'}₹{tx.amount || tx.fee || '0'}
                </div>
                <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold', background: tx.status === 'Approved' || tx.status === 'Accepted' ? '#10b98122' : '#ef444422', color: tx.status === 'Approved' || tx.status === 'Accepted' ? '#10b981' : '#ef4444' }}>
                  {tx.status || 'Processed'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}