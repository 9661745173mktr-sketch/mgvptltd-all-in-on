'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { allServices } from '../../utils/serviceCatalog';

export default function AdminServicesControlPage() {
  const [states, setStates] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    try { setStates(JSON.parse(localStorage.getItem('master_service_statuses') || '{}')); } catch { setStates({}); }
  }, []);

  const isActive = (id: string) => states[id] !== false;
  const filtered = useMemo(() => allServices.filter(s => (category === 'All' || s.category === category) && (`${s.title} ${s.category}`.toLowerCase().includes(query.toLowerCase()))), [query, category]);
  const categories = Array.from(new Set(allServices.map(s => s.category)));

  const save = (next: Record<string, boolean>) => { setStates(next); localStorage.setItem('master_service_statuses', JSON.stringify(next)); window.dispatchEvent(new Event('service_updated')); };
  const toggle = (id: string) => save({ ...states, [id]: !isActive(id) });
  const setAll = (value: boolean) => { const next: Record<string, boolean> = {}; allServices.forEach(s => next[s.id] = value); save(next); };

  const activeCount = allServices.filter(s => isActive(s.id)).length;
  return <div className="min-h-screen bg-[#070b14] p-5 text-white md:p-8">
    <div className="mx-auto max-w-7xl">
      <div className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-slate-900 to-blue-950/20 p-6 shadow-2xl">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl"/>
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><div className="text-xs font-black uppercase tracking-[.25em] text-cyan-300">MASTER CONTROL</div><h1 className="mt-1 text-2xl font-black">Service Control Center</h1><p className="mt-1 text-sm text-slate-500">Manage every retailer-facing service from one glossy control panel.</p></div><div className="flex flex-wrap gap-2"><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-300">● {activeCount}/{allServices.length} ACTIVE</span><button onClick={()=>setAll(true)} className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black">Enable All</button><button onClick={()=>setAll(false)} className="rounded-xl bg-rose-500/80 px-4 py-2 text-xs font-black">Disable All</button></div></div>
      </div>
      <div className="my-5 flex flex-col gap-3 md:flex-row"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search service..." className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-400"/><select value={category} onChange={e=>setCategory(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none"><option>All</option>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
      <div className="grid gap-3">{filtered.map(s=><div key={s.id} className="group flex flex-col gap-4 rounded-2xl border border-white/5 bg-slate-900/70 p-4 shadow-lg transition hover:border-cyan-400/20 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-2xl">{s.icon}</div><div><div className="font-black text-white">{s.title}</div><div className="mt-1 text-xs text-slate-500">{s.category} • ₹{s.fee.toFixed(2)} • {s.description}</div></div></div><div className="flex items-center gap-3"><span className={`rounded-full px-3 py-1.5 text-[10px] font-black ${isActive(s.id)?'bg-emerald-400/10 text-emerald-300':'bg-rose-400/10 text-rose-300'}`}>{isActive(s.id)?'ACTIVE':'DISABLED'}</span><button onClick={()=>toggle(s.id)} className={`rounded-xl px-4 py-2 text-xs font-black ${isActive(s.id)?'bg-rose-500/80':'bg-emerald-500'}`}>{isActive(s.id)?'Disable':'Enable'}</button></div></div>)}</div>
    </div>
  </div>;
}
