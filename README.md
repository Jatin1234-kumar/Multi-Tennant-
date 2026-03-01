# Multi-Tenant SaaS Monorepo

This repository is now split into two parts:

- `backend/` -> Node.js + Express + PostgreSQL multi-tenant API
- `frontend/` -> Vite-based frontend client for login/projects/tasks demo

## Run Backend

1. `cd backend`
2. Copy `.env.example` to `.env`
3. `npm install`
4. `npm run migrate:public`
5. `npm run dev`

## Run Frontend

1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Notes

- Backend resolves tenant from subdomain in `Host` header.
- Frontend currently uses API base `http://localhost:4000/api/v1`.
- For real tenant testing, send requests with tenant host like `acme.localhost:4000`.
