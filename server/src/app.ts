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
import { verifyEmailTransport } from './mail/send-email.js';

const app = express();
app.use(requestLogger);
app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'unsafe-none' },
}));
app.use(cors({
  origin: (origin, callback) => {
    const configuredOrigins = [
      ...(env.FRONTEND_URL ? env.FRONTEND_URL.split(',').map((s) => s.trim()) : []),
      ...(env.ADMIN_FRONTEND_URL ? env.ADMIN_FRONTEND_URL.split(',').map((s) => s.trim()) : []),
      'http://localhost:5174',
      'http://localhost:5173',
    ];
    if (!origin || configuredOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(adminActivity);
app.use('/health', rootHealthRoute);
app.use('/api', router);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(notFoundHandler);
app.use(errorHandler);

export function startServer() {
  const port = Number(env.PORT);
  runMigrations().catch(err => console.warn('[migrate] Migration check failed:', err.message));
  void verifyEmailTransport();
  app.listen(port, () => {
    console.log(`Lepakshi Spices backend listening on port ${port}`);
  });
}

if (!process.env.SUPPRESS_AUTO_START) {
  startServer();
}

export default app;
