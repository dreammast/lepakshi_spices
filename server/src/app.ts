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

const app = express();
app.use(requestLogger);
app.use(helmet());
app.use(cors());
app.use(express.json());
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
