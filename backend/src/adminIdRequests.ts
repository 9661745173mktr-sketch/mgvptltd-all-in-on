import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from './adminAuth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(requireAdmin);

router.get('/', async (req, res) => {
  try {
    const status = req.query.status ? String(req.query.status).toUpperCase() : undefined;
    const requests = await prisma.idCreationRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    const userIds = requests.map(r => r.creatorId);
    const users = userIds.length ? await prisma.user.findMany({ where: { id: { in: userIds } } }) : [];
    const userMap = new Map(users.map(u => [u.id, u]));

    res.json({
      requests: requests.map(r => {
        const user = userMap.get(r.creatorId);
        return {
          ...r,
          passwordHash: undefined,
          user: user ? {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role,
            accountStatus: user.accountStatus,
            paymentStatus: user.paymentStatus,
            walletBalance: user.walletBalance,
          } : null,
        };
      }),
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Unable to load ID requests.' });
  }
});

router.post('/:id/approve', async (req, res) => {
  try {
    const id = String(req.params.id);
    const adminId = String(req.body?.adminId || 'ADMIN');

    const result = await prisma.$transaction(async tx => {
      const request = await tx.idCreationRequest.findUnique({ where: { id } });
      if (!request) throw new Error('ID creation request not found.');
      if (request.status !== 'PENDING') throw new Error(`Request is already ${request.status}.`);

      const user = await tx.user.update({
        where: { id: request.creatorId },
        data: {
          accountStatus: 'Active',
          paymentStatus: 'Verified',
          approvedAt: new Date(),
          approvedBy: adminId,
        },
      });

      const updatedRequest = await tx.idCreationRequest.update({
        where: { id },
        data: { status: 'APPROVED', paymentStatus: 'VERIFIED' },
      });

      return { user, request: updatedRequest };
    });

    const { password: _password, ...safeUser } = result.user;
    res.json({ success: true, message: 'Payment verified and ID activated.', user: safeUser, request: result.request });
  } catch (error: any) {
    res.status(400).json({ error: error?.message || 'Unable to approve ID request.' });
  }
});

router.post('/:id/reject', async (req, res) => {
  try {
    const id = String(req.params.id);
    const remark = String(req.body?.remark || 'ID creation request rejected by admin');

    const result = await prisma.$transaction(async tx => {
      const request = await tx.idCreationRequest.findUnique({ where: { id } });
      if (!request) throw new Error('ID creation request not found.');
      if (request.status !== 'PENDING') throw new Error(`Request is already ${request.status}.`);

      const user = await tx.user.update({
        where: { id: request.creatorId },
        data: { accountStatus: 'Rejected', paymentStatus: 'Rejected' },
      });

      const updatedRequest = await tx.idCreationRequest.update({
        where: { id },
        data: { status: 'REJECTED', paymentStatus: 'REJECTED' },
      });

      return { user, request: updatedRequest, remark };
    });

    const { password: _password, ...safeUser } = result.user;
    res.json({ success: true, message: 'ID request rejected.', user: safeUser, request: result.request, remark: result.remark });
  } catch (error: any) {
    res.status(400).json({ error: error?.message || 'Unable to reject ID request.' });
  }
});

export default router;
