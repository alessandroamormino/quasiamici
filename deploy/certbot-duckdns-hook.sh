#!/bin/sh
# certbot --manual hook: DNS-01 challenge via DuckDNS TXT record.
# Token in /root/.duckdns-token (chmod 600), never in git.
# Usage: auth hook with no args, cleanup hook with "cleanup".
set -eu
TOKEN=$(tr -d ' \t\r\n' < /root/.duckdns-token) # strip paste junk
SUB=${CERTBOT_DOMAIN%.duckdns.org}
if [ "${1:-}" = cleanup ]; then
  curl -fsS "https://www.duckdns.org/update?domains=$SUB&token=$TOKEN&txt=removed&clear=true" >/dev/null
  exit 0
fi
r=$(curl -fsS "https://www.duckdns.org/update?domains=$SUB&token=$TOKEN&txt=$CERTBOT_VALIDATION")
[ "$r" = OK ] || { echo "duckdns answered: $r" >&2; exit 1; }
sleep 60 # let the TXT record propagate before Let's Encrypt checks it
