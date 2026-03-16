# Multi-Tenant SaaS Monorepo

This workspace is structured as a JavaScript full-stack app:

- `backend/` -> Node.js + Express API
- `frontend/` -> React + Vite client
- Database -> Neon PostgreSQL (using the existing `.env` connection)

The stack is MERN-style on the app side (React + Node/Express) while keeping your existing PostgreSQL database from `.env`.

## Backend Setup

1. `cd backend`
2. Copy `.env.example` to `.env` (or keep your existing `.env` values)
3. `npm install`
4. `npm run migrate:public`
5. `npm run migrate:tenants` (recommended if tenants already exist)
6. `npm run dev`

## Frontend Setup

1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Useful Backend Scripts

- `npm run seed:demo` -> Seed a demo tenant, admin user, and sample data
- `npm run check` -> Run startup health checks

## Notes

- API base URL in frontend is set in `frontend/src/services/api.js`.
- Tenant context is sent through `x-tenant-subdomain` for local development.
- In production, tenant resolution should be driven by subdomain host mapping.
- Google OAuth requires `GOOGLE_CLIENT_ID` in backend `.env` and `VITE_GOOGLE_CLIENT_ID` in frontend `.env`.
