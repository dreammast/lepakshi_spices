# Lepakshi Spices Backend

This folder contains the Express + TypeScript backend for Lepakshi Spices.

## Structure

- `src/` - TypeScript source files
- `src/config` - environment and database configuration
- `src/routes` - API routes
- `src/controllers` - request handlers
- `src/services` - business logic layer
- `src/middleware` - Express middleware
- `src/utils` - shared utilities

## Setup

1. Copy the root `.env.example` to `../.env` and fill in environment variables.
2. Install dependencies:
   ```bash
   cd server
   npm install
   ```
3. Run locally:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Health check

- `GET /api/health`
- Swagger UI is available at `/docs`

## Sample category API

- `GET /api/categories`
- `GET /api/categories/:slug`

## Product API

- `GET /api/products`
- `GET /api/products/:slug`

The backend includes a repository-service-controller architecture with Zod validation helpers, a shared response utility, central error handling, and product listing/detail APIs.
