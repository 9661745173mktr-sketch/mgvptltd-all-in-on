import express from 'express';
import cors from 'cors';
import authRoutes from './auth.js';

// @ts-ignore
import productRoutes from './routes/product.js';
// @ts-ignore
import serviceController from './serviceController.js';
import paymentsRoutes from './payments.js';
import adminUsersRoutes from './adminUsers.js';

const app = express();
app.use('/api/payments/razorpay/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(cors());

// Safe Router Wrappers
const getRouter = (r: any) => r.default || r;

app.use('/api/auth', getRouter(authRoutes));
app.use('/api', getRouter(productRoutes));
app.use('/api/services', getRouter(serviceController));
app.use('/api/payments', getRouter(paymentsRoutes));
app.use('/api/admin', getRouter(adminUsersRoutes));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});