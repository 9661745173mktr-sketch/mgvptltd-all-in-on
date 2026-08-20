'use client';
import React from 'react';

export default function PrintPortalServices({ handleOpenForm, setActiveTab }: any) {
  const printServices = [
    { id: 'up-ration-aadhaar', title: 'UP Ration To Aadhaar', charge: '₹40', icon: '🪪', color: '#f59e0b', info: 'Convert UP ration card details into digital document format instantly.' },
    { id: 'ration-aadhaar', title: 'Ration To Aadhaar', charge: '₹30', icon: '🌾', color: '#10b981', info: 'Fetch linked members and details via state ration databases.' },
    { id: 'voter-mobile-link', title: 'Voter Mobile Number Link - Instant', charge: '₹10', icon: '🗳️', color: '#3b82f6', info: 'Link your active mobile number to voter ID database securely.' },
    { id: 'vehicle-challan', title: 'Vehicle Challan Details', charge: '₹20', icon: '🚗', color: '#06b6d4', info: 'Check pending traffic challans and vehicle registration status.' },
    { id: 'npci-status', title: 'NPCI Linked Status Check', charge: '₹15', icon: '🏦', color: '#8b5cf6', info: 'Verify Direct Benefit Transfer (DBT) and bank mapper status.' },
    { id: 'rc-blue-pdf', title: 'RC Blue PDF - Fast', charge: '₹20', icon: '🚙', color: '#0ea5e9', info: 'Download original vehicle registration certificate digital copy.' },
    { id: 'new-pan-no-dob', title: 'Apply New Pan Card - Without DOB', charge: '₹149', icon: '💳', color: '#ec4899', info: 'Quick PAN card application service without strict DOB hurdles.' },
    { id: 'voter-pdf-no-otp', title: 'Voter PDF Without OTP', charge: '₹50', icon: '📄', color: '#3b82f6', info: 'Download voter epic card PDF without registered mobile OTP.' },
    { id: 'pan-solutions', title: 'Pan Solutions', charge: '₹50', icon: '🔍', color: '#ec4899', info: 'Comprehensive PAN solutions and correction services.' },
    { id: 'find-ration-uid', title: 'Find Ration By UID', charge: '₹30', icon: '🔎', color: '#10b981', info: 'Find ration card details using unique identification number.' },
    { id: 'find-lost-pan', title: 'Find Lost Pan Fast', charge: '₹25', icon: '⚡', color: '#f97316', info: 'Recover lost PAN card number and details quickly.' },
    { id: 'old-birth-new', title: 'OLD Birth To New PDF', charge: '₹200', icon: '👶', color: '#ef4444', info: 'Convert old manual birth certificates into new digital PDF.' },
    { id: 'new-gts-reg', title: 'New GTS Registration', charge: '₹100', icon: '📋', color: '#6366f1', info: 'New GTS portal registration and onboarding.' },
    { id: 'update-voter-mobile', title: 'Update Voter Card Mobile No OTP', charge: '₹40', icon: '📱', color: '#3b82f6', info: 'Update voter mobile number without OTP dependency.' },
    { id: 'aadhaar-advance', title: 'Aadhaar Advance', charge: '₹30', icon: '🆔', color: '#f59e0b', info: 'Advanced Aadhaar lookup and document services.' },
    { id: 'new-rc-pdf', title: 'New RC PDF', charge: '₹20', icon: '🚙', color: '#0ea5e9', info: 'Download latest formatted RC PDF documents.' },
    { id: 'voter-card-advance', title: 'Voter Card Advance PDF', charge: '₹15', icon: '🗳️', color: '#3b82f6', info: 'High-quality voter card advance PDF generation.' },
    { id: 'masked-pan', title: 'Masked Pan', charge: '₹25', icon: '🛡️', color: '#ec4899', info: 'Generate masked PAN card for secure privacy sharing.' },
    { id: 'pan-name-verify', title: 'Pan Name Verify', charge: '₹10', icon: '✅', color: '#ec4899', info: 'Verify PAN holder name instantly against database.' },
    { id: 'kisan-card', title: 'All State Kisan Card', charge: '₹50', icon: '🚜', color: '#84cc16', info: 'All states Kisan Credit Card digital print service.' },
    { id: 'dl-original-pdf', title: 'DL Original PDF', charge: '₹30', icon: '🪪', color: '#06b6d4', info: 'Download original driving license document PDF.' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc' }}>All Available Print Portal Services</h2>
        <span style={{ fontSize: '12px', background: '#1e293b', padding: '6px 12px', borderRadius: '20px', color: '#38bdf8', fontWeight: 'bold' }}>
          Total: {printServices.length} Services
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {printServices.map((service) => (
          <div key={service.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '190px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: `${service.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', border: `1px solid ${service.color}55` }}>
                  {service.icon}
                </div>
                <span style={{ fontSize: '11px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.2)', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>
                  Charge: {service.charge}
                </span>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#f8fafc', margin: 0 }}>{service.title}</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '8px 0 0 0' }}>{service.info}</p>
            </div>
            <button 
              onClick={() => handleOpenForm ? handleOpenForm(service.title, service.charge, service.id) : alert(service.title)} 
              style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '10px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', marginTop: '15px' }}
            >
              Apply 🚀
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}