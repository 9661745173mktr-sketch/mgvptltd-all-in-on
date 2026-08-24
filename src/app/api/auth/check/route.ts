import { NextResponse } from 'next/server';

const SUPABASE_URL = 'https://jbhqyxjixbnflseqrehe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_o4p0aczIAEC_GDfD0f84T6Q_E8eK_yH4';

export async function GET(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get('id')?.trim();
    if (!id) return NextResponse.json({ active: false }, { status: 400 });
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/portal_user_status`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_id: id }),
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({ active: false }));
    if (!response.ok) return NextResponse.json({ active: false, databaseConfigured: false }, { status: 503 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ active: false, databaseConfigured: false }, { status: 503 });
  }
}
