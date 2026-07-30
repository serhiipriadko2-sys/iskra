#!/bin/sh
set -eu

output=${ISKRA_RUNTIME_CONFIG_OUTPUT:-/usr/share/nginx/html/runtime-config.js}

fail() {
  echo "[iskraspace-runtime-config] $1" >&2
  exit 1
}

contains_control_characters() {
  printf '%s' "$1" | grep -q '[[:cntrl:]]'
}

escape_js_string() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

supabase_url=${VITE_SUPABASE_URL:-}
supabase_anon_key=${VITE_SUPABASE_ANON_KEY:-}
sentry_dsn=${VITE_SENTRY_DSN:-}
posthog_key=${VITE_POSTHOG_KEY:-}
posthog_host=${VITE_POSTHOG_HOST:-https://app.posthog.com}
app_version=${VITE_APP_VERSION:-unknown}
ai_edge_slug=${VITE_AI_EDGE_FUNCTION_SLUG:-gemini}
remote_search=${VITE_ENABLE_REMOTE_SEMANTIC_SEARCH:-false}
sensitive_embedding=${VITE_ALLOW_SENSITIVE_REMOTE_EMBEDDING:-false}

[ -n "$supabase_url" ] || fail 'VITE_SUPABASE_URL is required'
[ -n "$supabase_anon_key" ] || fail 'VITE_SUPABASE_ANON_KEY is required'

if [ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ] || [ -n "${VITE_SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  fail 'service-role credentials are forbidden in the browser container'
fi

for value in \
  "$supabase_url" "$supabase_anon_key" "$sentry_dsn" "$posthog_key" \
  "$posthog_host" "$app_version" "$ai_edge_slug"; do
  if contains_control_characters "$value"; then
    fail 'runtime configuration contains control characters'
  fi
done

if ! printf '%s' "$supabase_url" | grep -Eq '^https://[a-z0-9][a-z0-9-]{1,62}[a-z0-9]\.supabase\.co$'; then
  fail 'VITE_SUPABASE_URL must be an exact https://<project-ref>.supabase.co origin'
fi

decode_base64url() {
  encoded=$(printf '%s' "$1" | sed -e 's#_#/#g' -e 's#-#+#g')
  remainder=$((${#encoded} % 4))
  case "$remainder" in
    0) ;;
    2) encoded="${encoded}==" ;;
    3) encoded="${encoded}=" ;;
    *) return 1 ;;
  esac
  printf '%s' "$encoded" | base64 -d 2>/dev/null
}

case "$supabase_anon_key" in
  sb_secret_*)
    fail 'VITE_SUPABASE_ANON_KEY must never contain an sb_secret key'
    ;;
  sb_publishable_*)
    if ! printf '%s' "$supabase_anon_key" | grep -Eq '^sb_publishable_[A-Za-z0-9._-]{16,}$'; then
      fail 'VITE_SUPABASE_ANON_KEY contains an invalid publishable key'
    fi
    ;;
  *.*.*)
    if ! printf '%s' "$supabase_anon_key" | grep -Eq '^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$'; then
      fail 'VITE_SUPABASE_ANON_KEY contains a malformed legacy JWT'
    fi
    jwt_tail=${supabase_anon_key#*.}
    jwt_payload=${jwt_tail%%.*}
    jwt_payload_json=$(decode_base64url "$jwt_payload") || fail 'VITE_SUPABASE_ANON_KEY payload is not valid base64url'
    compact_payload=$(printf '%s' "$jwt_payload_json" | tr -d '[:space:]')
    if printf '%s' "$compact_payload" | grep -q '"role":"service_role"'; then
      fail 'VITE_SUPABASE_ANON_KEY contains a service_role JWT'
    fi
    if ! printf '%s' "$compact_payload" | grep -q '"role":"anon"'; then
      fail 'legacy VITE_SUPABASE_ANON_KEY JWT must declare role anon'
    fi
    ;;
  *)
    fail 'VITE_SUPABASE_ANON_KEY must be a publishable key or an anon-role legacy JWT'
    ;;
esac

case "$sentry_dsn" in
  '') ;;
  *)
    if ! printf '%s' "$sentry_dsn" | grep -Eq '^https://[A-Za-z0-9]+@[A-Za-z0-9.-]+\.sentry\.io/[0-9]+$'; then
      fail 'VITE_SENTRY_DSN must be empty or an official sentry.io HTTPS DSN'
    fi
    ;;
esac

if ! printf '%s' "$posthog_host" | grep -Eq '^https://([A-Za-z0-9-]+\.)*posthog\.com$'; then
  fail 'VITE_POSTHOG_HOST must be an official posthog.com HTTPS origin'
fi

case "$posthog_key" in
  '') ;;
  phc_*)
    if ! printf '%s' "$posthog_key" | grep -Eq '^phc_[A-Za-z0-9_-]{8,}$'; then
      fail 'VITE_POSTHOG_KEY contains an invalid public project key'
    fi
    ;;
  *) fail 'VITE_POSTHOG_KEY must be empty or a public phc_ project key' ;;
esac

case "$ai_edge_slug" in
  ''|*[!A-Za-z0-9_-]*) fail 'VITE_AI_EDGE_FUNCTION_SLUG is invalid' ;;
esac

case "$remote_search:$sensitive_embedding" in
  true:true|true:false|false:true|false:false) ;;
  *) fail 'remote-search flags must be true or false' ;;
esac

supabase_url=$(escape_js_string "$supabase_url")
supabase_anon_key=$(escape_js_string "$supabase_anon_key")
sentry_dsn=$(escape_js_string "$sentry_dsn")
posthog_key=$(escape_js_string "$posthog_key")
posthog_host=$(escape_js_string "$posthog_host")
app_version=$(escape_js_string "$app_version")
ai_edge_slug=$(escape_js_string "$ai_edge_slug")

cat > "$output" <<EOF
// Generated at container startup. Public browser configuration only.
window.__ISKRA_RUNTIME_CONFIG__ = Object.freeze({
  VITE_SUPABASE_URL: "$supabase_url",
  VITE_SUPABASE_ANON_KEY: "$supabase_anon_key",
  VITE_SENTRY_DSN: "$sentry_dsn",
  VITE_POSTHOG_KEY: "$posthog_key",
  VITE_POSTHOG_HOST: "$posthog_host",
  VITE_APP_VERSION: "$app_version",
  VITE_AI_EDGE_FUNCTION_SLUG: "$ai_edge_slug",
  VITE_ENABLE_REMOTE_SEMANTIC_SEARCH: "$remote_search",
  VITE_ALLOW_SENSITIVE_REMOTE_EMBEDDING: "$sensitive_embedding"
});
EOF

chmod 0444 "$output"
