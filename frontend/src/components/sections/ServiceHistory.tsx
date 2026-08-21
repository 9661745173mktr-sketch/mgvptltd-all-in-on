'use client';
import React, { useState } from 'react';

export default function ServiceHistory() {
  const [serviceHistory, setServiceHistory] = useState<Array<any>>([]);

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '25px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '15px' }}>📑 Service History</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
              <th style={{ padding: '12px' }}>Service Name</th>
              <th style={{ padding: '12px' }}>Fee</th>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {serviceHistory.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No service history found.</td>
              </tr>
            ) : (
              serviceHistory.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#f8fafc' }}>{item.title}</td>
                  <td style={{ padding: '12px', color: '#4ade80' }}>{item.fee}</td>
                  <td style={{ padding: '12px', color: '#94a3b8' }}>{item.date}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '11px' }}>
                      {item.status}
                    </span>
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