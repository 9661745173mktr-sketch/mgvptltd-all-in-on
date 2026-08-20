'use client';
import React, { useState, useEffect } from 'react';

export default function AdminServiceRequests() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    // LocalStorage से डेटा लोड करना (अगर नहीं है तो डमी डेटा दिखाना ताकि टेबल खाली न रहे)
    const loadRequests = () => {
      const saved = localStorage.getItem('serviceRequests');
      if (saved) {
        setRequests(JSON.parse(saved));
      } else {
        const initial = [
          { id: 1, serviceName: 'Mobile No Update', clientName: 'demo', mobile: '8544284429', fee: '₹150', status: 'Pending' }
        ];
        localStorage.setItem('serviceRequests', JSON.stringify(initial));
        setRequests(initial);
      }
    };
    loadRequests();
  }, []);

  const handleAction = (id: number, newStatus: string) => {
    const updated = requests.map(req => 
      req.id === id ? { ...req, status: newStatus } : req
    );
    setRequests(updated);
    localStorage.setItem('serviceRequests', JSON.stringify(updated));
    
    // साइडबार काउंटर को तुरंत अपडेट करने के लिए इवेंट ट्रिगर करना
    window.dispatchEvent(new Event('storage'));
    
    alert(`Request ${newStatus} successfully!`);
  };

  const pendingCount = requests.filter(r => r.status === 'Pending').length;

  return (
    <div style={{ color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>All Merged Service Requests</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Review, approve, reject or refund service requests</p>
        </div>
        <div style={{ background: 'rgba(56, 189, 248, 0.150)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '8px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', color: '#38bdf8' }}>
          Pending Total: {pendingCount}
        </div>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(15px)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(30, 41, 59, 0.5)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '13px', color: '#94a3b8' }}>
              <th style={{ padding: '16px' }}>Service Name</th>
              <th style={{ padding: '16px' }}>Client Name</th>
              <th style={{ padding: '16px' }}>Mobile</th>
              <th style={{ padding: '16px' }}>Fee</th>
              <th style={{ padding: '16px' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>Action Control</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No Service Requests Found</td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '14px' }}>
                  <td style={{ padding: '16px', fontWeight: '600' }}>{req.serviceName}</td>
                  <td style={{ padding: '16px', color: '#cbd5e1' }}>{req.clientName}</td>
                  <td style={{ padding: '16px', color: '#cbd5e1' }}>{req.mobile}</td>
                  <td style={{ padding: '16px', color: '#38bdf8', fontWeight: 'bold' }}>{req.fee}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                      background: req.status === 'Approved' ? 'rgba(16, 185, 129, 0.2)' : req.status === 'Rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                      color: req.status === 'Approved' ? '#10b981' : req.status === 'Rejected' ? '#ef4444' : '#eab308',
                      border: `1px solid ${req.status === 'Approved' ? 'rgba(16, 185, 129, 0.4)' : req.status === 'Rejected' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(234, 179, 8, 0.4'}`
                    }}>
                      {req.status || 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {req.status === 'Pending' || !req.status ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => handleAction(req.id, 'Approved')}
                          style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Approve ✅
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, 'Rejected')}
                          style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Reject ❌
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>Completed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}