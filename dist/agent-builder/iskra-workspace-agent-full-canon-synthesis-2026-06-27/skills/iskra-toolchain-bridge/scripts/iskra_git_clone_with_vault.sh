#!/usr/bin/env bash
set -euo pipefail

repo_url=""
target_dir=""
branch=""
token_env_var="GITHUB_TOKEN"
dry_run="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo-url)
      repo_url="$2"
      shift 2
      ;;
    --target-dir)
      target_dir="$2"
      shift 2
      ;;
    --branch)
      branch="$2"
      shift 2
      ;;
    --token-env-var)
      token_env_var="$2"
      shift 2
      ;;
    --dry-run)
      dry_run="true"
      shift
      ;;
    *)
      echo "unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

fail() {
  echo "$1" >&2
  exit 1
}

[[ -n "$repo_url" ]] || fail "--repo-url is required"
[[ -n "$target_dir" ]] || fail "--target-dir is required"

if [[ "$repo_url" =~ ^[a-zA-Z][a-zA-Z0-9+.-]*://[^/@[:space:]]+@ ]]; then
  fail "Credential-bearing git URLs are forbidden. Use a token handle such as ${token_env_var}."
fi

if [[ ! "$repo_url" =~ ^https://github\.com/[^/[:space:]]+/[^/[:space:]]+(\.git)?$ ]]; then
  fail "repo URL must be a tokenless GitHub HTTPS URL."
fi

command -v git >/dev/null 2>&1 || fail "git is not available on PATH."

token_present="false"
if [[ -n "$(printenv "$token_env_var" 2>/dev/null || true)" ]]; then
  token_present="true"
fi

if [[ "$dry_run" == "true" ]]; then
  printf '{"status":"DRY_RUN_PASS","repo_url":"%s","target_dir":"%s","branch":"%s","token_handle":"%s","token_present":%s,"secret_in_url":false}\n' \
    "$repo_url" "$target_dir" "$branch" "$token_env_var" "$token_present"
  exit 0
fi

[[ ! -e "$target_dir" ]] || fail "target dir already exists: $target_dir"

tmpdir="$(mktemp -d)"
cleanup() {
  rm -rf "$tmpdir"
}
trap cleanup EXIT

askpass="$tmpdir/askpass.sh"
cat >"$askpass" <<'EOF'
#!/usr/bin/env bash
case "$1" in
  *Username*) printf 'x-access-token' ;;
  *Password*) printenv "$ISKRA_TOKEN_ENV_VAR" ;;
  *) printf '' ;;
esac
EOF
chmod 700 "$askpass"

export GIT_ASKPASS="$askpass"
export GIT_TERMINAL_PROMPT=0
export ISKRA_TOKEN_ENV_VAR="$token_env_var"

clone_args=(clone)
if [[ -n "$branch" ]]; then
  clone_args+=(--branch "$branch")
fi
clone_args+=("$repo_url" "$target_dir")

git "${clone_args[@]}"
git -C "$target_dir" remote set-url origin "$repo_url"
head_sha="$(git -C "$target_dir" rev-parse HEAD)"
remote_url="$(git -C "$target_dir" remote get-url origin)"

printf '{"status":"PASS","repo_url":"%s","target_dir":"%s","branch":"%s","head":"%s","remote_url":"%s","token_handle":"%s","token_used":%s}\n' \
  "$repo_url" "$target_dir" "$branch" "$head_sha" "$remote_url" "$token_env_var" "$token_present"
