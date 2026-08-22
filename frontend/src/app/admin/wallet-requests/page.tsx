'use client';
import React, { useState, useEffect } from 'react';

export default function AdminWalletRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [manualMobile, setManualMobile] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualRemark, setManualRemark] = useState('');

  const loadRequests = () => {
    try {
      const data = JSON.parse(localStorage.getItem('wallet_requests_db') || '[]');
      // नवीनतम रिक्वेस्ट को सबसे ऊपर दिखाने के लिए सॉर्ट करें
      const sortedData = data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRequests(sortedData);
    } catch (e) {
      console.error(e);
      setRequests([]);
    }
  };

  useEffect(() => {
    loadRequests();
    window.addEventListener('storage', loadRequests);
    window.addEventListener('wallet_updated', loadRequests);
    return () => {
      window.removeEventListener('storage', loadRequests);
      window.removeEventListener('wallet_updated', loadRequests);
    };
  }, []);

  // रिक्वेस्ट एक्सेप्ट करना और रिटेलर को पैसा भेजना
  const handleApprove = (id: number, amount: number) => {
    try {
      const updatedReqs = requests.map(req => req.id === id ? { ...req, status: 'Approved' } : req);
      localStorage.setItem('wallet_requests_db', JSON.stringify(updatedReqs));

      // रिटेलर के बैलेंस में पैसा जोड़ें
      const currentBal = parseFloat(localStorage.getItem('retailerWalletBalance') || '48950');
      const newBal = currentBal + amount;
      localStorage.setItem('retailerWalletBalance', newBal.toString());

      setRequests(updatedReqs);
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('wallet_updated'));
      alert(`✅ सफलता! ₹${amount} रिटेलर के वॉलेट में जोड़ दिए गए हैं।`);
    } catch (error) {
      console.error(error);
      alert('कुछ त्रुटि हुई!');
    }
  };

  // रिक्वेस्ट रिजेक्ट करना
  const handleReject = (id: number) => {
    const updatedReqs = requests.map(req => req.id === id ? { ...req, status: 'Rejected' } : req);
    localStorage.setItem('wallet_requests_db', JSON.stringify(updatedReqs));
    setRequests(updatedReqs);
    window.dispatchEvent(new Event('storage'));
    alert('❌ रिक्वेस्ट रिजेक्ट कर दी गई है!');
  };

  // डायरेक्ट मैन्युअल बैलेंस एडर
  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(manualAmount);
    if (!manualMobile || isNaN(amt) || amt <= 0) {
      alert('कृपया सही मोबाइल नंबर और राशि दर्ज करें।');
      return;
    }

    const newReq = {
      id: Date.now(),
      retailerName: 'Manual Load',
      mobile: manualMobile,
      amount: amt,
      utr: manualRemark || 'Admin Manual Load',
      status: 'Approved',
      date: new Date().toLocaleDateString(),
      timestamp: new Date().toISOString()
    };

    const updatedReqs = [newReq, ...requests];
    localStorage.setItem('wallet_requests_db', JSON.stringify(updatedReqs));

    const currentBal = parseFloat(localStorage.getItem('retailerWalletBalance') || '48950');
    localStorage.setItem('retailerWalletBalance', (currentBal + amt).toString());

    setRequests(updatedReqs);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('wallet_updated'));

    setManualMobile('');
    setManualAmount('');
    setManualRemark('');
    alert(`🚀 ₹${amt} मैन्युअल रूप से सफलतापूर्वक जोड़ दिए गए हैं!`);
  };

  const pendingReqs = requests.filter(r => r.status === 'Pending' || !r.status);
  const historyReqs = requests.filter(r => r.status && r.status !== 'Pending');

  return (
    <div style={{ padding: '25px', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#38bdf8', margin: 0 }}>Wallet Load & UTR Control Center</h1>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Approve retailer load requests or add balance directly to user wallets.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadRequests} style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
            🔄 Sync Data
          </button>
          <div style={{ background: '#1e293b', padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155', fontSize: '13px' }}>
            Pending Requests: <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '15px' }}>{pendingReqs.length}</span>
          </div>
        </div>
      </div>

      {/* डायरेक्ट मैन्युअल लोड */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#a855f7' }}>➕</span> Direct Admin Balance Adder (Manual Load)
        </h2>
        <form onSubmit={handleManualAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>User Mobile Number</label>
            <input type="text" placeholder="10 digit mobile number" value={manualMobile} onChange={e => setManualMobile(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Amount to Add (₹)</label>
            <input type="number" placeholder="Enter amount" value={manualAmount} onChange={e => setManualAmount(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Remarks (Optional)</label>
            <input type="text" placeholder="e.g. Cash given offline" value={manualRemark} onChange={e => setManualRemark(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', height: '40px' }}>
            Add Balance Now 🚀
          </button>
        </form>
      </div>

      {/* पेंडिंग रिक्वेस्ट सेक्शन */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f59e0b', marginBottom: '15px' }}>⏳ Pending UTR Load Requests ({pendingReqs.length})</h2>
        {pendingReqs.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No Pending Wallet Requests Found</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingReqs.map((req) => (
              <div key={req.id} style={{ background: '#1e293b', padding: '16px 20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #334155' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '15px' }}>{req.retailerName || 'Retailer'} <span style={{ color: '#38bdf8', fontSize: '13px' }}>({req.mobile})</span></div>
                  <div style={{ fontSize: '14px', color: '#10b981', marginTop: '4px', fontWeight: 'bold' }}>Requested Amount: ₹{req.amount}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>UTR / Ref: <span style={{ color: '#fff' }}>{req.utr}</span> | Date: {req.date}</div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleApprove(req.id, req.amount)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Approve ✅</button>
                  <button onClick={() => handleReject(req.id)} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Reject ❌</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* अप्रूव्ड / रिजेक्टेड हिस्ट्री */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#10b981', marginBottom: '15px' }}>📜 Processed Wallet History ({historyReqs.length})</h2>
        {historyReqs.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No history found</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {historyReqs.map((req) => (
              <div key={req.id} style={{ background: '#1e293b', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px' }}>{req.retailerName || 'Retailer'} <span style={{ color: '#38bdf8', fontSize: '12px' }}>({req.mobile})</span></div>
                  <div style={{ fontSize: '13px', color: req.status === 'Approved' ? '#10b981' : '#ef4444', marginTop: '2px' }}>Amount: ₹{req.amount} ({req.status})</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>UTR: {req.utr} | Date: {req.date}</div>
                </div>
                <span style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', background: req.status === 'Approved' ? '#10b98122' : '#ef444422', color: req.status === 'Approved' ? '#10b981' : '#ef4444' }}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}