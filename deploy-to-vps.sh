#!/bin/bash
set -e

echo "🚀 SecureClaw - VPS Deployment Script"
echo "=================================="

# Load production environment
if [ -f .env.production ]; then
    source .env.production
else
    echo "❌ .env.production not found. Run vps-setup.sh first"
    exit 1
fi

# Variables
VPS_IP="${VPS_IP:-1.2.3.4}"
VPS_USER="${VPS_USER:-root}"
DOMAIN="${DOMAIN:-localhost}"

echo "📡 Connecting to VPS: ${VPS_USER}@${VPS_IP}"

# Create deploy script on VPS
ssh ${VPS_USER}@${VPS_IP} <<'ENDSSH'
    # Update system
    echo "📦 Updating system packages..."
    apt-get update && apt-get upgrade -y

    # Install Docker
    echo "🐳 Installing Docker..."
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com | sh
        systemctl enable docker
        systemctl start docker
    fi

    # Install Docker Compose
    echo "📦 Installing Docker Compose..."
    if ! command -v docker-compose &> /dev/null; then
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi

    # Install other tools
    echo "🔧 Installing additional tools..."
    apt-get install -y curl wget git nginx certbot python3-certbot-nginx

    # Create secure directories
    echo "📁 Setting up directories..."
    mkdir -p /opt/secureclaw
    mkdir -p /opt/secureclaw/ssl
    mkdir -p /opt/secureclaw/logs
    mkdir -p /opt/secureclaw/backups

    # Set up firewall
    echo "🔒 Configuring firewall..."
    if command -v ufw &> /dev/null; then
        ufw --force enable
        ufw allow 22/tcp    # SSH
        ufw allow 80/tcp    # HTTP
        ufw allow 443/tcp   # HTTPS
        ufw allow 8080/tcp  # Traefik dashboard (optional)
    fi

    echo "✅ Base setup complete!"
ENDSSH

echo "✅ VPS base setup finished!"

# Now copy the application
echo "📤 Copying SecureClaw files to VPS..."
rsync -avz --exclude='node_modules' --exclude='.git' \
    /home/openclaw/.openclaw/workspace/secureclaw/ \
    ${VPS_USER}@${VPS_IP}:/opt/secureclaw/

echo "✅ Files copied successfully!"

# Setup environment on VPS
ssh ${VPS_USER}@${VPS_IP} <<ENDSSH
    cd /opt/secureclaw

    # Copy .env files
    cp backend/.env.example backend/.env
    cp frontend/.env.example frontend/.env.local

    # Update backend .env
    sed -i "s|MONGODB_URI=mongodb://mongo:27017/secureclaw|MONGODB_URI=mongodb://mongo:27017/secureclaw|g" backend/.env
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=${MONGO_PASSWORD}|g" backend/.env

    # Update frontend .env
    if [ "${DOMAIN}" != "localhost" ]; then
        sed -i "s|http://localhost:3001|https://${DOMAIN}|g" frontend/.env.local
    fi

    # Build agent image
    echo "🔨 Building SecureClaw agent image..."
    docker build -t secureclaw:latest ./docker

    # Create docker-compose.prod.yml
    cat > docker-compose.prod.yml <<'COMPOSE'
version: '3.8'

services:
  api:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/secureclaw
      - PORT=3001
      - JWT_SECRET=FILE://run/secrets/jwt_secret
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      - mongo
    restart: unless-stopped
    networks:
      - secureclaw-network
    secrets:
      - jwt_secret

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
      - /opt/secureclaw/backups:/backups
    restart: unless-stopped
    networks:
      - secureclaw-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:3001
    depends_on:
      - api
    restart: unless-stopped
    networks:
      - secureclaw-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /opt/secureclaw/ssl:/etc/nginx/ssl:ro
      - /opt/secureclaw/logs:/var/log/nginx
    depends_on:
      - frontend
    restart: unless-stopped
    networks:
      - secureclaw-network

networks:
  secureclaw-network:
    driver: bridge

volumes:
  mongo_data:
COMPOSE

    echo "✅ Production configuration complete!"

ENDSSH

echo "🎉 VPS deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Setup SSL: ./setup-ssl.sh"
echo "2. Start services: bash ./on-vps-start.sh"
echo "3. Access dashboard: http://${DOMAIN} or https://${DOMAIN}"