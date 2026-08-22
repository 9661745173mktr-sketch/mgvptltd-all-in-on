'use client';
import React, { useState, useEffect } from 'react';

export default function AadhaarServiceControl() {
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [adminRemark, setAdminRemark] = useState('');
  const [uploadSlip, setUploadSlip] = useState<string>('');

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('service_updated', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('service_updated', loadData);
    };
  }, []);

  const loadData = () => {
    try {
      const storedData = localStorage.getItem('aadhaar_correction_db');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData)) {
          const uniqueApplications = parsedData.filter(
            (item, index, self) => item && item.id && index === self.findIndex((t) => t && t.id === item.id)
          );
          setApplications(uniqueApplications);
        } else {
          setApplications([]);
        }
      } else {
        setApplications([]);
      }
    } catch (e) {
      console.error(e);
      setApplications([]);
    }
  };

  const handleAction = (appId: number, status: 'Approved' | 'Rejected', refundMoney: boolean = false) => {
    try {
      const existing = JSON.parse(localStorage.getItem('aadhaar_correction_db') || '[]');
      const updated = existing.map((item: any) => {
        if (item.id === appId) {
          return {
            ...item,
            status: status,
            remark: adminRemark || 'No remark provided',
            slip: uploadSlip || null
          };
        }
        return item;
      });

      localStorage.setItem('aadhaar_correction_db', JSON.stringify(updated));
      localStorage.setItem('service_requests_db', JSON.stringify(updated));

      if (status === 'Rejected' && refundMoney) {
        const currentBal = parseFloat(localStorage.getItem('retailerWalletBalance') || '48950');
        const feeToRefund = parseFloat(selectedApp?.fee || '0');
        const newBal = currentBal + feeToRefund;
        localStorage.setItem('retailerWalletBalance', newBal.toString());
        window.dispatchEvent(new Event('wallet_updated'));
        alert(`फॉर्म रिजेक्ट कर दिया गया है और ₹${feeToRefund} रिटेलर के वॉलेट में सफलतापूर्वक रिफंड कर दिए गए हैं!`);
      } else {
        alert(`फॉर्म ${status === 'Approved' ? 'स्वीकृत (Approved)' : 'अस्वीकृत (Rejected)'} कर दिया गया है!`);
      }

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('service_updated'));
      setSelectedApp(null);
      setAdminRemark('');
      setUploadSlip('');
      loadData();
    } catch (err) {
      console.error(err);
      alert('कार्रवाई करने में त्रुटि हुई।');
    }
  };

  return (
    <div style={{ padding: '25px', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#38bdf8', margin: 0 }}>Aadhaar Service Control Center</h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Review, verify, process applications and manage refunds securely.</p>
        </div>
        <span style={{ background: '#1e293b', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', color: '#f59e0b', fontWeight: 'bold', border: '1px solid #334155' }}>
          Pending Forms: {applications.filter(a => a && (a.status === 'Pending' || !a.status)).length}
        </span>
      </div>

      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', overflow: 'hidden' }}>
        {applications.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>कोई नई पेंडिंग एप्लीकेशन उपलब्ध नहीं है।</div>
        ) : (
          applications.map((app, index) => (
            <div key={`${app.id}-${index}`} style={{ padding: '18px 22px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#f8fafc' }}>
                  Retailer: {app.retailerName || 'SANJAY KUMAR'} <span style={{ color: '#38bdf8', fontSize: '13px' }}>({app.mobile || '9267916288'})</span>
                </div>
                <div style={{ fontSize: '13px', color: '#34d399', marginTop: '4px', fontWeight: '600' }}>
                  Service: {app.serviceName} | Fee: ₹{app.fee}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                  Date: {app.date} | Status: <span style={{ color: app.status === 'Approved' ? '#10b981' : app.status === 'Rejected' ? '#ef4444' : '#f59e0b', fontWeight: 'bold' }}>{app.status || 'Pending'}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedApp(app)}
                style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}
              >
                View Details & Action 🔍
              </button>
            </div>
          ))
        )}
      </div>

      {/* बड़ा और आकर्षक पॉप-अप मॉडल */}
      {selectedApp && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '35px', width: '750px', maxWidth: '95%', maxHeight: '92vh', overflowY: 'auto', boxSizing: 'border-box', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #1e293b', paddingBottom: '15px' }}>
              <div>
                <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#38bdf8', margin: 0 }}>
                  Application Review & Control Center
                </h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Verify customer information, check uploaded documents, and process actions.</p>
              </div>
              <button onClick={() => setSelectedApp(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '22px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* विस्तृत जानकारी बॉक्स */}
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '14px', marginBottom: '20px', fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', border: '1px solid #334155' }}>
              <div><b>Service:</b> <span style={{ color: '#38bdf8' }}>{selectedApp.serviceName}</span></div>
              <div><b>Service Fee:</b> <span style={{ color: '#10b981', fontWeight: 'bold' }}>₹{selectedApp.fee}</span></div>
              <div><b>Retailer Name:</b> {selectedApp.retailerName}</div>
              <div><b>Retailer Mobile:</b> {selectedApp.mobile || '9267916288'}</div>
              <div><b>Customer Name:</b> {selectedApp.details?.customerName || selectedApp.details?.targetName || 'N/A'}</div>
              <div><b>Customer Mobile:</b> {selectedApp.details?.customerMobile || 'N/A'}</div>
              <div><b>Aadhaar / ID No:</b> {selectedApp.details?.aadhaarNumber || 'N/A'}</div>
              <div><b>Current Status:</b> <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{selectedApp.status || 'Pending'}</span></div>
              
              {/* डॉक्यूमेंट व्यू और डाउनलोड सेक्शन */}
              <div style={{ gridColumn: 'span 2', marginTop: '10px', paddingTop: '15px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <b style={{ color: '#f8fafc' }}>Attached Document:</b>{' '}
                  <span style={{ color: '#38bdf8', textDecoration: 'underline' }}>{selectedApp.details?.fileName || 'No Document Uploaded'}</span>
                </div>
                <button 
                  onClick={() => {
                    const docName = selectedApp.details?.fileName || 'Document';
                    alert(`डॉक्यूमेंट (${docName}) देखने के लिए लोड किया जा रहा है।`);
                  }}
                  style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  👁️ View / Open Document
                </button>
              </div>
            </div>

            {/* एडमिन रिमार्क इनपुट */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Admin Remark / Rejection Reason *</label>
              <textarea 
                placeholder="Enter verification remark or rejection reason..."
                value={adminRemark}
                onChange={(e) => setAdminRemark(e.target.value)}
                style={{ width: '100%', height: '80px', padding: '12px', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box', outline: 'none', fontSize: '13px' }}
              />
            </div>

            {/* स्लिप अपलोड ऑप्शन */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Upload Completed Slip / Receipt (Optional)</label>
              <input 
                type="file" 
                onChange={(e: any) => setUploadSlip(e.target.files[0]?.name || '')}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} 
              />
            </div>

            {/* एक्शन बटन्स (Accept, Reject & Refund) */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => handleAction(selectedApp.id, 'Approved', false)}
                style={{ flex: 1, background: '#10b981', border: 'none', color: '#fff', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}
              >
                Accept / Approve ✅
              </button>
              <button 
                onClick={() => handleAction(selectedApp.id, 'Rejected', true)}
                style={{ flex: 1, background: '#ef4444', border: 'none', color: '#fff', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}
              >
                Reject & Refund ₹{selectedApp.fee} 🔄
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}