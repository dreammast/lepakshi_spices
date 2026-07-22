import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerJSDoc from 'swagger-jsdoc';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Lepakshi Spices API',
      version: '0.1.0',
      description: 'Express backend for Lepakshi Spices'
    },
    servers: [{ url: `http://localhost:${env.PORT}/api` }]
  },
  apis: [
    resolve(__dirname, '../routes/*.ts'),
    resolve(__dirname, '../routes/*.js'),
    resolve(__dirname, '../controllers/*.ts'),
    resolve(__dirname, '../controllers/*.js')
  ]
};

export const swaggerSpec = swaggerJSDoc(options);

