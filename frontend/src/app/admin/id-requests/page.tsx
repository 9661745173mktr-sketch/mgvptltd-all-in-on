'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch, getAdminToken } from '../../../utils/api';

export default function AdminIdRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await apiFetch('/api/admin/id-requests?status=PENDING', { headers: { 'x-admin-token': getAdminToken() } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load ID requests');
      setRequests(data.requests || []);
    } catch (e: any) { alert(e?.message || 'Unable to load ID requests'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const action = async (id: string, type: 'approve' | 'reject') => {
    if (!confirm(type === 'approve' ? 'Verify the payment and activate this ID?' : 'Reject this ID request?')) return;
    try {
      const res = await apiFetch(`/api/admin/id-requests/${id}/${type}`, { method: 'POST', headers: { 'x-admin-token': getAdminToken() }, body: JSON.stringify({ adminId: 'ADMIN' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      alert(data.message || 'Updated'); await load();
    } catch (e: any) { alert(e?.message || 'Action failed'); }
  };

  return <div className="text-white"><div className="mb-6"><h1 className="text-2xl font-black text-cyan-300">🪪 ID Creation Requests</h1><p className="mt-1 text-sm text-slate-400">Real name, mobile, email, role, UTR and payment status from the live database.</p></div><div className="overflow-auto rounded-2xl border border-slate-700 bg-slate-900/70"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-800 text-slate-400"><tr><th className="p-4">Applicant</th><th className="p-4">Contact</th><th className="p-4">Role</th><th className="p-4">Fee</th><th className="p-4">UTR</th><th className="p-4">Payment</th><th className="p-4">Action</th></tr></thead><tbody>{loading ? <tr><td colSpan={7} className="p-8 text-center">Loading…</td></tr> : requests.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-slate-400">No pending ID requests.</td></tr> : requests.map(r => <tr key={r.id} className="border-t border-slate-800"><td className="p-4"><b>{r.applicantName}</b><div className="text-xs text-slate-500">{r.username}</div></td><td className="p-4">{r.applicantMobile}<div className="text-xs text-slate-400">{r.applicantEmail}</div></td><td className="p-4 text-cyan-300">{r.requestedRole}</td><td className="p-4">₹{Number(r.amount || 0).toLocaleString('en-IN')}</td><td className="p-4 font-mono text-xs">{r.utr || '—'}</td><td className="p-4 text-amber-300">{r.paymentStatus}</td><td className="p-4"><div className="flex gap-2"><button onClick={() => action(r.id, 'approve')} className="rounded-lg bg-emerald-600 px-3 py-2 font-bold">Verify & Activate</button><button onClick={() => action(r.id, 'reject')} className="rounded-lg bg-red-600 px-3 py-2 font-bold">Reject</button></div></td></tr>)}</tbody></table></div></div>;
}
