#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 || $# -gt 3 ]]; then
  echo "Usage: git_clone_with_vault.sh <repo_url> <target_dir> [branch_or_ref]" >&2
  exit 2
fi

repo_url="$1"
target_dir="$2"
branch_or_ref="${3:-}"

if [[ "${repo_url}" == *"@"* || "${repo_url}" == *"token"* || "${repo_url}" == *"ghp_"* ]]; then
  echo "Refusing repo_url that appears to contain credentials." >&2
  exit 3
fi

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "GITHUB_TOKEN is not present in the environment. Provide it through a vault/env handle; do not paste it in the command." >&2
  exit 4
fi

askpass="$(mktemp)"
cleanup() {
  rm -f "$askpass"
}
trap cleanup EXIT

cat > "$askpass" <<'ASKPASS'
#!/usr/bin/env bash
case "$1" in
  *Username*) printf '%s\n' "x-access-token" ;;
  *Password*) printf '%s\n' "${GITHUB_TOKEN}" ;;
  *) printf '\n' ;;
esac
ASKPASS
chmod 700 "$askpass"

export GIT_ASKPASS="$askpass"
export GIT_TERMINAL_PROMPT=0

if [[ -n "$branch_or_ref" ]]; then
  git clone --branch "$branch_or_ref" --single-branch "$repo_url" "$target_dir"
else
  git clone "$repo_url" "$target_dir"
fi

git -C "$target_dir" remote set-url origin "$repo_url"
git -C "$target_dir" rev-parse HEAD
