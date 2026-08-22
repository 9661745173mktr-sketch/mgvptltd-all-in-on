import { NextResponse } from 'next/server';

function targetUrl() {
  const raw = String(process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    const base = url.toString().replace(/\/$/, '');
    return `${base.endsWith('/api') ? base : `${base}/api`}/auth/admin-login`;
  } catch { return ''; }
}

export async function POST(request: Request) {
  const target = targetUrl();
  if (!target) return NextResponse.json({ error: 'Backend API is not configured on the live deployment.' }, { status: 503 });
  try {
    const response = await fetch(target, { method: 'POST', headers: { 'content-type': 'application/json' }, body: await request.text(), cache: 'no-store' });
    return new NextResponse(response.body, { status: response.status, statusText: response.statusText, headers: { 'content-type': response.headers.get('content-type') || 'application/json' } });
  } catch (error: any) {
    console.error('Admin login proxy error:', error);
    return NextResponse.json({ error: 'Backend API is unreachable.', detail: error?.message || 'Unknown error' }, { status: 502 });
  }
}
