import express from 'express';
import cors from 'cors';
import authRoutes from './auth.js';
import adminRoutes from './adminUsers.js';
// @ts-ignore
import productRoutes from './routes/product.js';
// @ts-ignore
import serviceController from './serviceController.js';
import paymentsRoutes from './payments.js';

const app = express();
app.use('/api/payments/razorpay/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '2mb' }));
app.use(cors());

const getRouter = (r: any) => r.default || r;

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'mgvptltd-backend' }));
app.use('/api/auth', getRouter(authRoutes));
app.use('/api/admin', getRouter(adminRoutes));
app.use('/api', getRouter(productRoutes));
app.use('/api/services', getRouter(serviceController));
app.use('/api/payments', getRouter(paymentsRoutes));

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
