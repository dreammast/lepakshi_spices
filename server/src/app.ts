import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { authInstance } from './config/better-auth.js';
import { toNodeHandler } from 'better-auth/node';
import router from './routes/index.js';
import { requestLogger } from './middleware/logger.middleware.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import { swaggerSpec } from './utils/swagger.js';
import { adminActivity } from './middleware/admin-activity.middleware.js';

const app = express();
app.use(requestLogger);
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true,
}));

// Better Auth handler — mounted BEFORE express.json() so the body stream is
// still available for any POST-based Better Auth endpoints.
// Mounted at /api/auth so Express strips the prefix before the handler sees
// the path (Better Auth expects /sign-in/google, not /api/auth/sign-in/google).
// Non-Better-Auth paths fall through to the main router below.
const baHandler = toNodeHandler(authInstance);
const BA_PREFIXES = ['/sign-in/', '/callback/', '/sign-out', '/get-session', '/sign-up/'];
app.use('/api/auth', (req, res, next) => {
  if (BA_PREFIXES.some((p) => req.path.startsWith(p))) {
    baHandler(req, res).catch(next);
    return;
  }
  // Restore original URL so downstream /api router can still match
  req.url = req.originalUrl;
  next();
});

app.use(express.json());
app.use(adminActivity);
app.use('/api', router);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(notFoundHandler);
app.use(errorHandler);

export function startServer() {
  const port = Number(env.PORT);
  app.listen(port, () => {
    console.log(`Lepakshi Spices backend listening on port ${port}`);
  });
}

if (!process.env.SUPPRESS_AUTO_START) {
  startServer();
}

export default app;
