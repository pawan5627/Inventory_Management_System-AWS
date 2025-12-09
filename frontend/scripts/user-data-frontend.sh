#!/usr/bin/env bash
set -euo pipefail

# Install prerequisites
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx git curl ca-certificates gnupg

# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Clone repo
APP_DIR="/opt/app"
mkdir -p "$APP_DIR"
cd "$APP_DIR"
if [[ ! -d .git ]]; then
  git clone https://github.com/pawan5627/Inventory_Management_System-AWS.git .
else
  git fetch --all --prune && git reset --hard origin/main
fi

# Build frontend with API base
cd frontend
npm ci || npm install
xport VITE_API_BASE="https://d3pbop2keky4u7.cloudfront.net"
npm run build

# Nginx site
cat > /etc/nginx/sites-available/frontend.conf <<'EOF'
server {
  listen 80 default_server;
  server_name _;
  root /opt/app/frontend/dist;
  index index.html;
  location / {
    try_files $uri /index.html;
  }
}
EOF
ln -sf /etc/nginx/sites-available/frontend.conf /etc/nginx/sites-enabled/frontend.conf
rm -f /etc/nginx/sites-enabled/default || true
nginx -t && systemctl restart nginx
