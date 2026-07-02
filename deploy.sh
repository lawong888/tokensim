#!/usr/bin/env bash
#
# Build the token simulator and publish it to the Apache web root.
# Live at https://tokensim.zforce.ai (static files served from $WEBROOT).
#
# Usage: ./deploy.sh
set -euo pipefail

WEBROOT="/var/www/tokensim"

cd "$(dirname "$0")"

echo "==> Installing dependencies (if needed)"
npm install

echo "==> Building production bundle"
npm run build

echo "==> Publishing dist/ to ${WEBROOT}"
sudo mkdir -p "${WEBROOT}"
# --delete so removed files don't linger; rsync avoids stale assets from old builds
sudo rsync -a --delete dist/ "${WEBROOT}/"
sudo chown -R www-data:www-data "${WEBROOT}"

echo "==> Done. Live at https://tokensim.zforce.ai"
echo "    (Apache serves static files directly — no restart needed.)"
