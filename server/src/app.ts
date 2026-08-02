import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import router from './routes/index.js';
import rootHealthRoute from './routes/root-health.route.js';
import { requestLogger } from './middleware/logger.middleware.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import { swaggerSpec } from './utils/swagger.js';
import { adminActivity } from './middleware/admin-activity.middleware.js';
import { runMigrations } from './db/migrate.js';


const app = express();
app.use(requestLogger);
app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'unsafe-none' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins: string[] = [
  ...(env.FRONTEND_URL ? env.FRONTEND_URL.split(',').map((s) => s.trim()) : []),
  ...(env.ADMIN_FRONTEND_URL ? env.ADMIN_FRONTEND_URL.split(',').map((s) => s.trim()) : []),
  // Always allow all known Vercel frontend deployments
  'https://lepakshi-spices-ck8k.vercel.app',
  'https://lepakshi-spices-user.vercel.app',
  'https://lepakshi-spices-admin.vercel.app',
  'http://localhost:5174',
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, health checks)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Don't throw — silently deny so the response still goes through
      // without CORS headers (standard behavior) instead of crashing into
      // the error handler which strips CORS headers entirely.
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
}));

app.use(express.json());
app.use(adminActivity);
app.use('/health', rootHealthRoute);
app.use('/api', router);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(notFoundHandler);
app.use(errorHandler);

export async function startServer() {
  const port = Number(env.PORT);
  runMigrations().catch(err => console.warn('[migrate] Migration check failed:', err.message));
  // Brevo transport is verified on-demand during startup — no SMTP verify needed
  const { verifyEmailTransport } = await import('./mail/send-email.js');
  void verifyEmailTransport();
  app.listen(port, () => {
    console.log(`Lepakshi Spices backend listening on port ${port}`);
  });
}

if (!process.env.SUPPRESS_AUTO_START) {
  startServer();
}

export default app;
