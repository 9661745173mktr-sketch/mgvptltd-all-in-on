import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    apiBaseConfigured: Boolean(process.env.NEXT_PUBLIC_API_BASE_URL?.trim()),
    backendUrlConfigured: Boolean(process.env.BACKEND_API_URL?.trim()),
    databaseConfigured: Boolean(process.env.DATABASE_URL?.trim()),
    adminPasswordConfigured: Boolean(process.env.ADMIN_PASSWORD?.trim()),
  });
}
