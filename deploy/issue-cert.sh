#!/bin/sh
# One-time: issue the Let's Encrypt cert for quasiamici.duckdns.org.
# Renewals are handled by the existing nightly "certbot renew" (hooks are saved
# in /etc/letsencrypt/renewal/quasiamici.duckdns.org.conf).
set -eu
DIR=$(cd "$(dirname "$0")" && pwd)
[ -s /root/.duckdns-token ] || { echo "missing /root/.duckdns-token"; exit 1; }
certbot certonly --manual --preferred-challenges dns --non-interactive \
  --manual-auth-hook "$DIR/certbot-duckdns-hook.sh" \
  --manual-cleanup-hook "$DIR/certbot-duckdns-hook.sh cleanup" \
  --deploy-hook "$DIR/certbot-deploy-hook.sh" \
  -d quasiamici.duckdns.org
ls -l /opt/docker/nginx/certs/quasiamici.duckdns.org/
