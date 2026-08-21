'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { PortalService } from '../app/utils/serviceCatalog';
import { apiFetch, getCurrentUser } from '../app/utils/api';

type Props = { service: PortalService | null; onClose: () => void; retailerName: string; retailerMobile: string; onSubmitted: () => void };

export default function ServiceRequestModal({ service, onClose, retailerName, retailerMobile, onSubmitted }: Props) {
  const [data, setData] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [loading, setLoading] = useState(false);
  const fields = service?.fields || [];
  const requiredFields = useMemo(() => fields.filter(f => f.required), [fields]);

  useEffect(() => { setData({}); setStep('form'); }, [service?.id]);
  if (!service) return null;

  const update = (name: string, value: string) => setData(prev => ({ ...prev, [name]: value }));
  const validate = () => {
    for (const field of requiredFields) if (!String(data[field.name] || '').trim()) { alert(`${field.label} is required.`); return false; }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    const user = getCurrentUser();
    if (!user?.id) { alert('Please login again.'); return; }
    setLoading(true);
    try {
      const inputData: Record<string, any> = { ...data, retailerName, retailerMobile };
      const res = await apiFetch('/api/services/request', { method: 'POST', body: JSON.stringify({ userId: user.id, serviceId: service.id, inputData }) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Unable to submit service request.');
      alert(`Request submitted successfully. ₹${Number(result.request?.amountPaid || service.fee || 0).toFixed(2)} deducted from the live wallet.`);
      onSubmitted(); onClose();
    } catch (error: any) { alert(error?.message || 'Unable to submit service request.'); }
    finally { setLoading(false); }
  };

  const renderField = (field: any) => {
    if (field.type === 'select') return <select value={data[field.name] || ''} onChange={e => update(field.name, e.target.value)} required={field.required} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white"><option value="">Select {field.label}</option>{(field.options || []).map((o: string) => <option key={o} value={o}>{o}</option>)}</select>;
    if (field.type === 'textarea') return <textarea value={data[field.name] || ''} onChange={e => update(field.name, e.target.value)} required={field.required} rows={4} placeholder={field.placeholder || `Enter ${field.label}`} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white" />;
    return <input type={field.type || 'text'} value={data[field.name] || ''} onChange={e => update(field.name, e.target.value)} required={field.required} placeholder={field.placeholder || `Enter ${field.label}`} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white" />;
  };

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="w-full max-w-4xl max-h-[94vh] overflow-y-auto rounded-3xl border border-cyan-400/40 bg-[#0b1324] shadow-2xl">
      <div className="border-b border-slate-700 px-6 py-5"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black text-cyan-300">{service.icon} {service.title}</h2><p className="mt-1 text-xs text-slate-400">{service.description}</p></div><button onClick={onClose} className="text-2xl text-slate-400">×</button></div><div className="mt-3 text-sm text-emerald-300">Live service fee: ₹{Number(service.fee || 0).toFixed(2)} • Wallet is checked and debited on the server.</div></div>
      <div className="px-6 py-6">
        {step === 'form' ? <><div className="mb-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-sm text-slate-300">📌 Fill the required details carefully. The request is saved in the live database and appears in Admin immediately.</div><div className="grid grid-cols-1 gap-4 md:grid-cols-2">{fields.map(field => <label key={field.name} className={field.col === 2 ? 'md:col-span-2' : ''}><span className="mb-1.5 block text-xs font-bold text-cyan-300">{field.label}{field.required && <b className="ml-1 text-rose-400">*</b>}</span>{renderField(field)}</label>)}</div><div className="mt-7 flex justify-end gap-3"><button onClick={onClose} className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-bold text-slate-200">Cancel</button><button onClick={() => validate() && setStep('preview')} className="rounded-xl bg-cyan-600 px-6 py-3 text-sm font-black text-white">Preview / Check Details 👁</button></div></> : <><h3 className="text-lg font-black text-emerald-300">Review Request</h3><div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">{fields.filter(f => data[f.name]).map(f => <div key={f.name} className="rounded-xl border border-slate-700 bg-slate-900/60 p-3"><div className="text-[11px] font-bold text-slate-500">{f.label}</div><div className="mt-1 break-words text-sm text-white">{data[f.name]}</div></div>)}</div><div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300">Retailer: <b className="text-white">{retailerName}</b> • {retailerMobile}<br />Server will deduct the exact configured service price from the live wallet.</div><div className="mt-6 flex justify-end gap-3"><button onClick={() => setStep('form')} className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-bold text-slate-200">Back</button><button disabled={loading} onClick={submit} className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-black text-white disabled:opacity-50">{loading ? 'Submitting…' : 'Submit Request 🚀'}</button></div></>}
      </div>
    </div>
  </div>;
}
