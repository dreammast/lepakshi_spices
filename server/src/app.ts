import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import router from './routes/index.js';
import { requestLogger } from './middleware/logger.middleware.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import { swaggerSpec } from './utils/swagger.js';
import { adminActivity } from './middleware/admin-activity.middleware.js';
import { runMigrations } from './db/migrate.js';

const app = express();
app.use(requestLogger);
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:5174',
      'http://localhost:5173',
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Better Auth handler — mounted BEFORE express.json() so the body stream is
// still available for any POST-based Better Auth endpoints.
// Better Auth expects paths like /sign-in/google (without the /api/auth prefix),
// so we match at root level and manually strip the prefix.
const baHandler = toNodeHandler(authInstance);
const BA_PREFIXES = ['/sign-in/', '/callback/', '/sign-out', '/get-session', '/sign-up/'];
app.use((req, res, next) => {
  const baMatch = req.path.match(/^\/api\/auth(\/.*)$/);
  if (baMatch && BA_PREFIXES.some((p) => baMatch[1].startsWith(p))) {
    const baReq = Object.assign(Object.create(req), {
      url: baMatch[1],
      path: baMatch[1],
    });
    baHandler(baReq, res).catch(next);
    return;
  }
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
  runMigrations().catch(err => console.warn('[migrate] Migration check failed:', err.message));
  app.listen(port, () => {
    console.log(`Lepakshi Spices backend listening on port ${port}`);
  });
}

if (!process.env.SUPPRESS_AUTO_START) {
  startServer();
}

export default app;
