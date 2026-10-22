import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/authRoutes';
import { productRouter } from './routes/productRoutes';
import { orderRouter } from './routes/orderRoutes';
import { customsRouter } from './routes/customsRoutes';
import { hsCodeRouter } from './routes/hsCodeRoutes';
import { currencyRouter } from './routes/currencyRoutes';
import { artisanRouter } from './routes/artisanRoutes';
import { categoryRouter } from './routes/categoryRoutes';
import { adminRouter } from './routes/adminRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Mount API Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/customs', customsRouter);
app.use('/api/hs-codes', hsCodeRouter);
app.use('/api/currency', currencyRouter);
app.use('/api/artisans', artisanRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    platform: 'RuralCraft Global',
    version: '1.0.0',
    system_time: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌾 RuralCraft Global Backend API is running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
});
