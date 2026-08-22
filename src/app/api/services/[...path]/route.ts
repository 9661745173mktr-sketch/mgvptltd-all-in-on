import { NextResponse } from 'next/server';

const HOP = new Set(['connection','keep-alive','proxy-authenticate','proxy-authorization','te','trailer','transfer-encoding','upgrade','host','content-length']);
function baseUrl() {
  const raw = String(process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();
  if (!raw) return '';
  try { const url = new URL(raw); if (!['http:','https:'].includes(url.protocol)) return ''; const base = url.toString().replace(/\/$/,''); return base.endsWith('/api') ? base : `${base}/api`; } catch { return ''; }
}
async function proxy(request: Request, path: string[]) {
  const base = baseUrl();
  if (!base) return NextResponse.json({ error: 'Backend API is not configured on the live deployment.' }, { status: 503 });
  try {
    const headers = new Headers(); request.headers.forEach((v,k)=>{if(!HOP.has(k.toLowerCase())) headers.set(k,v);});
    const method=request.method.toUpperCase();
    const response=await fetch(`${base}/services/${path.map(encodeURIComponent).join('/')}${new URL(request.url).search}`,{method,headers,body:['GET','HEAD'].includes(method)?undefined:await request.arrayBuffer(),cache:'no-store'});
    const out=new Headers(); response.headers.forEach((v,k)=>{if(!HOP.has(k.toLowerCase()))out.set(k,v);});
    return new NextResponse(response.body,{status:response.status,statusText:response.statusText,headers:out});
  } catch(error:any){return NextResponse.json({error:'Backend API is unreachable.',detail:error?.message||'Unknown error'},{status:502});}
}
export async function GET(request:Request,context:{params:Promise<{path:string[]}>}){return proxy(request,(await context.params).path||[])}
export async function POST(request:Request,context:{params:Promise<{path:string[]}>}){return proxy(request,(await context.params).path||[])}
export async function PUT(request:Request,context:{params:Promise<{path:string[]}>}){return proxy(request,(await context.params).path||[])}
export async function PATCH(request:Request,context:{params:Promise<{path:string[]}>}){return proxy(request,(await context.params).path||[])}
export async function DELETE(request:Request,context:{params:Promise<{path:string[]}>}){return proxy(request,(await context.params).path||[])}
