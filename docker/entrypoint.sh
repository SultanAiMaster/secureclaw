#!/bin/bash
set -e

echo "🔐 SecureClaw — Starting..."

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ ERROR: TELEGRAM_BOT_TOKEN not set"
    exit 1
fi

# Use | delimiter instead of / to handle tokens with /
sed -i "s|BOT_TOKEN_PLACEHOLDER|${TELEGRAM_BOT_TOKEN}|g" /app/config.yml
sed -i "s|AI_MODEL_PLACEHOLDER|${AI_MODEL}|g" /app/config.yml

if [ "$SECURECLAW_PRIVACY" = "true" ]; then
    echo "🛡️ Starting NemoClaw Privacy Router on port 8090..."
    python /app/privacy-router.py &
fi

echo "🚀 Launching OpenClaw Agent..."
openclaw start --config /app/config.yml