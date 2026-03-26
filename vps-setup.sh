# 🏗️ SecureClaw VPS Setup Guide
# Cheap deployment for production

## Input Variables
export VPS_IP="YOUR_VPS_IP_HERE"         # e.g. 1.2.3.4
export VPS_USER="root"                   # Usually root for new VPS
export DOMAIN="your-subdomain.cheapcloud.io"  # Or your domain
export TELEGRAM_BOT_TOKEN="YOUR_TOKEN"  # From @BotFather

## Package variables for specific providers
# Hetzner: 2GB RAM, 2 CPU, 20GB SSD
# DigitalOcean: 1GB RAM, 1 CPU, 25GB SSD
# Contabo: 4GB RAM, 2 CPU, 200GB SSD

# DEFAULT: Hetzner-style configuration
export DOCKER_MEMORY_LIMIT="512m"       # Per agent container
export MAX_CONTAINERS=3                 # Maximum concurrent agents
export MONGO_STORAGE_LIMIT="5G"         # MongoDB data limit

## SSL/SSL Configuration
export SSL_EMAIL="your@email.com"       # For Let's Encrypt notifications
export SSL_STAGING="false"              # Set to true for testing

## MongoDB Configuration
export MONGO_USER="secureclaw"
export MONGO_PASSWORD=$(openssl rand -base64 32)

## Domain Configuration
# Option A: Use Cloudflare + free subdomain (cheapest)
# Option B: Buy domain and setup DNS manually

## Save to .env file
cat > .env.production <<EOF
VPS_IP=${VPS_IP}
DOMAIN=${DOMAIN}
SSL_EMAIL=${SSL_EMAIL}
DOSENCRYPT_STAGING=${SSL_STAGING}
MONGO_USER=${MONGO_USER}
MONGO_PASSWORD=${MONGO_PASSWORD}
DOCKER_MEMORY_LIMIT=${DOCKER_MEMORY_LIMIT}
MAX_CONTAINERS=${MAX_CONTAINERS}
EOF

echo "✅ VPS configuration saved to .env.production"
echo "📧 MongoDB Password: ${MONGO_PASSWORD}"