'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function ServiceRedirect(){ const r=useRouter(); useEffect(()=>{ r.replace('/dashboard?tab=financial'); },[r]); return <div style={{minHeight:'100vh',background:'#060b14',color:'#fff',display:'grid',placeItems:'center'}}>Loading service…</div>; }
