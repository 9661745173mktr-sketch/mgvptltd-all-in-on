'use client';
import React, { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

type ServiceRequest = { id: string; status: string; amountPaid: number; inputData: string; adminRemark?: string | null; createdAt: string; user?: { name?: string; phone?: string; email?: string; role?: string }; service?: { title?: string; price?: number; category?: { name?: string } } };

export default function AdminServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadRequests = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/service-requests`, { headers: { 'x-admin-token': token } });
      const data = await res.json();
      if (res.status === 401) { localStorage.removeItem('adminToken'); window.location.href = '/admin/login'; return; }
      if (!res.ok) throw new Error(data.error || 'Unable to load service requests.');
      setRequests(Array.isArray(data.requests) ? data.requests : []);
      setError('');
    } catch (e: any) { setError(e.message || 'Unable to load service requests.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadRequests(); const timer = window.setInterval(loadRequests, 10000); return () => window.clearInterval(timer); }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const remark = window.prompt(action === 'approve' ? 'Approval remark (optional):' : 'Reject reason (optional):', '');
    if (remark === null) return;
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    setBusy(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/service-requests/${id}/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, body: JSON.stringify({ remark }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Unable to ${action} request.`);
      await loadRequests();
      alert(action === 'approve' ? 'Request approved.' : 'Request rejected and wallet refunded.');
    } catch (e: any) { alert(e.message || 'Action failed.'); }
    finally { setBusy(null); }
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div style={{ color: '#fff', fontFamily: 'Inter, sans-serif', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <div><h1 style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8', margin: 0 }}>Service Requests Management</h1><p style={{ fontSize: '13px', color: '#94a3b8', margin: '5px 0 0' }}>Real retailer/distributor details from the backend database.</p></div>
        <div style={{ background: '#1e293b', padding: '12px 20px', borderRadius: '10px', border: '1px solid #334155', fontSize: '14px' }}>Pending: <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '16px' }}>{pendingCount}</span></div>
      </div>
      {error && <div style={{ background: '#3f1d1d', border: '1px solid #ef4444', color: '#fecaca', padding: '12px 15px', borderRadius: '10px', marginBottom: '15px' }}>{error}</div>}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px' }}>
        {loading ? <div style={{ padding: '35px', textAlign: 'center', color: '#94a3b8' }}>Loading live requests…</div> : requests.length === 0 ? <div style={{ padding: '35px', textAlign: 'center', color: '#64748b' }}>No service requests found.</div> : <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {requests.map(req => {
            let details: any = {};
            try { details = req.inputData ? JSON.parse(req.inputData) : {}; } catch { details = { raw: req.inputData }; }
            return <div key={req.id} style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{ minWidth: '260px' }}><div style={{ fontWeight: 800, color: '#fff', fontSize: '16px' }}>{req.service?.title || 'Service'}</div><div style={{ color: '#4ade80', marginTop: '5px', fontWeight: 700 }}>₹{Number(req.amountPaid || 0).toFixed(2)}</div></div>
                <span style={{ alignSelf: 'flex-start', padding: '6px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, background: req.status === 'APPROVED' ? '#10b98122' : req.status === 'REJECTED' ? '#ef444422' : '#f59e0b22', color: req.status === 'APPROVED' ? '#34d399' : req.status === 'REJECTED' ? '#f87171' : '#fbbf24' }}>{req.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '8px', marginTop: '12px', padding: '12px', background: '#0f172a', borderRadius: '10px', color: '#cbd5e1', fontSize: '12px' }}>
                <div><b>Name:</b> {req.user?.name || '—'}</div><div><b>Mobile:</b> {req.user?.phone || '—'}</div><div><b>Gmail:</b> {req.user?.email || '—'}</div><div><b>Role:</b> {req.user?.role || '—'}</div><div><b>Category:</b> {req.service?.category?.name || '—'}</div><div><b>Submitted:</b> {new Date(req.createdAt).toLocaleString('en-IN')}</div>
              </div>
              <div style={{ marginTop: '10px', color: '#94a3b8', fontSize: '12px' }}><b>Customer details:</b> {Object.keys(details).length ? Object.entries(details).map(([k, v]) => `${k}: ${String(v)}`).join(' • ') : '—'}</div>
              {req.adminRemark && <div style={{ marginTop: '8px', color: '#cbd5e1', fontSize: '12px' }}><b>Admin remark:</b> {req.adminRemark}</div>}
              {req.status === 'PENDING' && <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}><button disabled={busy === req.id} onClick={() => handleAction(req.id, 'approve')} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>Approve ✅</button><button disabled={busy === req.id} onClick={() => handleAction(req.id, 'reject')} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>Reject + Refund ↩️</button></div>}
            </div>;
          })}
        </div>}
      </div>
    </div>
  );
}
