'use client';
import React from 'react';

export default function MasterServicesControl({ services, toggleServiceStatus }: any) {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '25px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '20px' }}>⚡ Master Services Control Hub</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {services.map((srv: any) => (
          <div key={srv.id} style={{ background: '#1e293b', padding: '16px 20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px' }}>{srv.name}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Fee Structure: {srv.fee}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ color: srv.status === 'Enabled' ? '#4ade80' : '#ef4444', fontWeight: 'bold', fontSize: '12px' }}>{srv.status}</span>
              <button onClick={() => toggleServiceStatus(srv.id)} style={{ background: srv.status === 'Enabled' ? '#dc2626' : '#10b981', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                {srv.status === 'Enabled' ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}