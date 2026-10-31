#!/bin/sh
# Runs after every successful issue/renewal: hand the cert to the docker nginx.
set -eu
D=/opt/docker/nginx/certs/quasiamici.duckdns.org
mkdir -p "$D"
cp "$RENEWED_LINEAGE/fullchain.pem" "$RENEWED_LINEAGE/privkey.pem" "$D/"
chmod 600 "$D/privkey.pem"
docker exec nginx nginx -s reload
