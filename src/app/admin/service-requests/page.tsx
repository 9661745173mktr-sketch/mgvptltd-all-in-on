'use client';
import React, { useState, useEffect } from 'react';

export default function AdminServiceRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);

  const loadServiceRequests = () => {
    try {
      // लोकल स्टोरेज से डेटा प्राप्त करें
      const item = localStorage.getItem('service_requests_db') || localStorage.getItem('aadhaar_correction_db');
      let allData: any[] = [];

      if (item) {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed)) {
          allData = parsed;
        }
      }

      // id के आधार पर डुप्लीकेट डेटा को पूरी तरह फिल्टर करके हटाएं
      const uniqueData = allData.filter((v, i, a) => v && v.id && i === a.findIndex(t => t && t.id === v.id));

      if (uniqueData.length === 0) {
        const defaultRequests = [
          { id: 1, retailerName: 'SANJAY KUMAR', mobile: '9267916288', serviceName: 'Aadhaar Correction / PAN', status: 'Pending', date: '2026-08-19' },
          { id: 2, retailerName: 'AMIT KUMAR', mobile: '9876543210', serviceName: 'AEPS Cash Withdrawal', status: 'Pending', date: '2026-08-19' }
        ];
        setRequests(defaultRequests);
        localStorage.setItem('service_requests_db', JSON.stringify(defaultRequests));
      } else {
        setRequests(uniqueData);
        // लोकल स्टोरेज को भी क्लीन करके अपडेट करें ताकि संख्या बढ़े नहीं
        localStorage.setItem('service_requests_db', JSON.stringify(uniqueData));
      }
    } catch (e) {
      console.error(e);
      setRequests([]);
    }
  };

  useEffect(() => {
    loadServiceRequests();
    window.addEventListener('storage', loadServiceRequests);
    window.addEventListener('service_updated', loadServiceRequests);

    return () => {
      window.removeEventListener('storage', loadServiceRequests);
      window.removeEventListener('service_updated', loadServiceRequests);
    };
  }, []);

  const handleAction = (id: number, newStatus: string) => {
    const updated = requests.map(item => item.id === id ? { ...item, status: newStatus } : item);
    
    // यूनिक डेटा फिर से सुनिश्चित करें
    const uniqueUpdated = updated.filter((v, i, a) => v && v.id && i === a.findIndex(t => t && t.id === v.id));

    setRequests(uniqueUpdated);
    localStorage.setItem('service_requests_db', JSON.stringify(uniqueUpdated));
    localStorage.setItem('aadhaar_correction_db', JSON.stringify(uniqueUpdated));
    
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('service_updated'));
    alert(`Service request status updated to ${newStatus}!`);
  };

  const pendingCount = requests.filter(r => r && (r.status === 'Pending' || !r.status)).length;

  return (
    <div style={{ color: '#fff', fontFamily: 'Inter, sans-serif', padding: '20px' }}>
      
      {/* हेडर और काउंटिंग */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#38bdf8', margin: 0 }}>Service Requests Management</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '5px 0 0 0' }}>Monitor and process service applications submitted by retailers & distributors.</p>
        </div>
        <div style={{ background: '#1e293b', padding: '12px 20px', borderRadius: '10px', border: '1px solid #334155', fontSize: '14px' }}>
          Pending Requests: <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '16px' }}>{pendingCount}</span>
        </div>
      </div>

      {/* सर्विस रिक्वेस्ट लिस्ट */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '25px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f59e0b', marginBottom: '20px' }}>📥 All Service Applications ({requests.length})</h2>

        {requests.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No service requests found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {requests.map((req: any, index: number) => (
              <div key={`${req.id}-${index}`} style={{ background: '#1e293b', padding: '18px 20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #334155' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '16px' }}>
                    {req.retailerName} <span style={{ color: '#38bdf8', fontSize: '13px' }}>({req.mobile})</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#34d399', marginTop: '4px', fontWeight: '600' }}>
                    Service: {req.serviceName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    Date: {req.date || 'Today'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', background: req.status === 'Approved' ? '#10b98122' : '#f59e0b22', color: req.status === 'Approved' ? '#10b981' : '#f59e0b' }}>
                    {req.status || 'Pending'}
                  </span>
                  
                  {req.status !== 'Approved' && (
                    <button 
                      onClick={() => handleAction(req.id, 'Approved')}
                      style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Approve ✅
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}