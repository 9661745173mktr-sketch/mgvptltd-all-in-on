'use client';
import React, { useState, useEffect } from 'react';

export default function AdminServicePage() {
  const [requests, setRequests] = useState<any[]>([]);

  const loadData = () => {
    const data = JSON.parse(localStorage.getItem('all_services_data') || '[]');
    setRequests(data);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const approveRequest = (id: number) => {
    const updated = requests.map(r => r.id === id ? { ...r, status: 'Approved' } : r);
    localStorage.setItem('all_services_data', JSON.stringify(updated));
    setRequests(updated);
    alert('Request Approved!');
  };

  return (
    <div style={{ padding: '20px', color: '#fff' }}>
      <h1>Admin: Pending Service Requests ({requests.filter(r => r.status === 'Pending').length})</h1>
      {requests.filter(r => r.status === 'Pending').map((req) => (
        <div key={req.id} style={{ background: '#1e293b', margin: '10px 0', padding: '15px', borderRadius: '8px' }}>
          <p><strong>{req.serviceTitle}</strong> | Retailer: {req.retailerName} | Fee: ₹{req.fee}</p>
          <button onClick={() => approveRequest(req.id)} style={{ background: '#10b981', padding: '5px 15px', border: 'none', color: '#fff', borderRadius: '5px' }}>Approve ✅</button>
        </div>
      ))}
    </div>
  );
}