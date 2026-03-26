#!/bin/bash
# SecureClaw Health Monitoring Script
# Runs every 5 minutes via cron

cd /opt/secureclaw

LOG_FILE="/opt/secureclaw/logs/health.log"
ALERT_FILE="/opt/secureclaw/logs/alerts.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Functions
log() {
    echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
}

alert() {
    echo "[$TIMESTAMP] 🚨 ALERT: $1" | tee -a "$ALERT_FILE"
    echo "[$TIMESTAMP] 🚨 ALERT: $1" >> "$LOG_FILE"
}

# 1. Check Disk Space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
log "📊 Disk Usage: ${DISK_USAGE}%"

if [ "$DISK_USAGE" -gt 85 ]; then
    alert "Disk space critically high: ${DISK_USAGE}%. Recommend cleanup."
elif [ "$DISK_USAGE" -gt 75 ]; then
    log "⚠️  Disk space warning: ${DISK_USAGE}%"
fi

# 2. Check MongoDB Storage
MONGO_SIZE=$(docker exec $(docker ps -q -f name=mongo) mongosh --quiet --eval "db.stats().dataSize")
MONGO_SIZE_MB=$((MONGO_SIZE / 1024 / 1024))
log "🗄️  MongoDB Size: ${MONGO_SIZE_MB}MB"

# 3. Check Docker Containers
CONTAINER_COUNT=$(docker ps -q --filter "label=secureclaw.user" | wc -l)
log "🐳 Active Agent Containers: ${CONTAINER_COUNT}"

if [ "$CONTAINER_COUNT" -gt 5 ]; then
    alert "High container count: $CONTAINER_COUNT. Consider limits."
fi

# 4. Check MongoDB Service
if docker ps -q -f name=mongo &> /dev/null; then
    if docker exec $(docker ps -q -f name=mongo) mongosh --eval "db.adminCommand('ping').ok" --quiet &> /dev/null; then
        log "✅ MongoDB: Healthy"
    else
        alert "MongoDB: Not responding. Attempting restart..."
        docker restart $(docker ps -q -f name=mongo)
    fi
else
    alert "MongoDB: Container not running. Starting..."
    docker-compose -f docker-compose.prod.yml up -d mongo
fi

# 5. Check API Service
if curl -f http://localhost:3001/health &> /dev/null; then
    log "✅ API: Healthy"
else
    alert "API: Not responding. Attempting restart..."
    docker-compose -f docker-compose.prod.yml restart api
fi

# 6. Check Frontend Service
if curl -f http://localhost:3000 &> /dev/null; then
    log "✅ Frontend: Healthy"
else
    alert "Frontend: Not responding. Attempting restart..."
    docker-compose -f docker-compose.prod.yml restart frontend
fi

# 7. Check Nginx Service
if docker ps -q -f name=nginx &> /dev/null; then
    log "✅ Nginx: Running"
else
    alert "Nginx: Not running. Starting..."
    docker-compose -f docker-compose.prod.yml up -d nginx
fi

# 8. Docker System Prune (keep images available)
log "🧹 Cleaning up unused Docker resources (keeping active images)..."
docker system prune -f --filter "until=48h" &> /dev/null

# 9. CPU and Memory Check
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
MEM_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100}')

log "💻 CPU: ${CPU_USAGE}% | Memory: ${MEM_USAGE}%"

if [ $(echo "$CPU_USAGE > 90" | bc -l) -eq 1 ]; then
    alert "CPU usage critically high: ${CPU_USAGE}%"
fi

if [ $(echo "$MEM_USAGE > 90" | bc -l) -eq 1 ]; then
    alert "Memory usage critically high: ${MEM_USAGE}%"
fi

# 10. Check SSL Certificate Expiry
if [ -f /opt/secureclaw/ssl/live/*/fullchain.pem ]; then
    CERT_FILES=$(find /opt/secureclaw/ssl/live -name "fullchain.pem")
    for cert in $CERT_FILES; do
        EXPIRY=$(openssl x509 -in "$cert" -noout -enddate | cut -d= -f2)
        EXPIRY_DAYS=$((($(date -d "$EXPIRY" +%s) - $(date +%s)) / 86400))
        log "🔐 SSL Certificate expires in: $EXPIRY_DAYS days"

        if [ "$EXPIRY_DAYS" -lt 7 ]; then
            alert "SSL certificate expires in $EXPIRY_DAYS days! Renew now!"
        fi
    done
fi

log "✅ Health check completed"