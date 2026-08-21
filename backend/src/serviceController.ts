import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const num = (v: unknown) => Number(v);

router.get('/', async (_req, res) => {
  try {
    const services = await prisma.serviceItem.findMany({
      where: { status: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, services });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/request', async (req, res) => {
  try {
    const { userId, serviceId, inputData } = req.body || {};
    if (!userId || !serviceId) return res.status(400).json({ error: 'userId and serviceId are required' });

    const service = await prisma.serviceItem.findUnique({ where: { id: String(serviceId) } });
    if (!service || !service.status) return res.status(404).json({ error: 'Service is not active' });

    const user = await prisma.user.findUnique({ where: { id: String(userId) } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.accountStatus !== 'Active') return res.status(403).json({ error: 'Account is not active' });

    const amount = num(service.price);
    if (!Number.isFinite(amount) || amount < 0) return res.status(400).json({ error: 'Invalid service price' });
    if (user.walletBalance < amount) return res.status(400).json({ error: 'Insufficient wallet balance' });

    const request = await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { walletBalance: { decrement: amount } } });
      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          type: 'SERVICE_DEBIT',
          amount: -amount,
          reference: service.id,
          description: `Service request: ${service.title}`,
          status: 'SUCCESS',
        },
      });
      return tx.serviceRequest.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          inputData: typeof inputData === 'string' ? inputData : JSON.stringify(inputData || {}),
          amountPaid: amount,
          commission: service.commission,
          status: 'PENDING',
        },
        include: { service: true, user: true },
      });
    });

    res.json({ success: true, message: 'Request submitted. Amount reserved from wallet.', request });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/requests/:userId', async (req, res) => {
  try {
    const requests = await prisma.serviceRequest.findMany({
      where: { userId: String(req.params.userId) },
      include: { service: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, requests });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
