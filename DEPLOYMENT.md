# Deployment Guide (AWS: VPC, ALB, ASG, RDS)

This guide describes deploying the Inventory Management System on AWS using:
- VPC (private and public subnets)
- Application Load Balancer (ALB)
- Auto Scaling Group (ASG) for frontend and backend EC2 instances
- AWS RDS (PostgreSQL)

## Phased Deployment Overview
Deploy in clear, verifiable phases to reduce risk and simplify rollbacks.

- Phase 1: Networking & Security
  - Create VPC, subnets, IGW, NAT, route tables.
  - Create Security Groups for ALBs, EC2, and RDS.
- Phase 2: Database (RDS PostgreSQL)
  - Provision RDS in private subnets; confirm connectivity from a bastion.
- Phase 3: Backend Stack
  - Create Backend Target Group + ALB (HTTP/HTTPS).
  - Create Backend Launch Template + ASG with user-data.
  - Verify backend health via ALB target group path (`/api/health` or `/api/items`).
- Phase 4: Frontend Stack
  - Create Frontend Target Group + ALB (HTTP/HTTPS).
  - Create Frontend Launch Template + ASG with user-data.
  - Verify app loads over ALB; confirm it calls `VITE_API_BASE`.
- Phase 5: Shared Storage (Optional)
  - S3 for artifacts/backups; EFS for shared uploads across EC2.
- Phase 6: DNS & TLS
  - Request ACM certs; validate via Route 53.
  - Attach certs to ALBs (443); create ALIAS records for `app.example.com` and `api.example.com`.
- Phase 7: Verification & Observability
  - Smoke tests, JWT-protected requests, CORS checks.
  - CloudWatch logs/alarms, PM2 and Nginx logs.
- Phase 8: Scaling & Cost Tuning
  - Configure scaling policies; right-size instances/RDS; optimize NAT/ALB timeouts.

---

## Phase 1: Networking & Security (VPC, Subnets, Routing, SGs)

1) Create VPC
- CIDR: `10.0.0.0/16`
- DNS hostnames: enabled

2) Create Subnets (use two AZs, e.g., `a` and `b`)
- Public: `10.0.1.0/24` (AZ-a), `10.0.2.0/24` (AZ-b)
- Private-App: `10.0.11.0/24` (AZ-a), `10.0.12.0/24` (AZ-b)
- Private-DB: `10.0.21.0/24` (AZ-a), `10.0.22.0/24` (AZ-b)

3) Internet + NAT
- Create Internet Gateway; attach to VPC.
- Create NAT Gateway in each public subnet (or one for cost-savings).

4) Route Tables
- Public RT: 0.0.0.0/0 → IGW; associate with public subnets.
- Private-App RT: 0.0.0.0/0 → NAT; associate with private-app subnets.
- Private-DB RT: No internet route (optional), associate with private-db subnets.

5) Security Groups
- `sg-alb-frontend`: Inbound 80/443 from 0.0.0.0/0; outbound allow.
- `sg-alb-backend`: Inbound 80/443 from 0.0.0.0/0; outbound allow.
- `sg-ec2-frontend`: Inbound 80 from `sg-alb-frontend`, SSH from your IP; outbound 0.0.0.0/0.
- `sg-ec2-backend`: Inbound 80 from `sg-alb-backend`, SSH from your IP; outbound 0.0.0.0/0 + to RDS SG.
- `sg-rds`: Inbound 5432 from `sg-ec2-backend` only; outbound allow.

Acceptance checks
- Can you launch a test EC2 in private-app and reach internet via NAT? Try `curl https://api.github.com`.
- ALB SGs accept 80/443 from internet.

---

## Phase 2: Database (RDS PostgreSQL)

1) Create RDS PostgreSQL
- Engine: PostgreSQL 14/15
- Subnets: private-db subnets (DB subnet group)
- SG: `sg-rds`
- Storage: gp3, 20–50GB to start
- Credentials: set `RDS_USER`/`RDS_PASSWORD`

2) Parameter groups (optional)
- Set `rds.force_ssl=1` if desired; we already use SSL in app.

3) Outputs/Notes
- Writer endpoint: `RDS_HOST`
- Port: `5432`

Acceptance checks
- From a bastion or backend EC2 (with psql installed), connect:
```bash
psql "host=<RDS_HOST> port=5432 user=<RDS_USER> dbname=inventory_db sslmode=require"
```

---

## Phase 3: Backend Stack (ALB, TG, LT, ASG)

1) Create Backend Target Group `tg-backend`
- Target type: Instance
- Protocol: HTTP, Port: 80
- Health check: Path `/api/health` (or `/api/items`), Matcher 200

2) Create Backend ALB
- Scheme: internet-facing
- Subnets: public (both AZs)
- SG: `sg-alb-backend`
- Listeners:
  - 80 → redirect to 443
  - 443 (ACM cert) → forward to `tg-backend`

3) Backend Launch Template `lt-backend`
- AMI: Amazon Linux 2023
- Subnets: private-app via ASG
- SG: `sg-ec2-backend`
- User Data: use the Backend User Data from this guide. Ensure `.env` is filled with your RDS and CORS values.

4) Backend ASG
- Min/Desired/Max: 1/2/4
- Attach to `tg-backend`
- Health check type: ELB

5) Seed DB on first instance (optional)
- User data runs `npm run seed:pg` and `npm run seed:admin`. For multi-instance, guard with a lock file or run manually once.

Acceptance checks
- ALB DNS: `https://<backend-alb-dns>/api/items` should return 401 without token.
- Once you login from frontend and get JWT, curl with token:
```bash
curl -H "Authorization: Bearer <JWT>" https://api.example.com/api/items
```

---

## Phase 4: Frontend Stack (ALB, TG, LT, ASG)

1) Create Frontend Target Group `tg-frontend`
- Target type: Instance
- Protocol: HTTP, Port: 80
- Health check: Path `/`, Matcher 200

2) Create Frontend ALB
- Scheme: internet-facing
- Subnets: public (both AZs)
- SG: `sg-alb-frontend`
- Listeners:
  - 80 → redirect to 443
  - 443 (ACM cert) → forward to `tg-frontend`

3) Frontend Launch Template `lt-frontend`
- AMI: Amazon Linux 2023
- SG: `sg-ec2-frontend`
- User Data: use the Frontend User Data from this guide. Ensure `VITE_API_BASE` points to backend ALB domain.

4) Frontend ASG
- Min/Desired/Max: 1/2/4
- Attach to `tg-frontend`
- Health check type: ELB

Acceptance checks
- ALB DNS: `https://<frontend-alb-dns>/` loads app.
- Login with `admin@example.com / ChangeMe123!` and confirm Dashboard uses live data.

---

## Phase 5: Shared Storage (Optional — S3/EFS)

Option A — S3 for artifacts/backups
- Create S3 bucket with versioning.
- CI/CD uploads `build.zip` after `npm run build`.
- Update Frontend User Data to pull from S3:
```bash
aws s3 cp s3://<bucket>/build.zip /opt/app/build.zip
unzip -o /opt/app/build.zip -d /opt/app/frontend/dist
```
- Backend backups (optional): nightly cron with `pg_dump` to S3.

Option B — EFS for shared uploads
- Create EFS filesystem; mount targets in both private-app subnets.
- SG: allow NFS (TCP 2049) from `sg-ec2-backend`.
- Backend user data (add):
```bash
sudo yum install -y amazon-efs-utils
sudo mkdir -p /mnt/efs/uploads
echo "fs-XXXXXXXX:/ /mnt/efs efs _netdev,tls,iam 0 0" | sudo tee -a /etc/fstab
sudo mount -a
sudo chown -R ec2-user:ec2-user /mnt/efs
```
- App env: `UPLOADS_DIR=/mnt/efs/uploads` and use that in code for file writes.

Acceptance checks
- Write a test file to `/mnt/efs/uploads` on one instance; verify availability from another.

---

## Phase 6: DNS & TLS (Route 53 + ACM)

1) ACM Certificates
- In the same region as your ALBs, request certs for `app.example.com` and `api.example.com`.
- Choose DNS validation; add CNAMEs in Route 53.

2) ALB HTTPS
- Attach certs to 443 listeners for both ALBs.
- Ensure 80 → 443 redirects.

3) Route 53 Records
- Create ALIAS A/AAAA records:
  - `app.example.com` → Frontend ALB
  - `api.example.com` → Backend ALB

Acceptance checks
- `https://app.example.com` loads frontend.
- `https://api.example.com/api/items` reachable.

---

## Phase 7: Verification & Observability

1) Smoke Tests
- Frontend: login and navigate Dashboard, Items, Users.
- Backend: curl protected endpoints with JWT.

2) CORS
- Backend `.env`: `FRONTEND_ORIGIN=https://app.example.com`
- Confirm no CORS errors in browser devtools.

3) Logs & Metrics
- PM2 logs: `pm2 logs inventory-api`
- Nginx logs: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- CloudWatch: enable ALB/EC2 metrics and alarms (CPU, 5xx, UnhealthyHostCount).

Acceptance checks
- No 5xx in ALB metrics; health checks show Healthy.

---

## Phase 8: Scaling & Cost Tuning

1) ASG Policies
- Scale on CPU or `ALB RequestCountPerTarget`.
- Instance warm-up aligned with app startup time.

2) Right-sizing
- Use `t3/t4g` (ARM Graviton requires compatible AMI) for cost savings.
- Adjust RDS instance class and storage.

3) Networking Costs
- NAT Gateway hourly + data costs; consider one NAT if acceptable.

4) ALB Settings
- Idle timeout suitable for your traffic; health check intervals/timeouts tuned.

Acceptance checks
- Scaling events succeed; instances register healthy quickly; costs are within budget.

## Architecture Overview
- VPC: 2+ AZs, public subnets for ALB, private subnets for EC2 and RDS.
- ALBs: One ALB for frontend (HTTP/HTTPS), one ALB for backend API (HTTP/HTTPS). You can use a single ALB with two target groups and path-based routing if preferred.
- ASGs: 
  - Frontend ASG: serves built React app via Nginx.
  - Backend ASG: runs Node.js API via PM2 and reverse-proxied by Nginx.
- RDS: PostgreSQL in private subnets with security group allowing backend ASG instances.

## Prerequisites
- Domain in Route 53 (recommended)
- ACM certificates for your frontend and backend domains (e.g., `app.example.com`, `api.example.com`)
- Security Groups for ALBs and EC2 (or include in CloudFormation)
- S3 bucket (optional) for build artifacts if using CI/CD

## DNS (Route 53) and TLS (ACM)
- Create Hosted Zone in Route 53 or use existing domain.
- Request ACM certificates in the same region as your ALBs. Use DNS validation.
- Add the provided CNAME records in Route 53 to validate certificates.
- After validation, attach the certificates to your ALB HTTPS (443) listeners for `app.example.com` and `api.example.com`.
- Create A/AAAA records in Route 53 pointing to the respective ALB (alias) for `app.example.com` and `api.example.com`.

## Networking (VPC)
1. Create VPC (e.g., 10.0.0.0/16).
2. Create public subnets (e.g., 10.0.1.0/24, 10.0.2.0/24).
3. Create private subnets (e.g., 10.0.11.0/24, 10.0.12.0/24).
4. Internet Gateway attached to VPC; route public subnets to IGW.
5. NAT Gateway in public subnets; route private subnets to NAT for outbound internet.

## Security Groups (recommended structure)
- `sg-alb-frontend`: Inbound 80/443 from internet; outbound to target group.
- `sg-alb-backend`: Inbound 80/443 from internet; outbound to target group.
- `sg-ec2-frontend`: Inbound from `sg-alb-frontend` on 80; allow SSH from admin IP; outbound 443.
- `sg-ec2-backend`: Inbound from `sg-alb-backend` on 80; allow SSH from admin IP; outbound 443 and to RDS.
- `sg-rds`: Inbound 5432 from `sg-ec2-backend`, outbound as required.

## RDS (PostgreSQL)
- Create RDS PostgreSQL in private subnets with `sg-rds`.
- Note writer endpoint (`RDS_HOST`), port, database, user, password.
- Optionally enable IAM auth (this guide uses user/password).

## ALB + Target Groups
- Frontend ALB with target group `tg-frontend` (HTTP 80) pointing to frontend ASG instances.
- Backend ALB with target group `tg-backend` (HTTP 80) pointing to backend ASG instances.
- Attach ACM certificates; add listeners:
  - 443 → forward to target group
  - 80 → redirect to 443
- Route 53 records:
  - `app.example.com` → Frontend ALB
  - `api.example.com` → Backend ALB

### Health Check Paths
- Frontend Target Group: path `/` should return 200.
- Backend Target Group: path `/api/items` (or implement `/api/health`) should return 200.

## AMIs or Launch Templates
Create two Launch Templates (LT):
- `lt-frontend`: Amazon Linux 2/2023 AMI, `sg-ec2-frontend`, private subnets.
- `lt-backend`: Amazon Linux 2/2023 AMI, `sg-ec2-backend`, private subnets.
Include User Data for bootstrapping.

### Frontend User Data (Nginx serving built React)
Use this as Launch Template user data:
```
#!/bin/bash
set -e
# Install basics
sudo yum update -y
sudo yum install -y git nginx nodejs

# Fetch app (replace with your repo/deploy method)
sudo mkdir -p /opt/app
cd /opt/app
sudo git clone https://github.com/pawan5627/Inventory_Management_System-AWS.git .
cd frontend
sudo npm install --omit=dev
sudo npm run build

# Nginx config
cat << 'EOF' | sudo tee /etc/nginx/conf.d/frontend.conf
server {
    listen 80 default_server;
    server_name _;
    root /opt/app/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optionally proxy API
    # If you prefer proxying API at the edge (optional)
    # location /api/ {
    #     proxy_pass https://api.example.com/;
    #     proxy_set_header Host $host;
    #     proxy_set_header X-Real-IP $remote_addr;
    #     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    # }
}
EOF

sudo systemctl enable nginx
sudo systemctl restart nginx
```
Notes:
- Keep API calls pointed to `VITE_API_BASE` env at build time (`https://api.example.com`).

### Optional: Use S3 for Frontend Artifacts
- Build frontend in CI/CD and upload to S3 bucket (versioned).
- In EC2 user data, download latest build artifact from S3:
  - `aws s3 cp s3://your-bucket/build.zip /opt/app/build.zip`
  - `unzip -o /opt/app/build.zip -d /opt/app/frontend/dist`
- This enables quick instance replacement and consistent artifacts across ASG.

### Backend User Data (PM2 + Nginx)
```
#!/bin/bash
set -e
# Install basics
sudo yum update -y
sudo yum install -y git nginx
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo -E bash -
sudo yum install -y nodejs
sudo npm install -g pm2

# Fetch app
sudo mkdir -p /opt/app
cd /opt/app
sudo git clone https://github.com/pawan5627/Inventory_Management_System-AWS.git .
cd backend
sudo npm install --omit=dev

# Environment
sudo mkdir -p /opt/app/backend/src
cat << 'EOF' | sudo tee /opt/app/backend/src/.env
PORT=4000
RDS_HOST=YOUR_RDS_WRITER_ENDPOINT
RDS_PORT=5432
RDS_USER=YOUR_DB_USER
RDS_PASSWORD=YOUR_DB_PASSWORD
RDS_DATABASE=inventory_db
RDS_SSL_MODE=require
RDS_SSL_REJECT_UNAUTHORIZED=false
FRONTEND_ORIGIN=https://app.example.com
JWT_SECRET=CHANGE_ME
EOF

# Seed database (once per cluster; you may run via CI or single instance)
# pm2 will start server; seeds can be run on first instance only or via script guarded by lock files
sudo npm run seed:pg || true
sudo npm run seed:admin || true

# Start API with PM2
sudo pm2 start src/index.js --name inventory-api
sudo pm2 save
sudo pm2 startup systemd -u root --hp /root | bash

# Nginx reverse proxy to Node
cat << 'EOF' | sudo tee /etc/nginx/conf.d/backend.conf
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo systemctl enable nginx
sudo systemctl restart nginx
```

## Auto Scaling Groups (ASG)
- Create ASG for frontend using `lt-frontend`, attached to `tg-frontend`, desired capacity (e.g., 2), min/max.
- Create ASG for backend using `lt-backend`, attached to `tg-backend`, desired capacity (e.g., 2), min/max.
- Health checks via ALB target group (HTTP 200 on `/`).
- Scaling policies: CPU or ALB RequestCountPerTarget based.

### Shared Storage for Failover (S3 or EFS)
- S3 (static assets and backups):
  - Store build artifacts, exported data, and logs in S3.
  - Use lifecycle policies for cost optimization and cross-region replication for resilience.
  - Backend can push periodic DB exports or app-level backups to S3 (e.g., nightly cron + `pg_dump` to S3).
- EFS (shared persistent storage):
  - Create an EFS file system and mount targets in the same subnets.
  - Attach a security group allowing NFS (TCP 2049) from backend EC2 SG.
  - In backend Launch Template user data, mount EFS for shared uploads or persistent files:
    ```bash
    sudo yum install -y amazon-efs-utils
    sudo mkdir -p /mnt/efs
    echo "fs-XXXXXXXX:/ /mnt/efs efs _netdev,tls,iam 0 0" | sudo tee -a /etc/fstab
    sudo mount -a
    sudo chown -R ec2-user:ec2-user /mnt/efs
    ```
  - Configure your app to read/write uploads to `/mnt/efs/uploads` so all instances in ASG share the same files.

## CI/CD (Optional)
- Build on CI and upload frontend `dist/` to instances via S3 or CodeDeploy.
- For backend, use CodeDeploy/CodePipeline to pull latest and restart PM2.

## Environment Configuration
Frontend build:
- Set `VITE_API_BASE` to backend ALB domain on build
```
VITE_API_BASE=https://api.example.com npm run build
```
Backend env:
- Use `FRONTEND_ORIGIN=https://app.example.com` for CORS.
- Use `RDS_*` vars for RDS connectivity.
- Set `JWT_SECRET` for production.
 - If using EFS, set an env var like `UPLOADS_DIR=/mnt/efs/uploads` and point your code to it.

## Security and TLS
- Terminate TLS at ALB with ACM certs.
- Instances can run HTTP internally.
- Restrict SSH to admin IPs.
- Backend SG allows outbound to RDS; RDS SG only allows inbound from backend SG on 5432.

## Verification
- Frontend: `https://app.example.com` renders app; login with `admin@example.com / ChangeMe123!`.
- Backend: `https://api.example.com/api/items` returns 200 with JWT.
- CORS: Ensure `FRONTEND_ORIGIN` matches the frontend domain.
 - S3/EFS: Upload a test file and verify visibility across instances.

## Operations
- Logs: PM2 (`pm2 logs inventory-api`), Nginx in `/var/log/nginx/`.
- Rollout: Update Launch Template AMI or User Data; perform ASG instance refresh.
- Database migrations/seeds: Run `npm run seed:pg` from a bastion/runner with access to RDS.

## Cost Considerations
- Use t3/t4g instances for cost efficiency.
- Right-size RDS; consider read replicas if needed.
- Use NAT Gateway only if your private instances need outbound internet.
- Prefer ALB idle timeout and health check tuning for workload.

## Notes
- You can consolidate to a single ALB with path-based routing (`/` → frontend, `/api/*` → backend target group).
- Prefer SSM Parameter Store/Secrets Manager for secrets.
- Consider CloudWatch alarms and dashboards for CPU, 5xx from ALB, RDS connections.
- Use Instance Refresh on ASGs for rolling updates.
 - Consider adding CloudFormation resources for Route 53 records, ACM certificates (via DNS validation), Security Groups, and EFS mounts to automate full provisioning.
