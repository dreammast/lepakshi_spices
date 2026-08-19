# Lepakshi Spices
Professional, production-oriented monorepo for the Lepakshi Spices ecommerce platform.
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![MySQL](https://img.shields.io/badge/MySQL-TiDB-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
Overview
--------
Professional, production-oriented monorepo for the **Lepakshi Spices** ecommerce platform — a full-stack spice retail and wholesale business built for traceable, farm-to-jar commerce.
Lepakshi Spices is an ecommerce platform repository containing separate frontends for customers and administrators, a TypeScript/Express backend API, and a Drizzle-managed database schema and migrations.
## About the project
Key Features
------------
**Lepakshi Spices** is a modern ecommerce platform for selling premium, single-origin spices. The system supports both **retail customers** (browse, cart, checkout, wishlist, reviews) and **wholesale buyers** (inquiries, quotations, PDF quotes, and order workflows). An **admin dashboard** gives staff full control over catalog, orders, campaigns, customers, and site content.
- Customer storefront (React + Vite)
- Admin dashboard (React + Vite)
- TypeScript backend API (Express)
- Drizzle ORM schema, migrations, and seed scripts
- Monorepo layout with workspace tooling (pnpm)
The repository is organized as a monorepo with two React frontends, one shared Express API, and a Drizzle-managed database layer with migrations and seed scripts.
Tech stack
----------
### What it does
- Languages: TypeScript, SQL
- Frontend: React, Vite
- Backend: Node.js, Express
- Database: PostgreSQL (managed via Drizzle)
- Package manager: pnpm / npm-compatible scripts
- Deployment: Docker-ready, CI-friendly
| Area | Capabilities |
|------|-------------|
| **Storefront** (`apps/user`) | Product catalog, collections, cart, wishlist, checkout, order tracking, coupons, recipes, reviews, wholesale inquiry & quote flows, CMS-driven homepage |
| **Admin** (`apps/admin`) | Dashboard analytics, product & category management, orders, customers, coupons, campaigns, recipes, wholesale pipeline, audit logs, site settings |
| **API** (`server`) | REST endpoints, JWT auth, role-based access (admin / staff / manager), file uploads (Cloudinary), Razorpay payments, email (Brevo), SSE realtime updates |
| **Database** (`database`) | Drizzle schema, SQL migrations, seed & reset scripts |
Repository structure
--------------------
## Tech stack
- `apps/user` — customer-facing storefront
- `apps/admin` — administration dashboard
- `server` — backend API, controllers, services, and routes
- `database` — Drizzle schema, migrations, and seed scripts
### Frontend
- **React 18** + **Vite 6** — customer storefront and admin dashboard
- **Tailwind CSS 4** — styling and layout
- **Radix UI** + **shadcn-style components** — accessible UI primitives
- **Material UI** + **Lucide** icons — additional UI components
- **React Router 7** — client-side routing
- **React Hook Form**, **Recharts**, **Motion** — forms, charts, and animations
- **Firebase** — client-side integrations where configured
Quickstart (development)
------------------------
### Backend
- **Node.js 20** + **Express 4** — REST API
- **TypeScript** — end-to-end type safety
- **Zod** — environment and request validation
- **JWT** + **bcrypt** — authentication and password hashing
- **Drizzle ORM** — schema, queries, and migrations
- **MySQL / TiDB** — primary database (`mysql2` driver)
- **Pino** — structured logging
- **Swagger** — API documentation at `/docs`
- **Server-Sent Events (SSE)** — realtime admin and user notifications
1. Install root dependencies and per-package dependencies you need to run:
### Integrations & services
- **Razorpay** — payment processing
- **Cloudinary** — image and media uploads
- **Brevo** — transactional email (order confirmations, wholesale quotes)
- **Google OAuth** — optional social sign-in
- **PDFKit** — wholesale quotation PDF generation
```bash
pnpm install
pnpm --filter ./apps/user install
pnpm --filter ./apps/admin install
pnpm --filter ./server install
### DevOps & deployment
- **Docker** — containerized backend (`server/Dockerfile`)
- **Render** — backend API hosting
- **Vercel** — frontend static deployments
- **npm workspaces-style scripts** — root-level build and dev commands
## Repository structure
```
lepakshi_spices/
├── apps/
│   ├── user/          # Customer-facing storefront (React + Vite)
│   └── admin/         # Administration dashboard (React + Vite)
├── server/            # Express API — routes, services, controllers, mail, realtime
├── database/
│   ├── schema/        # Drizzle schema definitions
│   ├── migrations/    # SQL migration files
│   └── seed/          # Seed and backup scripts
├── scripts/           # DB check, API check, and helper utilities
└── render.yaml        # Render deployment configuration
```
2. Create environment file and fill credentials:
## Quickstart (development)
### 1. Install dependencies
```bash
cp .env.example .env
# edit .env with database and SMTP credentials
npm install
npm --prefix apps/user install
npm --prefix apps/admin install
npm --prefix server install
```
3. Run the apps you want to work on:
### 2. Configure environment
Create a `.env` file at the repository root with database, JWT, Brevo email, and integration credentials. Required variables include:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `BREVO_API_KEY`, `MAIL_FROM_NAME`, `MAIL_FROM_EMAIL`
- Optional: `CLOUDINARY_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
### 3. Run locally
```bash
pnpm --filter ./apps/user dev
pnpm --filter ./apps/admin dev
pnpm --filter ./server dev
# Customer storefront (default: http://localhost:5173)
npm run dev:user
# Admin dashboard (default: http://localhost:5174)
npm run dev:admin
# Backend API (default: http://localhost:4000)
npm run dev:server
```
Build
-----
API docs are available at `http://localhost:4000/docs` when the server is running.
## Build
```bash
pnpm --filter ./apps/user build
pnpm --filter ./apps/admin build
pnpm --filter ./server build
npm run build:user
npm run build:admin
npm run build:server
```
Database
--------
## Database
The Drizzle schema lives in `database/schema/schema.ts`. Typical database tasks:
Schema lives in `database/schema/`. Common tasks from the repo root:
```bash
