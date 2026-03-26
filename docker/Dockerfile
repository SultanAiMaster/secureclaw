FROM python:3.11-slim

LABEL maintainer="SecureClaw by WorkChain"

RUN apt-get update && apt-get install -y \
    git curl wget nodejs npm \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir openclaw

WORKDIR /app

COPY secureclaw-config.yml /app/config.yml
COPY entrypoint.sh /app/entrypoint.sh
COPY privacy-router.py /app/privacy-router.py

RUN chmod +x /app/entrypoint.sh

EXPOSE 8080

ENV TELEGRAM_BOT_TOKEN=""
ENV AI_MODEL="claude-3-5-sonnet-20241022"
ENV USER_ID=""
ENV SECURECLAW_PRIVACY="true"

ENTRYPOINT ["/app/entrypoint.sh"]