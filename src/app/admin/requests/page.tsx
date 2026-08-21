'use client';
import React, { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function AdminServiceRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/service-requests?status=PENDING`, {
        headers: authHeaders(),
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load service requests.');
      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to load service requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setBusyId(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/service-requests/${encodeURIComponent(id)}/${action}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ adminId: 'ADMIN' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Request ${action} failed.`);
      await loadRequests();
      alert(action === 'approve' ? 'Request approved successfully.' : 'Request rejected and wallet refund processed.');
    } catch (err: any) {
      alert(err?.message || 'Action failed.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>All Merged Service Requests</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Live database requests — approve, reject or refund.</p>
        </div>
        <button onClick={loadRequests} disabled={loading} style={{ background: '#2563eb', color: '#fff', border: 0, padding: '9px 14px', borderRadius: '8px', fontWeight: 700 }}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && <div style={{ marginBottom: 15, padding: 12, borderRadius: 10, background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.35)', color: '#fca5a5' }}>{error}</div>}

      <div style={{ marginBottom: 15, color: '#38bdf8', fontWeight: 800 }}>Pending Total: {requests.length}</div>

      <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', overflow: 'auto', backdropFilter: 'blur(15px)' }}>
        <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(30, 41, 59, 0.5)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '13px', color: '#94a3b8' }}>
              <th style={{ padding: '16px' }}>Service</th>
              <th style={{ padding: '16px' }}>Real Name</th>
              <th style={{ padding: '16px' }}>Mobile</th>
              <th style={{ padding: '16px' }}>Role</th>
              <th style={{ padding: '16px' }}>Fee</th>
              <th style={{ padding: '16px' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>Loading live requests…</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>No pending service requests.</td></tr>
            ) : requests.map((req) => (
              <tr key={req.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '14px' }}>
                <td style={{ padding: 16, fontWeight: 700 }}>{req.service?.title || req.serviceName || '—'}</td>
                <td style={{ padding: 16, color: '#cbd5e1' }}>{req.user?.name || req.clientName || '—'}</td>
                <td style={{ padding: 16, color: '#cbd5e1' }}>{req.user?.phone || req.mobile || '—'}</td>
                <td style={{ padding: 16, color: '#38bdf8' }}>{req.user?.role || '—'}</td>
                <td style={{ padding: 16, color: '#38bdf8', fontWeight: 800 }}>₹{Number(req.amountPaid || req.fee || 0).toFixed(2)}</td>
                <td style={{ padding: 16 }}><span style={{ padding: '4px 10px', borderRadius: 20, background: 'rgba(234,179,8,.15)', color: '#facc15', fontWeight: 800 }}>{req.status || 'PENDING'}</span></td>
                <td style={{ padding: 16, textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button disabled={busyId === req.id} onClick={() => handleAction(req.id, 'approve')} style={{ background: '#10b981', color: '#fff', border: 0, padding: '7px 12px', borderRadius: 8, fontWeight: 800 }}>{busyId === req.id ? '…' : 'Approve ✅'}</button>
                    <button disabled={busyId === req.id} onClick={() => handleAction(req.id, 'reject')} style={{ background: '#ef4444', color: '#fff', border: 0, padding: '7px 12px', borderRadius: 8, fontWeight: 800 }}>Reject / Refund ❌</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
