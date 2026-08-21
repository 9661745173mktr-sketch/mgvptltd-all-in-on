import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { id, email, password, role, parentId, name, phone } = req.body;

    const normalizedRole = String(role || 'RETAILER').toUpperCase();
    const allowed = ['MASTER_DISTRIBUTOR', 'SUPER_DISTRIBUTOR', 'DISTRIBUTOR', 'RETAILER'];
    if (!allowed.includes(normalizedRole)) {
      return res.status(400).json({ error: 'Invalid partner role' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hierarchy: ADMIN can create all levels; MASTER -> SUPER/DIS/RETAILER;
    // SUPER -> DIS/RETAILER; DIS -> RETAILER.
    if (parentId) {
      const parent = await prisma.user.findUnique({ where: { id: String(parentId) } });
      if (!parent) return res.status(400).json({ error: 'Parent account not found' });

      const parentRole = String(parent.role).toUpperCase();
      const permissions: Record<string, string[]> = {
        ADMIN: allowed,
        MASTER_DISTRIBUTOR: ['SUPER_DISTRIBUTOR', 'DISTRIBUTOR', 'RETAILER'],
        SUPER_DISTRIBUTOR: ['DISTRIBUTOR', 'RETAILER'],
        DISTRIBUTOR: ['RETAILER'],
        RETAILER: [],
      };
      if (!(permissions[parentRole] || []).includes(normalizedRole)) {
        return res.status(403).json({ error: 'Your role cannot create this level' });
      }
    }

    const user = await prisma.user.create({
      data: {
        ...(id ? { id: String(id) } : {}),
        name,
        phone,
        email,
        password,
        role: normalizedRole,
        parentId: parentId ? String(parentId) : null,
        walletBalance: 0,
        accountStatus: 'Pending',
        paymentStatus: 'Pending',
      },
    });

    res.status(201).json({ message: 'Registration submitted. ID is DEACTIVE until admin verifies payment.', user: { ...user, password: undefined } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) { return res.status(400).json({ error: 'Invalid email or password' }); }
    if (String(user.accountStatus).toLowerCase() !== 'active' || String(user.paymentStatus).toLowerCase() !== 'verified') { return res.status(403).json({ error: 'Your ID is DEACTIVE / PENDING VERIFICATION. Admin must verify payment and activate your ID before login.' }); }
    const safeUser = { ...user, password: undefined };
    res.json({ message: 'Login Successful', user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;