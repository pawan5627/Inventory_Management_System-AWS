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

### EC2/ALB Deployment TLS
- For strict TLS to RDS on EC2:
	- Set in `src/.env`:
		- `RDS_SSL_MODE=require`
		- `RDS_SSL_REJECT_UNAUTHORIZED=true`
		- `RDS_SSL_CA_PATH=/opt/app/backend/rds-ca.pem`
		- Optionally `RDS_SSL_SERVERNAME=<your RDS cluster/writer endpoint>` if using reader endpoint for connections.
	- Download the region CA bundle at boot:
		- `curl -fsSL -o /opt/app/backend/rds-ca.pem https://truststore.pki.rds.amazonaws.com/us-east-1/us-east-1-bundle.pem`
	- Restart app after env changes: `pm2 restart inventory-api --update-env`.

### Launch Template user data
- Use `backend/scripts/user-data-backend.sh` to bootstrap EC2 instances (Node, PM2, Nginx, repo clone, CA bundle, `.env`). It:
	- Installs dependencies and runs `npm ci` before starting.
	- Starts PM2 with `--cwd /opt/app/backend` so Node resolves local `node_modules`.
	- Writes `RDS_SSL_CA_PATH` as an absolute path `/opt/app/backend/rds-ca.pem` (no `~`).
	- Optionally supports `RDS_SSL_SERVERNAME` to match RDS certificate SNI.
	- Configures Nginx to proxy `/:80 -> 127.0.0.1:4000`.
	Update `.env` values via LT or SSM parameters.
