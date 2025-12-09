# Backend (Node.js + Express + PostgreSQL)

## Prerequisites
- Node.js 18+
- PostgreSQL on AWS RDS (writer/reader endpoints)

## Environment
Create `src/.env` with your RDS details:

```
PORT=4000

# AWS RDS
RDS_HOST=your-writer-endpoint.rds.amazonaws.com
RDS_PORT=5432
RDS_USER=youruser
RDS_PASSWORD=yourpassword
RDS_DATABASE=inventory_db

# Optional SSL config (recommended for RDS)
RDS_SSL_MODE=require
RDS_SSL_REJECT_UNAUTHORIZED=false
# If you have a CA bundle file, set path (supports ~ expansion)
# RDS_SSL_CA_PATH=~/rds-ca-bundle.pem

# CORS frontend origin
FRONTEND_ORIGIN=http://localhost:5173

# JWT secret (dev fallback is built-in if omitted)
# JWT_SECRET=supersecret
```

## Install
```
cd backend
npm install
```

## Seed Database
- Full schema and demo data:
```
npm run seed:pg
```
- Ensure admin is present (admin@example.com / ChangeMe123!):
```
npm run seed:admin
```

## Run
```
npm run dev
```
Server listens on `http://localhost:4000`.

## API Overview
- Auth: `POST /api/auth/login` body `{ username, password }`
- Items: `GET /api/items` (auth), `POST /api/items`
- Categories: `GET /api/categories` (auth)
- Users: `GET /api/users` (auth)
- Departments: `GET /api/departments` (auth)
- Companies: `GET /api/companies` (auth)

Attach `Authorization: Bearer <JWT>` for protected endpoints.

## Notes
- Dual DB pools: writer for mutations, reader for list queries.
- SSL can be toggled via `RDS_SSL_MODE` and `RDS_SSL_REJECT_UNAUTHORIZED`.
- CORS is restricted to `FRONTEND_ORIGIN`.
