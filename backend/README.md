# Multi-Tenant Project Management SaaS API

Backend starter for shared-database, separate-schema tenancy using Node.js, Express, and PostgreSQL.

## Quick start

1. Copy `.env.example` to `.env`
2. Install dependencies:
   - `npm install`
3. Run public migrations:
   - `node src/db/run-public-migrations.js`
4. Start API:
   - `npm run dev`

## Core endpoints

- `POST /api/v1/system/tenants` (requires header `x-platform-key`)
- `POST /api/v1/auth/login` (tenant subdomain required)
- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/tasks`
- `POST /api/v1/tasks`

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
