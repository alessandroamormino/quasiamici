#!/bin/sh
# Global certbot deploy hook, installed as
#   /etc/letsencrypt/renewal-hooks/deploy/nginx-certs.sh
# After ANY successful renewal: if the docker nginx reads a copy of that cert
# (/opt/docker/nginx/certs/<cert-name>/), refresh the copy and reload nginx.
# Certs without such a folder are ignored.
set -eu
NAME=$(basename "$RENEWED_LINEAGE")
D=/opt/docker/nginx/certs/$NAME
[ -d "$D" ] || exit 0
cp "$RENEWED_LINEAGE/fullchain.pem" "$RENEWED_LINEAGE/privkey.pem" "$D/"
chmod 600 "$D/privkey.pem"
docker exec nginx nginx -s reload
echo "nginx-certs: refreshed $NAME"
