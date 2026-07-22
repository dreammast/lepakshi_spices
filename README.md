# Lepakshi Spices

This repository is organized as separate user, admin, backend, and database areas.

## Structure

- `apps/user` - customer ecommerce storefront frontend
- `apps/admin` - admin dashboard frontend
- `server` - Express + TypeScript backend API
- `database` - Drizzle schema, migrations, and seed script

Generated folders such as `node_modules` and `dist` are intentionally not included.

## Run Locally

Install dependencies for each package that you plan to run:

```bash
npm install
npm --prefix apps/user install
npm --prefix apps/admin install
npm --prefix server install
```

Start each part:

```bash
npm run dev:user
npm run dev:admin
npm run dev:server
```

Build checks:

```bash
npm run build:user
npm run build:admin
npm run build:server
```

## Database

Copy `.env.example` to `.env` in the project root, then fill in database credentials.

The Drizzle schema lives in `database/schema/schema.ts`. The backend schema mirror in `server/src/db/schema.ts` is kept aligned so the API can compile independently.

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Current API Coverage

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/categories`
- `GET /api/categories/:slug`
- `GET /api/products`
- `GET /api/products/:slug`
- Swagger UI at `/docs`
