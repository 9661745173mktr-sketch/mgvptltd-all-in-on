'use client';
import React from 'react';

export default function AadhaarClientReviews({ correctionRequests, setSelectedReview }: any) {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '25px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '15px' }}>📝 Client Service & Correction Reviews</h2>
      <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Review live client submissions from retailer portal, verify details, and manage approvals.</p>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
              <th style={{ padding: '12px' }}>Service Name</th>
              <th style={{ padding: '12px' }}>Client Name & Mobile</th>
              <th style={{ padding: '12px' }}>ID Details</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {correctionRequests.map((req: any) => (
              <tr key={req.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#fff' }}>{req.title || req.service}</td>
                <td style={{ padding: '12px', color: '#cbd5e1' }}>
                  <div>{req.clientName || 'Retailer Client'}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{req.mobile}</div>
                </td>
                <td style={{ padding: '12px', color: '#38bdf8' }}>{req.idDetails || req.idNo || '[Redacted]'}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    background: req.status === 'Approved' ? 'rgba(74, 222, 128, 0.1)' : req.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                    color: req.status === 'Approved' ? '#4ade80' : req.status === 'Rejected' ? '#ef4444' : '#f59e0b', 
                    padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '11px' 
                  }}>
                    {req.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => setSelectedReview(req)} style={{ background: '#0ea5e9', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                    👁 View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}