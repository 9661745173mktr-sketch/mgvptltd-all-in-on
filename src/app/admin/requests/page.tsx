'use client';
import React, { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';

function adminHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export default function AdminRequestsPage() {
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [idRequests, setIdRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const headers = adminHeaders();
      const [serviceRes, idRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/service-requests?status=PENDING`, { headers, cache: 'no-store' }),
        fetch(`${API_BASE}/api/admin/id-requests?status=PENDING`, { headers, cache: 'no-store' }),
      ]);
      const serviceData = await serviceRes.json();
      const idData = await idRes.json();
      if (!serviceRes.ok) throw new Error(serviceData.error || 'Unable to load service requests.');
      if (!idRes.ok) throw new Error(idData.error || 'Unable to load ID requests.');
      setServiceRequests(Array.isArray(serviceData.requests) ? serviceData.requests : []);
      setIdRequests(Array.isArray(idData.requests) ? idData.requests : []);
    } catch (err: any) { setError(err?.message || 'Unable to load live requests.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const action = async (kind: 'service' | 'id', id: string, operation: 'approve' | 'reject') => {
    setBusyId(id);
    try {
      const path = kind === 'service' ? `/api/admin/service-requests/${encodeURIComponent(id)}/${operation}` : `/api/admin/id-requests/${encodeURIComponent(id)}/${operation}`;
      const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify({ adminId: 'ADMIN' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed.');
      await load();
      alert(kind === 'service' && operation === 'reject' ? 'Service rejected and wallet refund processed.' : operation === 'approve' ? 'Approved successfully.' : 'Rejected successfully.');
    } catch (err: any) { alert(err?.message || 'Action failed.'); }
    finally { setBusyId(null); }
  };

  return (
    <div style={{ color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <div><h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Live Admin Requests</h1><p style={{ fontSize: 13, color: '#94a3b8' }}>Database-backed ID approvals and service requests. No localStorage business data.</p></div>
        <button onClick={load} disabled={loading} style={{ background: '#2563eb', color: '#fff', border: 0, padding: '9px 15px', borderRadius: 8, fontWeight: 800 }}>{loading ? 'Loading…' : 'Refresh'}</button>
      </div>
      {error && <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.35)', color: '#fca5a5' }}>{error}</div>}

      <section style={{ marginBottom: 30 }}>
        <h2 style={{ color: '#fbbf24', fontSize: 19 }}>🪪 ID Creation / Payment Approval ({idRequests.length})</h2>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, overflow: 'auto' }}>
          <table style={{ width: '100%', minWidth: 950, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ background: '#1e293b', color: '#94a3b8' }}>{['Real Name','Mobile','Gmail','Role','Amount','UTR','Payment','Account','Action'].map(x => <th key={x} style={{ padding: 12, textAlign: 'left' }}>{x}</th>)}</tr></thead>
            <tbody>{loading ? <tr><td colSpan={9} style={{ padding: 30, textAlign: 'center' }}>Loading live ID requests…</td></tr> : idRequests.length === 0 ? <tr><td colSpan={9} style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>No pending ID creation requests.</td></tr> : idRequests.map(r => <tr key={r.id} style={{ borderBottom: '1px solid #1e293b' }}>
              <td style={{ padding: 12, fontWeight: 800 }}>{r.applicantName}</td><td style={{ padding: 12 }}>{r.applicantMobile}</td><td style={{ padding: 12 }}>{r.applicantEmail || '—'}</td><td style={{ padding: 12, color: '#38bdf8' }}>{r.requestedRole}</td><td style={{ padding: 12, color: '#fbbf24', fontWeight: 800 }}>₹{Number(r.amount).toFixed(2)}</td><td style={{ padding: 12 }}>{r.utr || '—'}</td><td style={{ padding: 12 }}>{r.paymentStatus}</td><td style={{ padding: 12, color: '#fbbf24' }}>{r.user?.accountStatus || 'Pending'}</td>
              <td style={{ padding: 12, display: 'flex', gap: 7 }}><button disabled={busyId===r.id} onClick={() => action('id', r.id, 'approve')} style={{ background: '#10b981', color: '#fff', border: 0, padding: '7px 10px', borderRadius: 7, fontWeight: 800 }}>Verify & Activate</button><button disabled={busyId===r.id} onClick={() => action('id', r.id, 'reject')} style={{ background: '#ef4444', color: '#fff', border: 0, padding: '7px 10px', borderRadius: 7, fontWeight: 800 }}>Reject</button></td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 style={{ color: '#38bdf8', fontSize: 19 }}>🧾 Service Requests ({serviceRequests.length})</h2>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, overflow: 'auto' }}>
          <table style={{ width: '100%', minWidth: 850, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ background: '#1e293b', color: '#94a3b8' }}>{['Service','Real Name','Mobile','Role','Fee','Status','Action'].map(x => <th key={x} style={{ padding: 12, textAlign: 'left' }}>{x}</th>)}</tr></thead>
            <tbody>{loading ? <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center' }}>Loading live service requests…</td></tr> : serviceRequests.length === 0 ? <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>No pending service requests.</td></tr> : serviceRequests.map(r => <tr key={r.id} style={{ borderBottom: '1px solid #1e293b' }}>
              <td style={{ padding: 12, fontWeight: 800 }}>{r.service?.title || r.serviceName || '—'}</td><td style={{ padding: 12 }}>{r.user?.name || r.clientName || '—'}</td><td style={{ padding: 12 }}>{r.user?.phone || r.mobile || '—'}</td><td style={{ padding: 12, color: '#38bdf8' }}>{r.user?.role || '—'}</td><td style={{ padding: 12, color: '#38bdf8', fontWeight: 800 }}>₹{Number(r.amountPaid || r.fee || 0).toFixed(2)}</td><td style={{ padding: 12, color: '#facc15' }}>{r.status}</td>
              <td style={{ padding: 12, display: 'flex', gap: 7 }}><button disabled={busyId===r.id} onClick={() => action('service', r.id, 'approve')} style={{ background: '#10b981', color: '#fff', border: 0, padding: '7px 10px', borderRadius: 7, fontWeight: 800 }}>Approve</button><button disabled={busyId===r.id} onClick={() => action('service', r.id, 'reject')} style={{ background: '#ef4444', color: '#fff', border: 0, padding: '7px 10px', borderRadius: 7, fontWeight: 800 }}>Reject + Refund</button></td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
