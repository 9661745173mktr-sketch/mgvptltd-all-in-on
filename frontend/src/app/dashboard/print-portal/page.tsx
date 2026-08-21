'use client';
import React, { useState } from 'react';

const REMOTE_VPN_LINK = process.env.NEXT_PUBLIC_REMOTE_VPN_LINK || '#';
const VHUI64_LINK = process.env.NEXT_PUBLIC_VHUI64_LINK || '#';

export default function AadhaarCorrection({ handleOpenForm }: any) {
  const [activeModal, setActiveModal] = useState<any>(null);
  const [step, setStep] = useState<'form' | 'preview'>('form');
  
  const [formData, setFormData] = useState({
    state: 'Bihar',
    customerName: '',
    customerMobile: '',
    operatorId: '',
    aadhaarNumber: '',
    newMobile: '',
    childName: '',
    dob: '',
    gender: 'Male',
    mothersName: '',
    fathersName: '',
    village: '',
    postOffice: '',
    policeStation: '',
    district: 'Kaimur',
    pincode: '',
    documentType: 'Aadhaar Card',
    fileName: ''
  });

  const correctionServices = [
    { id: 'name-change', title: 'Name Change Form', desc: 'Original White Background Photo, Old/New Name details and Original supporting document required.', fee: '1200.00', icon: '✍️', color: '#0ea5e9' },
    { id: 'dob-change', title: 'DOB Change Form', desc: 'Old/New DOB verification with Original White Background Photo and Original/Background DOB document.', fee: '1200.00', icon: '📅', color: '#6366f1' },
    { id: 'gender-change', title: 'Gender Change Form', desc: 'Gender update with Original White Background Photo and Original/Background supporting document.', fee: '1200.00', icon: '🚻', color: '#ec4899' },
    { id: 'address-update', title: 'C/O Address Update Form', desc: 'Complete C/O address update: Village, Post Office, Police Station, District, State and PIN Code.', fee: '400.00', icon: '🏠', color: '#10b981' },
    { id: 'mobile-update', title: 'Mobile No Update', desc: 'Customer mobile number update/link service. After successful payment, moves to Waiting Room.', fee: '150.00', icon: '📱', color: '#f59e0b' },
    { id: 'birth-certificate', title: 'Birth Certificate', desc: 'Original Birth Certificate generation. Generation time: 7-10 working days.', fee: '1400.00', icon: '👶', color: '#ef4444' },
    { id: 'pan-card', title: 'PAN Card Service', desc: 'Easy PAN Card – बिना OTP. PAN Card Type and Document Option are available.', fee: '180.00', icon: '💳', color: '#3b82f6' }
  ];

  const handleOpenModal = (service: any) => {
    setActiveModal(service);
    setStep('form');
  };

  const handleFinalSubmit = () => {
    if (!formData.customerName || !formData.customerMobile) {
      alert('कृपया ग्राहक का नाम और मोबाइल नंबर दर्ज करें।');
      return;
    }

    const newApplication = {
      id: Date.now(),
      retailerName: 'SANJAY KUMAR',
      mobile: '9267916288',
      serviceName: activeModal?.title || 'Aadhaar Service Form',
      details: formData,
      fee: activeModal?.fee || '0.00',
      status: 'Pending',
      date: new Date().toLocaleDateString(),
      timestamp: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem('aadhaar_correction_db') || '[]');
      const updated = [newApplication, ...(Array.isArray(existing) ? existing : [])];
      
      localStorage.setItem('aadhaar_correction_db', JSON.stringify(updated));
      localStorage.setItem('service_requests_db', JSON.stringify(updated));

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('service_updated'));

      alert('फॉर्म सफलतापूर्वक सबमिट हो गया है! यह एडमिन के पास वेरिफिकेशन के लिए भेज दिया गया है।');
      setActiveModal(null);
    } catch (err) {
      console.error(err);
      alert('कुछ गलत हो गया, कृपया पुनः प्रयास करें।');
    }
  };

  return (
    <div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <a
          href={REMOTE_VPN_LINK}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => { if (REMOTE_VPN_LINK === '#') e.preventDefault(); }}
          style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #0f172a, #172554)', border: '1px solid #2563eb55', borderRadius: '14px', padding: '15px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: REMOTE_VPN_LINK === '#' ? 'not-allowed' : 'pointer', opacity: REMOTE_VPN_LINK === '#' ? 0.6 : 1 }}
        >
          <div><div style={{ color: '#60a5fa', fontSize: '12px', fontWeight: '800' }}>🔐 REMOTE / VPN</div><div style={{ color: '#cbd5e1', fontSize: '11px', marginTop: '4px' }}>Open authorized remote access link</div></div>
          <span style={{ color: '#60a5fa', fontSize: '20px' }}>↗</span>
        </a>
        <a
          href={VHUI64_LINK}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => { if (VHUI64_LINK === '#') e.preventDefault(); }}
          style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #0f172a, #3b0764)', border: '1px solid #a855f755', borderRadius: '14px', padding: '15px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: VHUI64_LINK === '#' ? 'not-allowed' : 'pointer', opacity: VHUI64_LINK === '#' ? 0.6 : 1 }}
        >
          <div><div style={{ color: '#c084fc', fontSize: '12px', fontWeight: '800' }}>🛠️ VHUI64</div><div style={{ color: '#cbd5e1', fontSize: '11px', marginTop: '4px' }}>Open authorized VHUI64 link</div></div>
          <span style={{ color: '#c084fc', fontSize: '20px' }}>↗</span>
        </a>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc' }}>Aadhaar Correction & Update Forms</h2>
        <span style={{ fontSize: '12px', background: '#1e293b', padding: '6px 12px', borderRadius: '20px', color: '#ec4899', fontWeight: 'bold' }}>
          Total: {correctionServices.length} Forms
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {correctionServices.map((service) => (
          <div key={service.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: `${service.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', border: `1px solid ${service.color}55` }}>
                  {service.icon}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#f8fafc', margin: 0 }}>{service.title}</h3>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 15px 0', lineHeight: '1.5' }}>{service.desc}</p>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '12px', background: 'rgba(20, 184, 166, 0.1)', color: '#2dd4bf', border: '1px solid rgba(20, 184, 166, 0.2)', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>
                  Fee: ₹{service.fee}
                </span>
              </div>
              <button 
                onClick={() => handleOpenModal(service)} 
                style={{ width: '100%', background: '#db2777', color: '#fff', border: 'none', padding: '12px 0', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 10px 15px -3px rgba(219, 39, 119, 0.3)' }}
              >
                Initiate to Proceed
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '25px', width: '680px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>
                {activeModal.title} (Fee: ₹{activeModal.fee})
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            {step === 'form' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Select State / UT *</label>
                    <select 
                      value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }}
                    >
                      <option value="Bihar">Bihar</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Customer Full Name *</label>
                    <input 
                      type="text" placeholder="Enter customer full name" value={formData.customerName}
                      onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Customer Mobile Number *</label>
                    <input 
                      type="text" placeholder="10 digit mobile number" value={formData.customerMobile}
                      onChange={(e) => setFormData({...formData, customerMobile: e.target.value})}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>VPN ID / Operator ID (Optional)</label>
                    <input 
                      type="text" placeholder="Enter VPN ID if available" value={formData.operatorId}
                      onChange={(e) => setFormData({...formData, operatorId: e.target.value})}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Aadhaar Number *</label>
                    <input 
                      type="text" placeholder="12 digit Aadhaar" value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({...formData, aadhaarNumber: e.target.value})}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>New Mobile Number *</label>
                    <input 
                      type="text" placeholder="Enter new 10 digit mobile" value={formData.newMobile}
                      onChange={(e) => setFormData({...formData, newMobile: e.target.value})}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Aadhaar Supporting Document *</label>
                  <input 
                    type="file" 
                    onChange={(e: any) => setFormData({...formData, fileName: e.target.files[0]?.name || 'Uploaded File'})}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' }} 
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button type="button" onClick={() => setActiveModal(null)} style={{ flex: 1, background: 'transparent', border: '1px solid #475569', color: '#fff', padding: '11px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (!formData.customerName || !formData.customerMobile) {
                        alert('कृपया ग्राहक का नाम और मोबाइल नंबर भरें।');
                        return;
                      }
                      setStep('preview');
                    }} 
                    style={{ flex: 1, background: '#0284c7', border: 'none', color: '#fff', padding: '11px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Preview / Check Details 🔍
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ background: '#1e293b', padding: '18px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #334155' }}>
                  <h4 style={{ color: '#38bdf8', marginTop: 0, marginBottom: '12px' }}>📋 Verify Application Details</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                    <div><b>Service:</b> {activeModal.title}</div>
                    <div><b>State:</b> {formData.state}</div>
                    <div><b>Customer Name:</b> {formData.customerName}</div>
                    <div><b>Mobile Number:</b> {formData.customerMobile}</div>
                    <div><b>Aadhaar Number:</b> {formData.aadhaarNumber || 'N/A'}</div>
                    <div><b>New Mobile:</b> {formData.newMobile || 'N/A'}</div>
                    <div><b>Document:</b> {formData.fileName || 'Attached'}</div>
                    <div><b>Service Fee:</b> ₹{activeModal.fee}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setStep('form')} style={{ flex: 1, background: 'transparent', border: '1px solid #475569', color: '#fff', padding: '11px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Back / Edit ⬅️
                  </button>
                  <button type="button" onClick={handleFinalSubmit} style={{ flex: 1, background: '#10b981', border: 'none', color: '#fff', padding: '11px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Submit & Pay ✅
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}