import { NextResponse } from 'next/server';

const SUPABASE_URL = 'https://jbhqyxjixbnflseqrehe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_o4p0aczIAEC_GDfD0f84T6Q_E8eK_yH4';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = String(body?.email || body?.identifier || '').trim();
    const password = String(body?.password || '');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/portal_user_login`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_identifier: identifier, p_password: password }),
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json({ error: data?.message || 'Login service failed.' }, { status: 502 });
    if (data?.error) return NextResponse.json(data, { status: 401 });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Login failed.' }, { status: 500 });
  }
}
