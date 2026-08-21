import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const allowed = ['MASTER_DISTRIBUTOR', 'SUPER_DISTRIBUTOR', 'DISTRIBUTOR', 'RETAILER'];
const permissions: Record<string, string[]> = {
  ADMIN: allowed,
  MASTER_DISTRIBUTOR: ['SUPER_DISTRIBUTOR', 'DISTRIBUTOR', 'RETAILER'],
  SUPER_DISTRIBUTOR: ['DISTRIBUTOR', 'RETAILER'],
  DISTRIBUTOR: ['RETAILER'],
  RETAILER: [],
};

router.post('/register', async (req, res) => {
  try {
    const { email, password, role, parentId, name, phone, username } = req.body || {};
    const normalizedRole = String(role || 'RETAILER').toUpperCase();
    if (!allowed.includes(normalizedRole)) return res.status(400).json({ error: 'Invalid partner role' });
    if (!email || !password || !name || !phone) return res.status(400).json({ error: 'Real name, mobile, email and password are required' });
    if (String(phone).replace(/\D/g, '').length < 10) return res.status(400).json({ error: 'Invalid mobile number' });
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone: String(phone) }, ...(username ? [{ username: String(username) }] : [])] } });
    if (existing) return res.status(400).json({ error: 'Email, mobile or username already exists' });
    if (parentId) {
      const parent = await prisma.user.findUnique({ where: { id: String(parentId) } });
      if (!parent) return res.status(400).json({ error: 'Parent account not found' });
      if (parent.accountStatus !== 'Active') return res.status(403).json({ error: 'Parent account is not active' });
      if (!(permissions[String(parent.role).toUpperCase()] || []).includes(normalizedRole)) return res.status(403).json({ error: 'Your role cannot create this level' });
    }
    const user = await prisma.user.create({ data: { name: String(name).trim(), phone: String(phone).trim(), email: String(email).trim().toLowerCase(), username: username ? String(username).trim() : null, password, role: normalizedRole, parentId: parentId ? String(parentId) : null, accountStatus: 'Pending', paymentStatus: 'Pending' } });
    res.json({ message: 'Registration submitted. Admin approval is required before login.', user: { ...user, password: undefined } });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await prisma.user.findUnique({ where: { email: String(email || '').trim().toLowerCase() } });
    if (!user || user.password !== password) return res.status(400).json({ error: 'Invalid email or password' });
    if (user.accountStatus !== 'Active') return res.status(403).json({ error: `Account is ${user.accountStatus}. Admin approval is required.` });
    const { password: _password, ...safe } = user;
    res.json({ message: 'Login Successful', user: safe });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

export default router;