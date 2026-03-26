# 📚 Complete SecureClaw Deployment Guide

---

## 🎯 Overview

SecureClaw ko deploy karne ke liye easy steps. Cheap VPS use karein!

**Total Cost: ₹500/month (or even FREE with subdomain)**

---

## 🛒 Step 1: Buy VPS (5 minutes)

### Options:

| Provider | Cost | Specs | Recommend |
|----------|------|-------|-----------|
| **Hetzner** | €4.90/month (~₹450) | 2GB RAM, 2 CPU, 20GB SSD | ⭐⭐⭐ |
| **DigitalOcean** | $6/month (~₹500) | 1GB RAM, 1 CPU, 25GB SSD | ⭐⭐⭐ |
| **Contabo** | €6.99/month (~₹600) | 4GB RAM, 2 CPU, 200GB SSD | ⭐⭐ |
| **AWS Lightsail** | $3.50/month (~₹300) | 512MB RAM, 1 CPU, 20GB SSD | ⭐⭐ |
| **Vultr** | $5/month (~₹420) | 1GB RAM, 1 CPU, 25GB SSD | ⭐⭐ |

**My recommendation:** **Hetzner** (best value) or **AWS Lightsail** (cheapest for testing)

---

## 🌐 Step 2: Get Domain (Optional but Recommended)

### Option A: FREE Subdomain (Cheapest!)
**Services:**
- **Cloudflare Workers** → `your-subdomain.workers.dev` (FREE)
- **No-IP** → `your-subdomain.ddns.net` (FREE)
- **FreeDNS** → `your-subdomain.freedns.io` (FREE)

### Option B: Cheap Domain (~₹100/year)
**Registrars:**
- **Namecheap** → `.com` ~₹100/year
- **Godaddy** → `.com` ~₹120/year
- **BigRock** → `.in` ~₹99/year (India)

**Choose:** `secureclaw.app`, `secureclaw.dev`, or something cool!

---

## 🔧 Step 3: Setup DNS (Important!)

Setup A record pointing to VPS.

**Example:**
```
Type: A
Name: @ (or your subdomain)
Value: YOUR_VPS_IP_ADDRESS
TTL: 300 (or automatic)
```

**For subdomain:**
```
Name: app
Value: YOUR_VPS_IP → app.secureclaw.app
```

**Test DNS propagation:**
```bash
dig +short yourdomain.com
```

---

## 🚀 Step 4: Deploy to VPS (10 minutes)

### 4.1 Clone Repository

```bash
cd ~
git clone https://github.com/SultanAiMaster/secureclaw.git
cd secureclaw
```

### 4.2 Configure Environment

```bash
# Make deployment scripts executable
chmod +x *.sh

# Edit configuration
nano vps-setup.sh

# Update these values:
export VPS_IP="YOUR_VPS_IP)           # e.g. 1.2.3.4
export VPS_USER="root"                # Usually root
export DOMAIN="your-subdomain.workers.dev"  # Or your domain
export SSL_EMAIL="your@email.com"      # For Let's Encrypt

# Save with Ctrl+O, Enter, Ctrl+X
```

### 4.3 Run Setup Script

This script will configure everything:

```bash
bash vps-setup.sh
```

**This will:**
- Create `.env.production` with settings
- Generate secure passwords
- Setup configuration files

### 4.4 Deploy to VPS

```bash
bash deploy-to-vps.sh
```

**This will:**
- Login to VPS via SSH
- Install Docker & Docker Compose
- Setup firewall (22, 80, 443, 8080)
- Copy all files to VPS
- Build Docker images
- Configure services

**Note:** You'll need SSH access to VPS:
```bash
# If using SSH key:
ssh root@your-vps-ip

# If using password:
ssh root@your-vps-ip
```

---

## 🔐 Step 5: Setup SSL Certificate (5 minutes)

SSL is FREE via Let's Encrypt!

```bash
bash setup-ssl.sh
```

**Prerequisites:**
1. DNS must point to VPS (from Step 3)
2. Port 80/443 must be open (firewall configured)
3. Wait 2-5 minutes for DNS propagation

**This will:**
- Setup Nginx configuration
- Obtain SSL certificate
- Configure auto-renewal (every 12 hours)
- Setup HTTPS redirect

**Testing Mode:**
```bash
# For testing without hitting rate limits
export SSL_STAGING=true
bash setup-ssl.sh
```

---

## 🎉 Step 6: Start Services (2 minutes)

```bash
# Option 1: Run from local machine
ssh root@your-vps-ip "bash /opt/secureclaw/on-vps-start.sh"

# Option 2: SSH in and run
ssh root@your-vps-ip
cd /opt/secureclaw
bash on-vps-start.sh
```

**This will:**
- Start MongoDB database
- Wait for database to be ready
- Start Backend API
- Start Frontend
- Start Nginx (with SSL)
- Configure health monitoring

---

## ✅ Step 7: Verify Deployment

### Check Service Status

```bash
ssh root@your-vps-ip
cd /opt/secureclaw
docker-compose -f docker-compose.prod.yml ps
```

**Expected output:**
```
NAME     STATUS    PORTS
mongo    Up        27017/tcp
api      Up        0.0.0.0:3001->3001/tcp
frontend Up        0.0.0.0:3000->3000/tcp
nginx    Up        0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### Test URLs

Open in browser:

- **Frontend:** `https://yourdomain.com`
- **API Health:** `https://yourdomain.com/health`
- **API Endpoint:** `https://yourdomain.com/api/deploy`

Expected health response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-27T12:00:00.000Z"
}
```

---

## 🧪 Step 8: Test Deployment (Real Test!)

Now deploy an actual AI agent:

### 8.1 Create Telegram Bot

1. Open Telegram
2. Search "@BotFather"
3. Send `/newbot`
4. Choose name (e.g., "My SecureClaw Bot")
5. Choose username (e.g., `my_secureclaw_bot`)
6. **Copy the token!** (looks like `1234567890:ABCdef...`)

### 8.2 Deploy Agent

Go to `https://yourdomain.com` and:

1. Paste the Telegram token
2. Select AI model (Claude 3.5 Sonnet)
3. Click "🚀 Deploy My Agent"

**What happens:**
1. Frontend sends request to API
2. Backend creates Docker container
3. Agent starts with OpenClaw
4. Privacy router blocks telemetry
5. Agent connects to Telegram
6. **Bot is ready!** (~60-90 seconds)

### 8.3 Test Your Bot

1. Find your bot in Telegram
2. Send a message: "Hello!"
3. Should get AI response!

---

## 📊 Step 9: Monitor & Maintain

### View Logs

```bash
ssh root@your-vps-ip
cd /opt/secureclaw

# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f mongo
```

### Check Health Monitoring

```bash
# View health logs
cat /opt/secureclaw/logs/health.log

# View alerts
cat /opt/secureclaw/logs/alerts.log
```

### Check Disk Space

```bash
df -h

# Or automatically:
tail -f /opt/secureclaw/logs/health.log | grep Disk
```

### View Active Agent Containers

```bash
docker ps --filter "label=secureclaw.user"
```

### Stop/Restart Services

```bash
cd /opt/secureclaw

# Stop all
docker-compose -f docker-compose.prod.yml down

# Start all
docker-compose -f docker-compose.prod.yml up -d

# Restart specific service
docker-compose -f docker-compose.prod.yml restart api
```

---

## 🔄 Step 10: Auto Updates (Optional)

### 10.1 Setup Git Auto-Deploy

Create deploy hook:

```bash
ssh root@your-vps-ip
cat > /opt/secureclaw/autodeploy.sh <<'EOF'
#!/bin/bash
cd /opt/secureclaw
git pull origin main
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
EOF

chmod +x /opt/secureclaw/autodeploy.sh
```

### 10.2 GitHub Webhook

Or use GitHub Actions (in `.github/workflows/deploy.yml`):

```yaml
name: Deploy to VPS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_IP }}
          username: root
          key: ${{ secrets.SSH_KEY }}
          script: cd /opt/secureclaw && bash autodeploy.sh
```

---

## 🔒 Step 11: Security Best Practices

### 11.1 Update System Regularly

```bash
ssh root@your-vps-ip
apt update && apt upgrade -y
```

### 11.2 Setup Fail2Ban (Anti-Bruteforce)

```bash
ssh root@your-vps-ip
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

### 11.3 Use SSH Keys Only

```bash
# Generate SSH key on local machine
ssh-keygen -t ed25519

# Copy to VPS
ssh-copy-id root@your-vps-ip

# Test SSH key login
ssh root@your-vps-ip

# Disable password login in /etc/ssh/sshd_config:
# PasswordAuthentication no

# Restart SSH
systemctl restart sshd
```

### 11.4 Firewall Rules

```bash
ufw status
# Should show:
# 22/tcp (SSH)
# 80/tcp (HTTP)
# 443/tcp (HTTPS)
# 8080/tcp (Traefik - optional, can disable)
```

### 11.5 Automatic Backups

```bash
# Setup MongoDB backups
cat > /etc/cron.d/mongodb-backup <<'EOF'
0 2 * * * root docker exec $(docker ps -q -f name=mongo) mongodump --out /backups/mongo-$(date +\%Y\%m\%d) && find /opt/secureclaw/backups -name "mongodb-*" -mtime +7 -delete
EOF

chmod 644 /etc/cron.d/mongodb-backup
```

---

## 💰 Cost Optimization Tips

### Free Tools:
- ✅ SSL: Let's Encrypt (FREE)
- ✅ Monitoring: Custom scripts (FREE)
- ✅ Backups: Local backups (FREE)
- ✅ DNS: Cloudflare (FREE)
- ✅ CI/CD: GitHub Actions (FREE)

### Upgrade Later:
- ~~Database Atlas~~ → Free tier + local backup
- ~~CDN~~ → Cloudflare (FREE)
- ~~Load Balancer~~ → Single VPS (start here)
- ~~Domain~~ → Start with FREE subdomain

---

## 🆘 Troubleshooting

### Problem: SSL Certificate Error

**Fix:**
```bash
# Check DNS propagation
dig +short yourdomain.com

# Ensure points to VPS IP

# Test manually
curl -I http://yourdomain.com

# Re-run SSL script
bash setup-ssl.sh
```

### Problem: Container Won't Start

**Fix:**
```bash
# View container logs
docker logs <container_name>

# Check disk space
df -h

# Restart Docker
systemctl restart docker
```

### Problem: API Not Responding

**Fix:**
```bash
# Check if MongoDB is running
docker ps | grep mongo

# Test MongoDB connection
docker exec $(docker ps -q -f name=mongo) mongosh --eval "db.stats()"

# Restart API
docker-compose -f docker-compose.prod.yml restart api
```

### Problem: High CPU/Memory

**Fix:**
```bash
# Check top containers
docker stats

# Stop heavy containers
docker stop <container_id>

# Check logs for errors
docker logs --tail 100 <container_name>
```

---

## 📞 Support

- GitHub: https://github.com/SultanAiMaster/secureclaw
- Twitter: @WorkChainOfficial
- Discord: [OpenClaw Community](https://discord.com/invite/clawd)

---

## ✅ Deployment Checklist

- [ ] VPS purchased (Hetzner/DigitalOcean)
- [ ] DNS configured (A record to VPS IP)
- [ ] SSH access to VPS working
- [ ] deploy-to-vps.sh executed successfully
- [ ] SSL certificates obtained
- [ ] Services started successfully
- [ ] Frontend accessible via HTTPS
- [ ] API health check passing
- [ ] First agent deployed (actual test)
- [ ] Bot responding on Telegram
- [ ] Monitoring cron jobs configured
- [ ] Backups configured

---

**Done!** 🎉

SecureClaw is now running and accepting deployments.

**Total time:** 30-45 minutes
**Total cost:** ₹450-500/month
**Scale:** Can handle 10-20 concurrent agents (upgrade VPS when needed)