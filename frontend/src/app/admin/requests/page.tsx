'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch, getAdminToken } from '../../utils/api';

export default function AdminServiceRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      const res = await apiFetch('/api/admin/service-requests', { headers: { 'x-admin-token': getAdminToken() } });
      const data = await res.json();
      if (res.status === 401) throw new Error('Admin session expired. Please login again.');
      if (!res.ok) throw new Error(data.error || 'Unable to load requests');
      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (error: any) {
      alert(error?.message || 'Unable to load service requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    if (!confirm(action === 'approve' ? 'Approve this service request?' : 'Reject this request and refund the retailer wallet?')) return;
    try {
      const res = await apiFetch(`/api/admin/service-requests/${id}/${action}`, {
        method: 'POST',
        headers: { 'x-admin-token': getAdminToken() },
        body: JSON.stringify({ adminId: 'ADMIN' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      alert(data.message || 'Updated successfully');
      await loadRequests();
    } catch (error: any) {
      alert(error?.message || 'Action failed');
    }
  };

  const pendingCount = requests.filter(r => String(r.status).toUpperCase() === 'PENDING').length;

  return (
    <div style={{ color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <div><h1 style={{ fontSize: 24, fontWeight: 'bold', margin: '0 0 5px' }}>All Merged Service Requests</h1><p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Live server/database requests. Reject automatically refunds the retailer wallet.</p></div>
        <div style={{ background: 'rgba(56,189,248,.15)', border: '1px solid rgba(56,189,248,.3)', padding: '8px 16px', borderRadius: 10, fontSize: 14, fontWeight: 'bold', color: '#38bdf8' }}>Pending Total: {pendingCount}</div>
      </div>
      <div style={{ background: 'rgba(15,23,42,.7)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 760 }}>
          <thead><tr style={{ background: 'rgba(30,41,59,.5)', borderBottom: '1px solid rgba(255,255,255,.1)', fontSize: 13, color: '#94a3b8' }}><th style={{ padding: 16 }}>Service</th><th style={{ padding: 16 }}>Client</th><th style={{ padding: 16 }}>Mobile</th><th style={{ padding: 16 }}>Fee</th><th style={{ padding: 16 }}>Status</th><th style={{ padding: 16, textAlign: 'center' }}>Action</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center' }}>Loading live requests…</td></tr> : requests.length === 0 ? <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>No service requests found.</td></tr> : requests.map(req => {
              const status = String(req.status || 'PENDING').toUpperCase();
              const user = req.user || {};
              const service = req.service || {};
              return <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 14 }}>
                <td style={{ padding: 16, fontWeight: 600 }}>{service.title || req.serviceName || 'Service'}</td>
                <td style={{ padding: 16, color: '#cbd5e1' }}>{user.name || req.clientName || '—'}</td>
                <td style={{ padding: 16, color: '#cbd5e1' }}>{user.phone || req.mobile || '—'}</td>
                <td style={{ padding: 16, color: '#38bdf8', fontWeight: 'bold' }}>₹{Number(req.amountPaid || 0).toFixed(2)}</td>
                <td style={{ padding: 16 }}><span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 'bold', background: status === 'APPROVED' ? 'rgba(16,185,129,.2)' : status === 'REJECTED' ? 'rgba(239,68,68,.2)' : 'rgba(234,179,8,.2)', color: status === 'APPROVED' ? '#10b981' : status === 'REJECTED' ? '#ef4444' : '#eab308' }}>{status}</span></td>
                <td style={{ padding: 16, textAlign: 'center' }}>{status === 'PENDING' ? <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}><button onClick={() => handleAction(req.id, 'approve')} style={{ background: '#10b981', color: '#fff', border: 0, padding: '7px 14px', borderRadius: 8, fontWeight: 'bold' }}>Approve ✅</button><button onClick={() => handleAction(req.id, 'reject')} style={{ background: '#ef4444', color: '#fff', border: 0, padding: '7px 14px', borderRadius: 8, fontWeight: 'bold' }}>Reject + Refund ↩️</button></div> : <span style={{ color: '#64748b', fontSize: 12 }}>Completed</span>}</td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
