'use client';
import React from 'react';

export default function AffiliateHub({ handleOpenForm }: any) {
  const affiliateServices = [
    { id: 'aff-1', title: 'Brand Affiliate Program', fee: '₹0', icon: '🤝', color: '#10b981', info: 'Promote top brands and earn high recurring commissions on sales.' },
    { id: 'aff-2', title: 'Financial Lead Generation', fee: '₹0', icon: '📈', color: '#0ea5e9', info: 'Credit cards, loans, and insurance lead generation network.' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc' }}>Affiliate Hub</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {affiliateServices.map((service) => (
          <div key={service.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '190px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: `${service.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', border: `1px solid ${service.color}55` }}>
                  {service.icon}
                </div>
                <span style={{ fontSize: '11px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.2)', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>
                  {service.fee}
                </span>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#f8fafc', margin: '0 0 8px 0' }}>{service.title}</h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{service.info}</p>
            </div>
            <button 
              onClick={() => handleOpenForm ? handleOpenForm(service.title, service.fee, service.id) : alert(service.title)} 
              style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '10px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', marginTop: '15px' }}
            >
              Launch Service 🚀
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}