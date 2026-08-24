import { NextResponse } from 'next/server';

const SUPABASE_URL = 'https://jbhqyxjixbnflseqrehe.supabase.co';
const SUPABASE_KEY = 'sb_publishable_o4p0aczIAEC_GDfD0f84T6Q_E8eK_yH4';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = {
      p_name: String(body?.name || '').trim(),
      p_phone: String(body?.phone || '').trim(),
      p_email: String(body?.email || '').trim(),
      p_password: String(body?.password || ''),
      p_role: String(body?.role || 'retailer'),
      p_utr: body?.utr ? String(body.utr).trim() : null,
      p_payment_method: String(body?.paymentMethod || 'upi'),
    };
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/portal_register_user`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json({ error: data?.message || 'Registration service failed.' }, { status: 502 });
    if (data?.error) return NextResponse.json(data, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Registration failed.' }, { status: 500 });
  }
}
