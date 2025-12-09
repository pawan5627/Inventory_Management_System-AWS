# Deployment Guide (AWS: VPC, ALB, ASG, RDS)

This guide describes deploying the Inventory Management System on AWS using:
- VPC (private and public subnets)
- Application Load Balancer (ALB)
- Auto Scaling Group (ASG) for frontend and backend EC2 instances
- AWS RDS (PostgreSQL)

## Architecture Overview
- VPC: 2+ AZs, public subnets for ALB, private subnets for EC2 and RDS.
- ALBs: One ALB for frontend (HTTP/HTTPS), one ALB for backend API (HTTP/HTTPS). You can use a single ALB with two target groups and path-based routing if preferred.
- ASGs: 
  - Frontend ASG: serves built React app via Nginx.
  - Backend ASG: runs Node.js API via PM2 and reverse-proxied by Nginx.
- RDS: PostgreSQL in private subnets with security group allowing backend ASG instances.

## Prerequisites
- Domain in Route 53 (optional but recommended)
- ACM certificates for your frontend and backend domains (e.g., `app.example.com`, `api.example.com`)
- S3 bucket (optional) for build artifacts if using CI/CD

## Networking (VPC)
1. Create VPC (e.g., 10.0.0.0/16).
2. Create public subnets (e.g., 10.0.1.0/24, 10.0.2.0/24).
3. Create private subnets (e.g., 10.0.11.0/24, 10.0.12.0/24).
4. Internet Gateway attached to VPC; route public subnets to IGW.
5. NAT Gateway in public subnets; route private subnets to NAT for outbound internet.

## Security Groups
- `sg-alb-frontend`: Inbound 80/443 from internet; outbound to target group.
- `sg-alb-backend`: Inbound 80/443 from internet; outbound to target group.
- `sg-ec2-frontend`: Inbound from `sg-alb-frontend` on 80; allow SSH from admin IP; outbound 443 (ACM/updates).
- `sg-ec2-backend`: Inbound from `sg-alb-backend` on 80; allow SSH from admin IP; outbound 443 and to RDS.
- `sg-rds`: Inbound 5432 from `sg-ec2-backend`; outbound as required.

## RDS (PostgreSQL)
- Create RDS PostgreSQL in private subnets with `sg-rds`.
- Note writer endpoint (`RDS_HOST`), port, database, user, password.
- Optionally enable IAM auth (this guide uses user/password).

## ALB + Target Groups
- Frontend ALB with target group `tg-frontend` (HTTP 80) pointing to `sg-ec2-frontend` instances.
- Backend ALB with target group `tg-backend` (HTTP 80) pointing to `sg-ec2-backend` instances.
- Attach ACM certificates; add listeners:
  - 443 → target group
  - 80 → redirect to 443
- Route 53 records (optional):
  - `app.example.com` → Frontend ALB
  - `api.example.com` → Backend ALB

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
    location /api/ {
        proxy_pass http://backend-alb.internal/; # or https://api.example.com/
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

sudo systemctl enable nginx
sudo systemctl restart nginx
```
Notes:
- Replace `backend-alb.internal` with your backend ALB DNS or domain.
- If you prefer separate ALBs, keep API calls pointed to `VITE_API_BASE` env at build time.

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
- Health checks via ALB target group.
- Scaling policies: CPU or request count based.

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

## Security and TLS
- Terminate TLS at ALB with ACM certs.
- Instances can run HTTP internally.
- Restrict SSH to admin IPs.
- Backend SG allows outbound to RDS; RDS SG only allows inbound from backend SG on 5432.

## Verification
- Frontend: `https://app.example.com` renders app; login with `admin@example.com / ChangeMe123!`.
- Backend: `https://api.example.com/api/health` (if implemented) or test `/api/items` via curl with JWT.

## Operations
- Logs: PM2 (`pm2 logs inventory-api`), Nginx in `/var/log/nginx/`.
- Rollout: Update Launch Template AMI or User Data; perform ASG instance refresh.
- Database migrations/seeds: Run `npm run seed:pg` from a bastion/runner with access to RDS.

## Cost Considerations
- Use t3/t4g instances for cost efficiency.
- Right-size RDS; consider read replicas if needed.
- Use NAT Gateway only if your private instances need outbound internet.

## Notes
- You can consolidate to a single ALB with path-based routing (`/` → frontend, `/api/*` → backend target group).
- Prefer SSM Parameter Store/Secrets Manager for secrets.
- Consider CloudWatch alarms and dashboards for CPU, 5xx from ALB, RDS connections.
