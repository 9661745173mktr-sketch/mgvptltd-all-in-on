import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'node:crypto';
import { requireAdmin } from './adminAuth.js';

const router = Router();
const prisma = new PrismaClient();
const ROLES = ['MASTER_DISTRIBUTOR', 'SUPER_DISTRIBUTOR', 'DISTRIBUTOR', 'RETAILER'];

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

router.use(requireAdmin);

router.get('/stats', async (_req, res) => {
  try {
    const [users, pendingUsers, activeUsers, requests, pendingRequests, approvedRequests, rejectedRequests, walletTransactions] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { accountStatus: 'Pending' } }),
      prisma.user.count({ where: { accountStatus: 'Active' } }),
      prisma.serviceRequest.count(),
      prisma.serviceRequest.count({ where: { status: 'PENDING' } }),
      prisma.serviceRequest.count({ where: { status: 'APPROVED' } }),
      prisma.serviceRequest.count({ where: { status: 'REJECTED' } }),
      prisma.walletTransaction.findMany({ where: { status: { in: ['SUCCESS', 'APPROVED'] } }, select: { amount: true } }),
    ]);
    const totalWallet = (await prisma.user.aggregate({ _sum: { walletBalance: true } }))._sum.walletBalance || 0;
    const totalRevenue = (await prisma.serviceRequest.aggregate({ where: { status: 'APPROVED' }, _sum: { amountPaid: true } }))._sum.amountPaid || 0;
    const totalWalletTransactions = walletTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    res.json({ stats: { users, pendingUsers, activeUsers, requests, pendingRequests, approvedRequests, rejectedRequests, totalWallet, totalRevenue, totalWalletTransactions } });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/users', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ users: users.map(({ password, ...u }) => u) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const phone = String(req.body?.phone || '').replace(/\D/g, '');
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const username = String(req.body?.username || '').trim() || null;
    const role = String(req.body?.role || 'RETAILER').toUpperCase().replace(/[\s-]+/g, '_');
    const walletBalance = Number(req.body?.walletBalance || 0);
    if (!name || phone.length !== 10 || !email || password.length < 6) return res.status(400).json({ error: 'Real name, valid 10-digit mobile, email and password (6+ characters) are required.' });
    if (!ROLES.includes(role)) return res.status(400).json({ error: 'Invalid partner role.' });
    if (!Number.isFinite(walletBalance) || walletBalance < 0) return res.status(400).json({ error: 'Invalid wallet balance.' });
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }, ...(username ? [{ username }] : [])] } });
    if (existing) return res.status(409).json({ error: 'This mobile, email or username is already registered.' });
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        username,
        password: hashPassword(password),
        role,
        walletBalance,
        accountStatus: 'Active',
        paymentStatus: 'Verified',
        approvedAt: new Date(),
        approvedBy: 'ADMIN',
      },
    });
    const { password: _password, ...safe } = user;
    res.status(201).json({ success: true, message: 'User created and activated.', user: safe });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/users/:id/verify-activate', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: String(req.params.id) },
      data: {
        paymentStatus: 'Verified',
        accountStatus: 'Active',
        approvedAt: new Date(),
        approvedBy: String(req.body?.adminId || 'ADMIN'),
      },
    });
    const { password, ...safe } = user;
    res.json({ message: 'Payment verified and account activated.', user: safe });
  } catch (e: any) {
    res.status(404).json({ error: 'User not found' });
  }
});

router.post('/users/:id/reject', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: String(req.params.id) },
      data: { accountStatus: 'Rejected', paymentStatus: 'Rejected' },
    });
    const { password, ...safe } = user;
    res.json({ message: 'Account request rejected.', user: safe });
  } catch (e: any) {
    res.status(404).json({ error: 'User not found' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true, message: 'User deleted.' });
  } catch (e: any) {
    res.status(404).json({ error: 'User not found' });
  }
});

router.get('/service-requests', async (req, res) => {
  try {
    const status = req.query.status ? String(req.query.status).toUpperCase() : undefined;
    const requests = await prisma.serviceRequest.findMany({
      where: status ? { status } : undefined,
      include: { user: true, service: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ requests: requests.map(r => ({ ...r, user: { ...r.user, password: undefined } })) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/service-requests/:id/approve', async (req, res) => {
  try {
    const request = await prisma.serviceRequest.findUnique({ where: { id: String(req.params.id) } });
    if (!request) return res.status(404).json({ error: 'Service request not found' });
    if (request.status !== 'PENDING') return res.status(400).json({ error: `Request is already ${request.status}` });
    const updated = await prisma.serviceRequest.update({
      where: { id: request.id },
      data: { status: 'APPROVED', adminRemark: req.body?.remark ? String(req.body.remark) : null },
      include: { service: true },
    });
    res.json({ success: true, message: 'Service request approved.', request: updated });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/service-requests/:id/reject', async (req, res) => {
  try {
    const updated = await prisma.$transaction(async tx => {
      const request = await tx.serviceRequest.findUnique({ where: { id: String(req.params.id) } });
      if (!request) throw new Error('Service request not found');
      if (request.status !== 'PENDING') throw new Error(`Request is already ${request.status}`);
      if (!request.refundProcessed && request.amountPaid > 0) {
        await tx.user.update({ where: { id: request.userId }, data: { walletBalance: { increment: request.amountPaid } } });
        await tx.walletTransaction.create({ data: { userId: request.userId, type: 'SERVICE_REFUND', amount: request.amountPaid, reference: request.id, description: 'Refund for rejected service request', status: 'SUCCESS' } });
      }
      return tx.serviceRequest.update({ where: { id: request.id }, data: { status: 'REJECTED', refundProcessed: true, adminRemark: req.body?.remark ? String(req.body.remark) : null } });
    });
    res.json({ success: true, message: 'Request rejected and wallet refunded.', request: updated });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/wallet/recharge-request', async (req, res) => {
  try {
    const { userId, amount, utr, reference } = req.body || {};
    const n = Number(amount);
    if (!userId || !Number.isFinite(n) || n <= 0) return res.status(400).json({ error: 'Valid userId and amount are required' });
    const user = await prisma.user.findUnique({ where: { id: String(userId) } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const tx = await prisma.walletTransaction.create({ data: { userId: user.id, type: 'RECHARGE_REQUEST', amount: n, reference: String(reference || utr || ''), description: utr ? `Manual recharge UTR: ${utr}` : 'Manual wallet recharge request', status: 'PENDING' } });
    res.json({ success: true, message: 'Recharge request sent to admin.', transaction: tx });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/wallet/recharge-requests', async (_req, res) => {
  try {
    const transactions = await prisma.walletTransaction.findMany({ where: { type: 'RECHARGE_REQUEST' }, include: { user: true }, orderBy: { createdAt: 'desc' } });
    res.json({ transactions: transactions.map(t => ({ ...t, user: { ...t.user, password: undefined } })) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/wallet/recharge-requests/:id/approve', async (req, res) => {
  try {
    const result = await prisma.$transaction(async tx => {
      const request = await tx.walletTransaction.findUnique({ where: { id: String(req.params.id) } });
      if (!request || request.type !== 'RECHARGE_REQUEST') throw new Error('Recharge request not found');
      if (request.status !== 'PENDING') throw new Error(`Recharge is already ${request.status}`);
      const user = await tx.user.update({ where: { id: request.userId }, data: { walletBalance: { increment: request.amount } } });
      const approved = await tx.walletTransaction.update({ where: { id: request.id }, data: { status: 'APPROVED', description: `Wallet recharge approved by ${String(req.body?.adminId || 'ADMIN')}` } });
      return { approved, balance: user.walletBalance };
    });
    res.json({ success: true, message: 'Recharge approved and wallet credited.', ...result });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/wallet/recharge-requests/:id/reject', async (req, res) => {
  try {
    const request = await prisma.walletTransaction.findUnique({ where: { id: String(req.params.id) } });
    if (!request || request.type !== 'RECHARGE_REQUEST') return res.status(404).json({ error: 'Recharge request not found' });
    if (request.status !== 'PENDING') return res.status(400).json({ error: `Recharge is already ${request.status}` });
    const updated = await prisma.walletTransaction.update({ where: { id: request.id }, data: { status: 'REJECTED', description: String(req.body?.remark || 'Recharge rejected by admin') } });
    res.json({ success: true, message: 'Recharge request rejected.', transaction: updated });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/wallet/manual-credit', async (req, res) => {
  try {
    const mobile = String(req.body?.mobile || '').trim();
    const amount = Number(req.body?.amount);
    const remark = String(req.body?.remark || 'Admin manual wallet credit');
    if (!mobile || !Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Valid mobile and positive amount are required.' });
    const result = await prisma.$transaction(async tx => {
      const user = await tx.user.findUnique({ where: { phone: mobile } });
      if (!user) throw new Error('User not found for this mobile number.');
      const updatedUser = await tx.user.update({ where: { id: user.id }, data: { walletBalance: { increment: amount } } });
      const transaction = await tx.walletTransaction.create({ data: { userId: user.id, type: 'ADMIN_CREDIT', amount, reference: `ADMIN-${Date.now()}`, description: remark, status: 'SUCCESS' } });
      return { user: { id: updatedUser.id, name: updatedUser.name, phone: updatedUser.phone, walletBalance: updatedUser.walletBalance }, transaction };
    });
    res.json({ success: true, message: `₹${amount} credited to ${result.user.name || result.user.phone}.`, ...result });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
