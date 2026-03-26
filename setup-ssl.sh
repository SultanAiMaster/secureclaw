#!/bin/bash
set -e

echo "🔐 SecureClaw - SSL Setup with Let's Encrypt"
echo "============================================="

# Load environment
if [ -f .env.production ]; then
    source .env.production
else
    echo "❌ .env.production not found"
    exit 1
fi

VPS_IP="${VPS_IP:-1.2.3.4}"
VPS_USER="${VPS_USER:-root}"
DOMAIN="${DOMAIN:-localhost}"
SSL_EMAIL="${SSL_EMAIL:-}"

if [ "${DOMAIN}" == "localhost" ]; then
    echo "❌ DOMAIN must be set to use SSL"
    echo "Update .env.production with a domain or subdomain"
    exit 1
fi

if [ -z "${SSL_EMAIL}" ]; then
    echo "❌ SSL_EMAIL must be set"
    echo "Set SSL_EMAIL in .env.production for Let's Encrypt notifications"
    exit 1
fi

echo "📧 Email: ${SSL_EMAIL}"
echo "🌐 Domain: ${DOMAIN}"

# Setup DNS first (must point to VPS)
echo ""
echo "⚠️  BEFORE CONTINUING, ensure DNS points ${DOMAIN} to IP: ${VPS_IP}"
echo "   Example A record: ${DOMAIN} → ${VPS_IP}"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Login to VPS
ssh ${VPS_USER}@${VPS_IP} <<ENDSSH
    cd /opt/secureclaw

    # Create nginx config
    cat > nginx.conf <<'NGINXEOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    gzip on;
    gzip_types text/plain application/json application/javascript text/css;

    # Upstream servers
    upstream frontend {
        server frontend:3000;
    }

    upstream api {
        server api:3001;
    }

    # HTTP server (redirect to HTTPS)
    server {
        listen 80;
        server_name ${DOMAIN};

        location / {
            return 301 https://\$host\$request_uri;
        }

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name ${DOMAIN};

        # SSL certificates (Let's Encrypt)
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_cache_bypass \$http_upgrade;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # API
        location /api/ {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Health check
        location /health {
            proxy_pass http://api/health;
            access_log off;
        }
    }
}
NGINXEOF

    # Initial nginx start (HTTP only)
    docker-compose -f docker-compose.prod.yml up -d nginx mongo

    # Create directory for certbot
    mkdir -p /var/www/certbot

    # Obtain SSL certificate
    echo "🔐 Obtaining SSL certificate from Let's Encrypt..."
    if [ "$SSL_STAGING" = "true" ]; then
        echo "🧪 Using staging environment (for testing)"
        docker run --rm \
            -v /opt/secureclaw/ssl:/etc/letsencrypt \
            -v /var/www/certbot:/var/www/certbot \
            certbot/certbot certonly --staging \
            --webroot --webroot-path=/var/www/certbot \
            --email $SSL_EMAIL \
            --agree-tos \
            --no-eff-email \
            -d $DOMAIN
    else
        docker run --rm \
            -v /opt/secureclaw/ssl:/etc/letsencrypt \
            -v /var/www/certbot:/var/www/certbot \
            certbot/certbot certonly \
            --webroot --webroot-path=/var/www/certbot \
            --email $SSL_EMAIL \
            --agree-tos \
            --no-eff-email \
            -d $DOMAIN
    fi

    # Setup automatic cert renewal
    cat > /etc/cron.d/certbot <<'CRONEOF'
0 */12 * * * root docker run --rm -v /opt/secureclaw/ssl:/etc/letsencrypt -v /var/www/certbot:/var/www/certbot certbot/certbot renew --webroot --webroot-path=/var/www/certbot && docker exec \$(docker ps -q -f name=nginx) nginx -s reload
CRONEOF

    chmod 644 /etc/cron.d/certbot

    echo "✅ SSL certificates obtained!"
    echo "📍 Location: /opt/secureclaw/ssl/"
    echo "🔄 Auto-renewal: Every 12 hours"

    # Stop nginx to restart with full stack
    docker-compose -f docker-compose.prod.yml down

ENDSSH

echo "🎉 SSL setup complete!"
echo ""
echo "🔐 HTTPS enabled: https://${DOMAIN}"
echo "🔄 Auto-renewal configured"