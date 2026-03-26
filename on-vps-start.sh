#!/bin/bash
set -e

echo "🚀 SecureClaw - Start All Services"
echo "=================================="

cd /opt/secureclaw

echo "📦 Checking Docker status..."
if ! systemctl is-active --quiet docker; then
    echo "❌ Docker is not running. Starting..."
    systemctl start docker
fi

echo "🗄️  Starting MongoDB..."
docker-compose -f docker-compose.prod.yml up -d mongo

echo "⏳ Waiting for MongoDB to be ready..."
sleep 10

echo "🔍 Checking MongoDB health..."
until docker exec $(docker ps -q -f name=mongo) mongosh --eval "db.adminCommand('ping').ok" --quiet; do
    echo "⏳ Waiting for MongoDB..."
    sleep 2
done
echo "✅ MongoDB is ready"

echo "🔧 Starting Backend API..."
docker-compose -f docker-compose.prod.yml up -d api

echo "⏳ Waiting for API to be ready..."
until curl -f http://localhost:3001/health > /dev/null 2>&1; do
    echo "⏳ Waiting for API..."
    sleep 2
done
echo "✅ API is ready"

echo "🎨 Starting Frontend..."
docker-compose -f docker-compose.prod.yml up -d frontend

echo "🌐 Starting Nginx..."
docker-compose -f docker-compose.prod.yml up -d nginx

echo ""
echo "✅ All services started successfully!"
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🌐 Access URLs:"
echo "   Frontend: https://$(grep -E '^DOMAIN=' /opt/secureclaw/.env.production || echo 'localhost' | cut -d'=' -f2)"
echo "   API: https://$(grep -E '^DOMAIN=' /opt/secureclaw/.env.production || echo 'localhost' | cut -d'=' -f2)/api"
echo "   Health: https://$(grep -E '^DOMAIN=' /opt/secureclaw/.env.production || echo 'localhost' | cut -d'=' -f2)/health"

echo ""
echo "📝 Logs:"
echo "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   Restart services: docker-compose -f docker-compose.prod.yml restart"

# Create monitoring cron job
echo "🕒 Setting up health monitoring..."
cat > /etc/cron.d/secureclaw-health <<'CRONEOF'
*/5 * * * * root /opt/secureclaw/monitor.sh >> /opt/secureclaw/logs/health.log 2>&1
CRONEOF
chmod 644 /etc/cron.d/secureclaw-health

echo "✅ Health monitoring configured (checked every 5 minutes)"
echo ""
echo "🎉 SecureClaw is now running!"