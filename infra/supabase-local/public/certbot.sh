#!/bin/sh
set -eu
umask 077

# IPv4 only for this reviewed packet. Keep the real address in private state.
if ! python -c 'import ipaddress,os; ipaddress.IPv4Address(os.environ["ISKRA_PUBLIC_IP"])' >/dev/null 2>&1; then
  printf '%s\n' 'A valid private-config IPv4 address is required' >&2
  exit 1
fi
mode=${1:-renew}
case "$mode" in
  issue)
    if [ -n "${CERTBOT_EMAIL:-}" ]; then
      set -- --email "$CERTBOT_EMAIL"
    else
      set -- --register-unsafely-without-email
    fi
    if certbot certonly --non-interactive --agree-tos "$@" \
        --webroot --webroot-path /var/www/acme --preferred-challenges http \
        --required-profile shortlived --ip-address "$ISKRA_PUBLIC_IP" \
        --cert-name iskra-public-ip --key-type ecdsa >/dev/null 2>&1; then
      printf '%s\n' 'IP certificate issued; inspect private certificate metadata before TLS startup'
    else
      printf '%s\n' 'IP certificate issuance failed; inspect private Certbot logs' >&2
      exit 1
    fi
    ;;
  renew)
    trap 'exit 0' INT TERM
    while :; do
      if ! certbot renew --non-interactive --quiet --cert-name iskra-public-ip \
          --required-profile shortlived >/dev/null 2>&1; then
        printf '%s\n' 'IP certificate renewal failed; inspect private Certbot logs' >&2
      fi
      sleep 43200 &
      wait $!
    done
    ;;
  check-renew)
    if certbot renew --dry-run --non-interactive --quiet --cert-name iskra-public-ip \
        --required-profile shortlived >/dev/null 2>&1; then
      printf '%s\n' 'ACME renewal rehearsal passed'
    else
      printf '%s\n' 'ACME renewal rehearsal failed; inspect private Certbot logs' >&2
      exit 1
    fi
    ;;
  *) printf '%s\n' 'Unsupported certificate operation' >&2; exit 1 ;;
esac
