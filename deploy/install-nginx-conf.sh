#!/bin/sh
# Install the site conf into the docker nginx; roll back if nginx -t fails.
set -eu
DIR=$(cd "$(dirname "$0")" && pwd)
T=/opt/docker/nginx/conf.d/quasiamici.duckdns.org.conf
[ -s /opt/docker/nginx/certs/quasiamici.duckdns.org/fullchain.pem ] || { echo "cert missing: run issue-cert.sh first"; exit 1; }
cp "$DIR/quasiamici.duckdns.org.conf" "$T"
if docker exec nginx nginx -t; then
  docker exec nginx nginx -s reload && echo "INSTALLED and reloaded"
else
  rm -f "$T"; echo "nginx -t FAILED: conf removed, nothing changed"; exit 1
fi
