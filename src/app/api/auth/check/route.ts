import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get('id')?.trim();
    if (!id) return NextResponse.json({ active: false }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { id }, select: { accountStatus: true, paymentStatus: true } });
    const active = !!user && user.accountStatus === 'Active' && user.paymentStatus === 'Verified';
    return NextResponse.json({ active });
  } catch {
    return NextResponse.json({ active: false, databaseConfigured: false }, { status: 503 });
  } finally {
    await prisma.$disconnect();
  }
}
