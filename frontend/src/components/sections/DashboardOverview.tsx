'use client';
import React from 'react';

export default function DashboardOverview() {
  // यहाँ पर सर्विसेज की लिस्ट डिफाइन करना ज़रूरी है ताकि 'slice' एरर न आए
  const printServices = [
    { id: 'up-ration', title: 'UP Ration To Aadhaar' },
    { id: 'ration-aadhaar', title: 'Ration To Aadhaar' },
    { id: 'voter-link', title: 'Voter Mobile Link' },
    { id: 'challan', title: 'Vehicle Challan' },
    { id: 'npci', title: 'NPCI Status' },
    { id: 'rc-pdf', title: 'RC Blue PDF' },
  ];

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f8fafc', marginBottom: '10px' }}>Dashboard Overview</h2>
      <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '30px' }}>Active print portal & correction services overview.</p>
      
      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#38bdf8', marginBottom: '15px' }}>Print Portal Services</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
        {printServices.slice(0, 6).map((s: any) => (
          <div key={s.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px' }}>{s.title}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}