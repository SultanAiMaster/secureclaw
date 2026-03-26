# 🚀 Quick Start Guide - 15 Minutes to Production

**Fastest path to deploying SecureClaw on your VPS**

---

## ⚡ Quickest Setup (15 minutes)

Assumes you already have VPS and domain.

```bash
# 1. Clone repo
cd ~
git clone https://github.com/SultanAiMaster/secureclaw.git
cd secureclaw

# 2. Edit configuration (2 minutes)
nano vps-setup.sh

# Update these:
# - VPS_IP="your.vps.ip.address"
# - DOMAIN="your-subdomain.workers.dev" or "yourdomain.com"
# - SSL_EMAIL="your@email.com"

# Save: Ctrl+O, Enter, Ctrl+X

# 3. Generate config
bash vps-setup.sh

# 4. Deploy to VPS (5-8 minutes)
bash deploy-to-vps.sh

# 5. Setup SSL (2-3 minutes)
bash setup-ssl.sh

# 6. Start services (1 minute)
ssh root@your-vps-ip "bash /opt/secureclaw/on-vps-start.sh"

# 7. Done! Access: https://yourdomain.com
```

---

## 📋 Pre-Flight Checklist (Do this FIRST!)

**Before running scripts:**

- [ ] VPS IP address known
- [ ] VPS SSH password ready (or SSH key)
- [ ] Domain bought (or free subdomain)
- [ ] DNS A record pointing to VPS IP (wait 2-5 min)
  ```
  Type: A
  Name: @ (or subdomain)
  Value: YOUR_VPS_IP_ADDRESS
  TTL: 300
  ```
- [ ] Port 80 & 443 open on VPS firewall
- [ ] 10-15 minutes free time

---

## 🔍 Verify DNS (Important!)

```bash
# Replace with your domain
dig +short yourdomain.com

# Should output your VPS IP, e.g.:
# 1.2.3.4
```

**If no output or wrong IP:**
- DNS not propagated yet → wait 5-10 minutes
- A record not configured → fix DNS settings

---

## 🧪 Quick Test Commands

```bash
# Test VPS SSH connection
ssh root@your-vps-ip

# Test DNS resolution
ping yourdomain.com

# Test HTTP (should work before SSL)
curl -I http://yourdomain.com

# After SSL setup:
curl -I https://yourdomain.com

# Test API
curl https://yourdomain.com/health
```

---

## 🎯 Deploy Your First Agent

### 1. Get Telegram Bot Token

**In Telegram:**
1. Search @BotFather
2. Send: `/newbot`
3. Name: "My AI Bot"
4. Username: `my_ai_bot` (must end in bot)
5. **COPY THE TOKEN!**

### 2. Deploy on Website

1. Open: https://yourdomain.com
2. Paste token you copied
3. Select: Claude 3.5 Sonnet
4. Click: 🚀 Deploy My Agent

Wait 60-90 seconds... 🎉

### 3. Test Your Bot

1. Find your bot in Telegram
2. Send: "Hello!"
3. Get AI response!

---

## 🆘 If Something Goes Wrong

### SSL Failed?

```bash
# Check DNS first
dig +short yourdomain.com

# Should return your VPS IP

# If OK, retry SSL
ssh root@your-vps-ip
cd /opt/secureclaw
bash /opt/secureclaw/setup-ssl.sh
```

### Services Won't Start?

```bash
# Check Docker status
ssh root@your-vps-ip
docker ps
systemctl status docker

# View logs
cd /opt/secureclaw
docker-compose -f docker-compose.prod.yml logs -f
```

### Can't Access Website?

```bash
# Check Nginx
ssh root@your-vps-ip
docker ps | grep nginx

# Check logs
docker logs $(docker ps -q -f name=nginx)

# Restart
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## 📊 Monitor Your Deployment

```bash
# SSH into VPS
ssh root@your-vps-ip

# Check all services
cd /opt/secureclaw
docker-compose -f docker-compose.prod.yml ps

# View health logs
cat /opt/secureclaw/logs/health.log

# Check alerts
cat /opt/secureclaw/logs/alerts.log

# View active agents
docker ps --filter "label=secureclaw.user"
```

---

## 🔄 Quick Update (When Code Changes)

```bash
# From local machine
cd ~/secureclaw
git pull

# Deploy to VPS
deploy-to-vps.sh

# On VPS
ssh root@your-vps-ip
cd /opt/secureclaw
docker-compose -f docker-compose.prod.yml restart
```

---

## 🛡️ Monthly Maintenance (5 minutes)

```bash
# SSH to VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Check disk space
df -h

# Clean Docker
docker system prune -f --filter "until=7d"

# Check backups
ls -lh /opt/secureclaw/backups/mongo-*

# Review logs
tail -50 /opt/secureclaw/logs/health.log
```

---

## ✅ Success Indicators

✅ **Frontend:** Opens at https://yourdomain.com
✅ **API Health:** Returns `{"status":"ok","timestamp":"..."}`
✅ **SSl Certificate:** Valid, no browser warnings
✅ **Bot Deployed:** Container appears in `docker ps`
✅ **Bot Working:** Telegram bot responds to messages
✅ **Monitoring:** Health logs being written

---

## 📞 Need Help?

- GitHub: https://github.com/SultanAiMaster/secureclaw/issues
- Twitter: @WorkChainMaster
- Email: support@workchain.com

---

**Total Time:** ~15-30 minutes (including DNS propagation)
**Cost:** Start: ₹450-500/month

**Happy deploying! 🚀**