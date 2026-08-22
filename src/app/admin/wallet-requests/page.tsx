'use client';
import React, { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

type Tx = { id: string; userId: string; amount: number; reference?: string; description?: string; status: string; createdAt: string; user?: { name?: string; phone?: string; email?: string; role?: string } };

export default function AdminWalletRequestsPage() {
  const [requests, setRequests] = useState<Tx[]>([]);
  const [manualMobile, setManualMobile] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualRemark, setManualRemark] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRequests = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/wallet/recharge-requests`, { headers: { 'x-admin-token': token } });
      const data = await res.json();
      if (res.status === 401) { localStorage.removeItem('adminToken'); window.location.href = '/admin/login'; return; }
      if (!res.ok) throw new Error(data.error || 'Unable to load wallet requests.');
      setRequests(Array.isArray(data.transactions) ? data.transactions : []);
      setError('');
    } catch (e: any) { setError(e.message || 'Unable to load wallet requests.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadRequests(); const timer = window.setInterval(loadRequests, 10000); return () => window.clearInterval(timer); }, []);

  const processRequest = async (id: string, action: 'approve' | 'reject') => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    const remark = window.prompt(action === 'reject' ? 'Reject reason (optional):' : 'Approval remark (optional):', '');
    if (remark === null) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/wallet/recharge-requests/${id}/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, body: JSON.stringify({ remark, adminId: 'ADMIN' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed.');
      await loadRequests();
      alert(action === 'approve' ? 'Recharge approved and wallet credited.' : 'Recharge rejected.');
    } catch (e: any) { alert(e.message || 'Action failed.'); }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(manualAmount);
    if (!manualMobile || !Number.isFinite(amount) || amount <= 0) return alert('Please enter a valid mobile number and amount.');
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/wallet/manual-credit`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, body: JSON.stringify({ mobile: manualMobile, amount, remark: manualRemark }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to credit wallet.');
      alert(data.message || 'Wallet credited.');
      setManualMobile(''); setManualAmount(''); setManualRemark('');
      await loadRequests();
    } catch (e: any) { alert(e.message || 'Unable to credit wallet.'); }
  };

  const pending = requests.filter(r => r.status === 'PENDING');
  const history = requests.filter(r => r.status !== 'PENDING');

  return (
    <div style={{ padding: '25px', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}><div><h1 style={{ fontSize: '22px', fontWeight: 800, color: '#38bdf8', margin: 0 }}>Wallet Load & UTR Control Center</h1><p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>Live recharge approvals and wallet credits from the backend database.</p></div><div style={{ background: '#1e293b', padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155', fontSize: '13px' }}>Pending: <b style={{ color: '#f59e0b' }}>{pending.length}</b></div></div>
      {error && <div style={{ background: '#3f1d1d', border: '1px solid #ef4444', color: '#fecaca', padding: '12px 15px', borderRadius: '10px', marginBottom: '15px' }}>{error}</div>}

      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', marginBottom: '15px' }}>➕ Direct Admin Balance Adder</h2>
        <form onSubmit={handleManualAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
          <input value={manualMobile} onChange={e => setManualMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="User mobile number" style={inputStyle} />
          <input type="number" min="1" value={manualAmount} onChange={e => setManualAmount(e.target.value)} placeholder="Amount ₹" style={inputStyle} />
          <input value={manualRemark} onChange={e => setManualRemark(e.target.value)} placeholder="Remark (optional)" style={inputStyle} />
          <button type="submit" style={buttonStyle('#0284c7')}>Add Balance Now 🚀</button>
        </form>
      </div>

      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#f59e0b', marginBottom: '15px' }}>⏳ Pending UTR Load Requests ({pending.length})</h2>
        {loading ? <div style={{ padding: '25px', textAlign: 'center', color: '#94a3b8' }}>Loading…</div> : pending.length === 0 ? <div style={{ padding: '25px', textAlign: 'center', color: '#64748b' }}>No pending wallet requests.</div> : <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>{pending.map(req => <div key={req.id} style={rowStyle}><div><div style={{ fontWeight: 800 }}>{req.user?.name || 'User'} <span style={{ color: '#38bdf8', fontSize: '12px' }}>({req.user?.phone || '—'})</span></div><div style={{ color: '#10b981', fontWeight: 800, marginTop: '4px' }}>₹{Number(req.amount).toFixed(2)}</div><div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Role: {req.user?.role || '—'} • UTR/Ref: {req.reference || '—'} • {new Date(req.createdAt).toLocaleString('en-IN')}</div></div><div style={{ display: 'flex', gap: '8px' }}><button onClick={() => processRequest(req.id, 'approve')} style={buttonStyle('#10b981')}>Approve ✅</button><button onClick={() => processRequest(req.id, 'reject')} style={buttonStyle('#ef4444')}>Reject ❌</button></div></div>)}</div>}
      </div>

      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#10b981', marginBottom: '15px' }}>📜 Processed Wallet History ({history.length})</h2>
        {history.length === 0 ? <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No processed history.</div> : <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{history.map(req => <div key={req.id} style={rowStyle}><div><b>{req.user?.name || 'User'}</b> <span style={{ color: '#38bdf8', fontSize: '12px' }}>({req.user?.phone || '—'})</span><div style={{ color: req.status === 'APPROVED' ? '#34d399' : '#f87171', fontSize: '13px', marginTop: '4px' }}>₹{Number(req.amount).toFixed(2)} — {req.status}</div></div><span style={{ color: '#94a3b8', fontSize: '11px' }}>{new Date(req.createdAt).toLocaleString('en-IN')}</span></div>)}</div>}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', boxSizing: 'border-box' };
const buttonStyle = (background: string): React.CSSProperties => ({ background, color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' });
const rowStyle: React.CSSProperties = { background: '#1e293b', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', border: '1px solid #334155', flexWrap: 'wrap' };
