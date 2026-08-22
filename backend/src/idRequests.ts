import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'node:crypto';
import { verifyAdminToken } from './adminAuth.js';

const router = Router();
const prisma = new PrismaClient();
const ROLE_FEES: Record<string, number> = { MASTER_DISTRIBUTOR: 4999, SUPER_DISTRIBUTOR: 2999, DISTRIBUTOR: 1999, RETAILER: 999 };
const CHILD_ROLES: Record<string, string[]> = { ADMIN: ['MASTER_DISTRIBUTOR', 'SUPER_DISTRIBUTOR', 'DISTRIBUTOR', 'RETAILER'], MASTER_DISTRIBUTOR: ['SUPER_DISTRIBUTOR', 'DISTRIBUTOR', 'RETAILER'], SUPER_DISTRIBUTOR: ['DISTRIBUTOR', 'RETAILER'], DISTRIBUTOR: ['RETAILER'], RETAILER: [] };

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password, role, parentId, username, utr, paymentMethod } = req.body || {};
    const normalizedRole = String(role || 'RETAILER').toUpperCase();
    const cleanName = String(name || '').trim();
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '');
    const adminToken = String(req.headers['x-admin-token'] || '').trim();
    const creatorIsAdmin = verifyAdminToken(adminToken);
    if (!cleanName || cleanPhone.length !== 10 || !cleanEmail || cleanPassword.length < 6) return res.status(400).json({ error: 'Real name, valid 10-digit mobile, Gmail/email and password (6+ characters) are required.' });
    if (!ROLE_FEES[normalizedRole]) return res.status(400).json({ error: 'Invalid partner role.' });
    if (String(paymentMethod || '').toLowerCase() === 'upi' && !String(utr || '').trim()) return res.status(400).json({ error: 'UTR is required for UPI payment.' });

    let parent: any = null;
    if (parentId) parent = await prisma.user.findUnique({ where: { id: String(parentId) } });
    if (normalizedRole !== 'RETAILER' && !parent && !creatorIsAdmin) return res.status(403).json({ error: 'Only an approved parent account can create this level.' });
    if (parent) {
      if (parent.accountStatus !== 'Active' || parent.paymentStatus !== 'Verified') return res.status(403).json({ error: 'Parent account is not active.' });
      const allowedChildren = CHILD_ROLES[String(parent.role || '').toUpperCase()] || [];
      if (!allowedChildren.includes(normalizedRole)) return res.status(403).json({ error: 'Your role cannot create this level.' });
    }

    const existing = await prisma.user.findFirst({ where: { OR: [{ email: cleanEmail }, { phone: cleanPhone }, ...(username ? [{ username: String(username).trim() }] : [])] } });
    if (existing) return res.status(409).json({ error: 'This mobile, email or username is already registered.' });

    const amount = ROLE_FEES[normalizedRole];
    const result = await prisma.$transaction(async tx => {
      const user = await tx.user.create({ data: { name: cleanName, phone: cleanPhone, email: cleanEmail, username: username ? String(username).trim() : null, password: hashPassword(cleanPassword), role: normalizedRole, parentId: parentId ? String(parentId) : null, walletBalance: 0, accountStatus: 'Pending', paymentStatus: 'Pending' } });
      const request = await tx.idCreationRequest.create({ data: { creatorId: user.id, requestedRole: normalizedRole, applicantName: cleanName, applicantMobile: cleanPhone, applicantEmail: cleanEmail, username: user.username || `${normalizedRole.toLowerCase()}-${user.id.slice(0, 8)}`, passwordHash: user.password, amount, utr: String(utr || '').trim() || null, paymentStatus: String(paymentMethod || '').toLowerCase() === 'upi' ? 'PENDING_VERIFICATION' : 'PAYMENT_PENDING', status: 'PENDING' } });
      return { user, request };
    });
    const { password: _password, ...safeUser } = result.user;
    return res.status(201).json({ success: true, message: 'ID creation request submitted. Admin verification is required before login.', user: safeUser, request: result.request });
  } catch (error: any) {
    console.error('ID registration error:', error);
    return res.status(500).json({ error: error?.message || 'Unable to create ID request.' });
  }
});

export default router;
