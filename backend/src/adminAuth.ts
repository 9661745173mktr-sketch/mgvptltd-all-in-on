import { createHmac, timingSafeEqual } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

const secret = () => process.env.AUTH_SECRET || process.env.ADMIN_TOKEN_SECRET || 'CHANGE-ME-IN-PRODUCTION';

export function createAdminToken(adminId = 'ADMIN') {
  const payload = Buffer.from(JSON.stringify({ sub: adminId, role: 'ADMIN', exp: Date.now() + 12 * 60 * 60 * 1000 })).toString('base64url');
  const signature = createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyAdminToken(token: string | undefined) {
  if (!token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = createHmac('sha256', secret()).update(payload).digest('base64url');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.role === 'ADMIN' && Number(data.exp) > Date.now();
  } catch {
    return false;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = String(req.headers['x-admin-token'] || '').trim();
  if (!verifyAdminToken(token)) return res.status(401).json({ error: 'Admin authentication required.' });
  next();
}
