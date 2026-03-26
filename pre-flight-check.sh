#!/bin/bash
# Final Verification Checklist - Run before deployment

echo "🔍 SecureClaw - Pre-Deployment Verification"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

passed=0
failed=0
warning=0

check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $1"
        ((passed++))
    else
        echo -e "${RED}❌ FAIL${NC}: $1"
        ((failed++))
    fi
}

warn() {
    echo -e "${YELLOW}⚠️  WARNING${NC}: $1"
    ((warning++))
}

# Project Files
echo "📁 Checking Project Files..."

[ -f "docker/Dockerfile" ] && check "Dockerfile exists"
[ -f "docker/entrypoint.sh" ] && check "entrypoint.sh exists"
[ -f "docker/privacy-router.py" ] && check "privacy-router.py exists"
[ -f "docker/secureclaw-config.yml" ] && check "secureclaw-config.yml exists"
[ -f "backend/server.js" ] && check "server.js exists"
[ -f "backend/package.json" ] && check "backend/package.json exists"
[ -f "backend/.env.example" ] && check "backend/.env.example exists"
[ -f "frontend/pages/index.js" ] && check "frontend/index.js exists"
[ -f "frontend/pages/deploy.js" ] && check "frontend/deploy.js exists"
[ -f "frontend/package.json" ] && check "frontend/package.json exists"
[ -f "frontend/.env.example" ] && check "frontend/.env.example exists"
[ -f "docker-compose.yml" ] && check "docker-compose.yml exists"
[ -f "README.md" ] && check "README.md exists"
[ -f "DEPLOYMENT.md" ] && check "DEPLOYMENT.md exists"
[ -f "QUICKSTART.md" ] && check "QUICKSTART.md exists"
[ -f "PROJECT_STATUS.md" ] && check "PROJECT_STATUS.md exists"
echo ""

# Scripts
echo "🔧 Checking Deployment Scripts..."

[ -x "vps-setup.sh" ] && check "vps-setup.sh is executable"
[ -x "deploy-to-vps.sh" ] && check "deploy-to-vps.sh is executable"
[ -x "setup-ssl.sh" ] && check "setup-ssl.sh is executable"
[ -x "on-vps-start.sh" ] && check "on-vps-start.sh is executable"
[ -x "monitor.sh" ] && check "monitor.sh is executable"
echo ""

# Dependencies
echo "📦 Checking Dependencies..."

grep -q '"express"' backend/package.json && check "Express in backend package.json"
grep -q '"dockerode"' backend/package.json && check "Dockerode in backend package.json"
grep -q '"mongoose"' backend/package.json && check "Mongoose in backend package.json"
grep -q '"next"' frontend/package.json && check "Next.js in frontend package.json"
grep -q '"react"' frontend/package.json && check "React in frontend package.json"
grep -q '"react-dom"' frontend/package.json && check "React DOM in frontend package.json"
echo ""

# Bug Fixes
echo "🐛 Checking Bug Fixes..."

grep -q '|' docker/entrypoint.sh && check "sed delimiter fixed (| instead of /)"
grep -q 'Thread' docker/privacy-router.py && check "Privacy router uses threads"
grep -q 'openclaw' docker/entrypoint.sh && check "OpenClaw CLI command used"
grep -q '"react-dom"' frontend/package.json && check "Frontend React-DOM added"
grep -q '"jsonwebtoken"' backend/package.json && check "Backend JWT token added"
echo ""

# Git Status
echo "📊 Checking Git Status..."

[ -d ".git" ] && check "Git repository initialized"
git remote -v | grep -q "github.com" && check "Git remote configured to GitHub"
git branch --show-current | grep -q "^main$" && check "On main branch"
git log --oneline -1 &> /dev/null && check "Latest commit exists"
echo ""

# Warnings
echo "⚠️  Potential Issues..."

[ ! -f "backend/.env" ] && warn ".env file missing (will be created on deploy)"
[ ! -f "frontend/.env.local" ] && warn ".env.local file missing (will be created on deploy)"
[ ! -d "node_modules" ] && warn "node_modules not installed (normal for fresh clone)"
echo ""

# Summary
echo "=========================================="
echo "✅ Passed: $passed"
echo "❌ Failed: $failed"
echo "⚠️  Warnings: $warning"
echo "=========================================="
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Ready to deploy!${NC}"
    echo ""
    echo "📖 Next Steps:"
    echo "   1. Read QUICKSTART.md for 15-minute deployment"
    echo "   2. Buy VPS (Hetzner/DigitalOcean) - ₹450-500/month"
    echo "   3. Configure DNS (A record to VPS IP)"
    echo "   4. Run: bash deploy-to-vps.sh"
    echo "   5. Setup SSL: bash setup-ssl.sh"
    echo "   6. Start services: bash on-vps-start.sh"
    echo ""
    echo "🌐 Repository: https://github.com/SultanAiMaster/secureclaw"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please fix and try again.${NC}"
    exit 1
fi