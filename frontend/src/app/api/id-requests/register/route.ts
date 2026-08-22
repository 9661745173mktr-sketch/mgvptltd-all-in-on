import { NextResponse } from 'next/server';

function backendUrl() {
  const raw = String(process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();
  if (!raw) return '';
  try { const url = new URL(raw); if (!['http:','https:'].includes(url.protocol)) return ''; const base=url.toString().replace(/\/$/,''); return `${base.endsWith('/api') ? base : `${base}/api`}/id-requests/register`; } catch { return ''; }
}
export async function POST(request: Request) {
  const target=backendUrl();
  if (!target) return NextResponse.json({error:'Backend API is not configured on the live deployment.'},{status:503});
  try {
    const headers=new Headers({'content-type':'application/json'}); const token=request.headers.get('x-admin-token'); if(token) headers.set('x-admin-token',token);
    const response=await fetch(target,{method:'POST',headers,body:await request.text(),cache:'no-store'});
    return new NextResponse(response.body,{status:response.status,statusText:response.statusText,headers:{'content-type':response.headers.get('content-type')||'application/json'}});
  } catch(error:any){return NextResponse.json({error:'Backend API is unreachable.',detail:error?.message||'Unknown error'},{status:502});}
}
