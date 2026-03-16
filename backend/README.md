# Multi-Tenant Project Management SaaS API

Backend starter for shared-database, separate-schema tenancy using Node.js, Express, and PostgreSQL.

## Quick start

1. Copy `.env.example` to `.env`
2. Install dependencies:
   - `npm install`
3. Run public migrations:
   - `node src/db/run-public-migrations.js`
4. Run tenant migrations for existing tenant schemas:
   - `npm run migrate:tenants`
5. Seed demo tenant and sample data:
   - `npm run seed:demo`
6. Start API:
   - `npm run dev`

## Demo login

- Tenant subdomain: `acme`
- Email: `admin@acme.com`
- Password: `Password@123`

Frontend sends tenant in header `x-tenant-subdomain`, so login works in local development when `ALLOW_TENANT_HEADER=true`.

Google OAuth setup:
- Backend `.env`: `GOOGLE_CLIENT_ID`
- Frontend `.env`: `VITE_GOOGLE_CLIENT_ID`

## Pagination

- `GET /api/v1/projects?page=1&pageSize=20`
- `GET /api/v1/tasks?page=1&pageSize=20&projectId=1`

Each list response includes a `pagination` object with `page`, `pageSize`, `total`, and `totalPages`.

## Core endpoints

- `POST /api/v1/system/tenants` (requires header `x-platform-key`)
- `POST /api/v1/onboarding/register-workspace`
- `POST /api/v1/auth/login` (tenant subdomain required)
- `POST /api/v1/auth/google` (tenant subdomain required, body: `idToken`)
- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `GET /api/v1/users`
- `POST /api/v1/users`
- `GET /api/v1/invites`
- `POST /api/v1/invites`
- `POST /api/v1/invites/accept`

## Tenant resolution

Tenant is resolved from request host subdomain.

Examples:
- `acme.localhost:4000` -> subdomain `acme`
- `acme.api.yourdomain.com` -> subdomain `acme`

## Security defaults

- Helmet enabled
- Rate limiting enabled
- Parameterized queries
- JWT auth + role checks
- Tenant token-to-subdomain enforcement
- Never trusts client-sent tenant ID

## Invite flow

1. Admin creates invite (`POST /api/v1/invites`) with email + role.
2. API returns one-time `inviteLink`.
3. Invitee opens link and submits password via `POST /api/v1/invites/accept`.
4. User account is created and JWT is returned for immediate login.
