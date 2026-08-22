'use client';
import React, { useState } from 'react';

export default function RetailerWalletLoadPage() {
  const [utrNumber, setUtrNumber] = useState('');

  const handleSubmitUTR = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!utrNumber || utrNumber.length < 6) {
      alert('Please enter a valid 12-digit UTR / Reference No');
      return;
    }

    // नया रिक्वेस्ट ऑब्जेक्ट बनाएँ
    const newRequest = {
      id: Date.now(),
      retailerName: 'SANJAY KUMAR',
      mobile: '9267916288',
      amount: '₹600', // जो स्क्रीनशॉट के अनुसार है
      utr: utrNumber,  // यूटीआर नंबर ठीक से सेव हो रहा है
      status: 'Pending',
      timestamp: new Date().toISOString()
    };

    // localStorage से पुरानी लिस्ट निकालें और नई जोड़ें
    const existingRequests = JSON.parse(localStorage.getItem('walletRequests') || '[]');
    const updatedRequests = [newRequest, ...existingRequests];
    
    localStorage.setItem('walletRequests', JSON.stringify(updatedRequests));

    // एडमिन पैनल को लाइव अपडेट भेजने के लिए इवेंट ट्रिगर करें
    window.dispatchEvent(new Event('storage'));

    alert('UTR submitted to Admin successfully! Balance will be added after admin verification.');
    setUtrNumber('');
  };

  return (
    <div style={{ color: '#fff', fontFamily: 'Inter, sans-serif', padding: '20px' }}>
      <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>Wallet Load / Add Money</h1>
      
      <div style={{ background: '#111827', padding: '30px', borderRadius: '16px', maxWidth: '450px', border: '1px solid #1f2937' }}>
        <h3 style={{ marginBottom: '15px', color: '#38bdf8' }}>Scan & Pay ₹600</h3>
        
        <form onSubmit={handleSubmitUTR} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>
              Enter 12-digit UTR / Reference No *
            </label>
            <input 
              type="text" 
              placeholder="e.g. 998877445556" 
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
              required 
            />
          </div>

          <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Submit UTR 🚀
          </button>
        </form>
      </div>
    </div>
  );
}
// update