'use client';
import React from 'react';

export default function AdminOverview({ usersCount, pendingReviewsCount, activeServicesCount }: any) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="admin-card" style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Total Network Users</div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#38bdf8', marginTop: '8px' }}>{usersCount} Active IDs</div>
        </div>
        <div className="admin-card" style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Pending Client Reviews</div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#f59e0b', marginTop: '8px' }}>{pendingReviewsCount} Pending</div>
        </div>
        <div className="admin-card" style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Active Portal Services</div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#4ade80', marginTop: '8px' }}>{activeServicesCount} Services</div>
        </div>
      </div>
    </div>
  );
}