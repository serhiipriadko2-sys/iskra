#!/bin/sh
set -eu

output=/usr/share/nginx/html/runtime-config.js

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
ai_provider=${VITE_AI_PROVIDER:-gemini}
ai_edge_slug=${VITE_AI_EDGE_FUNCTION_SLUG:-gemini}
remote_search=${VITE_ENABLE_REMOTE_SEMANTIC_SEARCH:-false}
sensitive_embedding=${VITE_ALLOW_SENSITIVE_REMOTE_EMBEDDING:-false}

[ -n "$supabase_url" ] || fail 'VITE_SUPABASE_URL is required'
[ -n "$supabase_anon_key" ] || fail 'VITE_SUPABASE_ANON_KEY is required'

case "$supabase_url" in
  https://*.supabase.co) ;;
  *) fail 'VITE_SUPABASE_URL must be an https://*.supabase.co URL' ;;
esac

case "$supabase_anon_key" in
  *[!A-Za-z0-9._-]*) fail 'VITE_SUPABASE_ANON_KEY contains unsupported characters' ;;
esac

case "$sentry_dsn" in
  ''|https://*.sentry.io/*) ;;
  *) fail 'VITE_SENTRY_DSN must be empty or an official sentry.io HTTPS DSN' ;;
esac

case "$posthog_host" in
  https://posthog.com|https://*.posthog.com) ;;
  *) fail 'VITE_POSTHOG_HOST must be an official posthog.com HTTPS URL' ;;
esac

case "$ai_provider" in
  gemini|openai|auto) ;;
  *) fail 'VITE_AI_PROVIDER must be gemini, openai, or auto' ;;
esac

case "$ai_edge_slug" in
  ''|*[!A-Za-z0-9_-]*) fail 'VITE_AI_EDGE_FUNCTION_SLUG is invalid' ;;
esac

case "$remote_search:$sensitive_embedding" in
  true:true|true:false|false:true|false:false) ;;
  *) fail 'remote-search flags must be true or false' ;;
esac

if [ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ] || [ -n "${VITE_SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  fail 'service-role credentials are forbidden in the browser container'
fi

for value in \
  "$supabase_url" "$supabase_anon_key" "$sentry_dsn" "$posthog_key" \
  "$posthog_host" "$app_version" "$ai_provider" "$ai_edge_slug"; do
  if contains_control_characters "$value"; then
    fail 'runtime configuration contains control characters'
  fi
done

supabase_url=$(escape_js_string "$supabase_url")
supabase_anon_key=$(escape_js_string "$supabase_anon_key")
sentry_dsn=$(escape_js_string "$sentry_dsn")
posthog_key=$(escape_js_string "$posthog_key")
posthog_host=$(escape_js_string "$posthog_host")
app_version=$(escape_js_string "$app_version")
ai_provider=$(escape_js_string "$ai_provider")
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
  VITE_AI_PROVIDER: "$ai_provider",
  VITE_AI_EDGE_FUNCTION_SLUG: "$ai_edge_slug",
  VITE_ENABLE_REMOTE_SEMANTIC_SEARCH: "$remote_search",
  VITE_ALLOW_SENSITIVE_REMOTE_EMBEDDING: "$sensitive_embedding"
});
EOF

chmod 0444 "$output"
