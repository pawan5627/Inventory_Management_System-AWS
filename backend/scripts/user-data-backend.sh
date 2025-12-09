#!/usr/bin/env bash
set -euo pipefail

# Variables
APP_DIR="/opt/app"
REPO_URL="https://github.com/pawan5627/Inventory_Management_System-AWS.git"
BRANCH="main"
NODE_VERSION="18.x"

# Install prerequisites
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -y
sudo apt-get install -y curl git nginx

# Install Node.js + PM2
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION} | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm i -g pm2

# Clone repo
sudo mkdir -p "$APP_DIR"
if [[ ! -d "$APP_DIR/.git" ]]; then
  sudo git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi
sudo chown -R ubuntu:ubuntu "$APP_DIR" || true
cd "$APP_DIR"
# Mark safe directory for git in case of root-owned
git config --global --add safe.directory "$APP_DIR"

# Backend setup
cd backend
npm ci --only=production || npm install --production

# Verify runtime dependencies (e.g., dotenv) exist; retry install if missing
node -e "require('dotenv')" >/dev/null 2>&1 || npm install --production

# Create env file
cat > src/.env <<'EOF'
PORT=4000
FRONTEND_ORIGIN=https://d2n61sfstcgqqd.cloudfront.net

RDS_HOST=
RDS_PORT=5432
RDS_USER=
RDS_PASSWORD=
RDS_DATABASE=
RDS_READER_HOST=

RDS_SSL_MODE=require
RDS_SSL_REJECT_UNAUTHORIZED=true
RDS_SSL_CA_PATH=/opt/app/backend/rds-ca.pem
# Optional explicit SNI servername if using cluster endpoint
# RDS_SSL_SERVERNAME=

JWT_SECRET=change-me
EOF

# Download AWS RDS CA bundle (region-specific)
sudo curl -fsSL -o /opt/app/backend/rds-ca.pem https://truststore.pki.rds.amazonaws.com/us-east-1/us-east-1-bundle.pem
sudo chmod 0644 /opt/app/backend/rds-ca.pem

# Start API with PM2 (explicit cwd so node resolves local node_modules)
pm2 start src/index.js --name inventory-api --time --cwd /opt/app/backend
pm2 save

# Nginx reverse proxy
sudo tee /etc/nginx/sites-available/backend.conf >/dev/null <<'NGINX'
server {
    listen 80 default_server;
    server_name _;
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX
sudo ln -sf /etc/nginx/sites-available/backend.conf /etc/nginx/sites-enabled/backend.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Health check
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1/api/health || true
