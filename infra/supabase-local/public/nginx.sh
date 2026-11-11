#!/bin/sh
set -eu
umask 077

key=${ISKRA_PUBLIC_ANON_KEY:?Local anon key is required}
case "$key" in
  *[!A-Za-z0-9._-]*|'') printf '%s\n' 'Invalid anon key format' >&2; exit 1 ;;
esac
# The private setup must copy the anon key from the verified local frontend env.
# Reject a service-role payload before generating the nginx config.
payload=${key#*.}
payload=${payload%%.*}
case $((${#payload} % 4)) in
  0) ;; 2) payload=$payload'==' ;; 3) payload=$payload'=' ;; *) exit 1 ;;
esac
if ! printf '%s' "$payload" | tr '_-' '/+' | base64 -d 2>/dev/null | grep -q '"role":"anon"'; then
  printf '%s\n' 'An anon-role API key is required' >&2
  exit 1
fi
certificate=/etc/letsencrypt/live/iskra-public-ip/fullchain.pem
private_key=/etc/letsencrypt/live/iskra-public-ip/privkey.pem
if [ ! -s "$certificate" ] || [ ! -s "$private_key" ]; then
  printf '%s\n' 'TLS certificate files are unavailable' >&2
  exit 1
fi
envsubst '${ISKRA_PUBLIC_ANON_KEY}' < /packet/tls.conf.template > /etc/nginx/conf.d/default.conf
if ! nginx -t >/dev/null 2>&1; then
  printf '%s\n' 'TLS gateway configuration validation failed' >&2
  exit 1
fi

nginx -g 'daemon off;' &
nginx_pid=$!
watch_pid=''
cleanup() {
  [ -z "$watch_pid" ] || kill "$watch_pid" 2>/dev/null || true
  kill -TERM "$nginx_pid" 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 0' INT TERM
(
  previous=$(sha256sum "$certificate" "$private_key")
  while kill -0 "$nginx_pid" 2>/dev/null; do
    sleep 30
    current=$(sha256sum "$certificate" "$private_key" 2>/dev/null) || continue
    if [ "$current" != "$previous" ] && nginx -t >/dev/null 2>&1; then
      if nginx -s reload >/dev/null 2>&1; then
        previous=$current
      else
        printf '%s\n' 'TLS reload failed; renewal requires inspection' >&2
      fi
    fi
  done
) &
watch_pid=$!
wait "$nginx_pid"
