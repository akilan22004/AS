import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { sessionConfig } from './config/session';
import { uploadRoot } from './config/uploads';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import { requireSameOrigin } from './middleware/sameOrigin';
import { checkSupabaseDatabaseConnection, isSupabaseAdminAuthEnabled } from './security/supabaseAuth';
import { prisma } from './config/database';

import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import promotionalRoutes from './routes/promotional.routes';
import settingsRoutes from './routes/settings.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const configuredOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const proxyHops = Number(process.env.TRUST_PROXY_HOPS);

if (isProduction) {
  const origin = new URL(configuredOrigin);
  if (origin.protocol !== 'https:' || origin.pathname !== '/' || origin.search || origin.hash) {
    throw new Error('Production CORS_ORIGIN must be a single HTTPS origin.');
  }
  if (!Number.isSafeInteger(proxyHops) || proxyHops < 1 || proxyHops > 5) {
    throw new Error('Set TRUST_PROXY_HOPS to the exact number of trusted HTTPS reverse proxies (1–5).');
  }
  app.set('trust proxy', proxyHops);
}

app.use((req, res, next) => {
  if (isProduction && !req.secure) {
    res.status(400).json({ success: false, error: 'HTTPS is required.' });
    return;
  }
  next();
});

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: (requestOrigin, callback) => {
    callback(null, requestOrigin === configuredOrigin ? configuredOrigin : false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'Authorization'],
}));

// Session
app.use(sessionConfig);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb', parameterLimit: 100 }));

// Compression
app.use(compression());
app.use('/api', requireSameOrigin);

// Static files for uploads
app.use('/uploads', express.static(uploadRoot, {
  maxAge: '1h',
  etag: true,
}));

// API rate limiting
app.use('/api', apiRateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/promotional', promotionalRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  const dependencies: Record<string, 'ok' | 'unavailable'> = {
    database: 'ok',
  };
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dependencies.database = 'unavailable';
  }
  if (isSupabaseAdminAuthEnabled) {
    try {
      await checkSupabaseDatabaseConnection();
      dependencies.supabase = 'ok';
    } catch {
      dependencies.supabase = 'unavailable';
    }
  }

  const healthy = Object.values(dependencies).every(status => status === 'ok');
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'unavailable',
    dependencies,
    timestamp: new Date().toISOString(),
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
