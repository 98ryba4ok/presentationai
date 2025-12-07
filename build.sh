#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: bash build.sh yourdomain.com"
  exit 1
fi

DOMAIN=$1

echo "🚀 Deploying to $DOMAIN"

# Replace domain in configs
sed -i "s/<INSERT_DOMAIN>/$DOMAIN/g" ./nginx.conf.prod
sed -i "s/<INSERT_DOMAIN>/$DOMAIN/g" ./docker-compose.https.yml

SSL_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"

# ⛔ НЕ трогаем SSL, если он уже существует
if [ ! -f "$SSL_PATH" ]; then
  echo "🔒 SSL certificates not found. Generating..."

  echo "🛑 Stopping nginx to free port 80..."
  docker stop nginx >/dev/null 2>&1

  sudo docker compose -f ./docker-compose.https.yml run --rm certbot
  sudo docker compose -f ./docker-compose.https.yml down
else
  echo "🔑 SSL already exists. Skipping certificate generation."
fi

echo "🔧 Starting production containers..."
sudo docker compose -f ./docker-compose.prod.yml up -d --build

echo "✅ Deployment complete!"
echo "   Frontend: https://$DOMAIN"
echo "   API: https://$DOMAIN/api"
echo "   Admin: https://$DOMAIN/admin"