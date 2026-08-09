#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
guard="$script_dir/require-recent-backup.sh"
tmp_dir="$(mktemp -d)"
trap 'rm -rf -- "$tmp_dir"' EXIT

fake_helper="$tmp_dir/fake-helper"
captured_args="$tmp_dir/args"

cat >"$fake_helper" <<'EOF'
#!/usr/bin/env bash
printf '%s\n' "$@" >"$GESTION_VPS_TEST_CAPTURE"
exit "${GESTION_VPS_TEST_EXIT:-0}"
EOF
chmod 700 "$fake_helper"

if GESTION_VPS_TEST_CAPTURE="$captured_args" \
  bash "$guard" --test-helper "$fake_helper" >/dev/null 2>&1; then
  printf 'Le garde a accepté un helper de test sans activation explicite.\n' >&2
  exit 1
fi

GESTION_VPS_BACKUP_GUARD_TEST_MODE=1 \
GESTION_VPS_TEST_CAPTURE="$captured_args" \
  bash "$guard" --test-helper "$fake_helper"

cat >"$tmp_dir/expected" <<'EOF'
--application
formeducweb
--max-age-seconds
93600
--require-remote-verified
--require-signed-marker
EOF
cmp "$tmp_dir/expected" "$captured_args"

if GESTION_VPS_BACKUP_GUARD_TEST_MODE=1 \
  GESTION_VPS_TEST_CAPTURE="$captured_args" \
  GESTION_VPS_TEST_EXIT=23 \
  bash "$guard" --test-helper "$fake_helper"; then
  printf 'Le garde a masqué un échec du helper GestionVPS.\n' >&2
  exit 1
else
  status=$?
  [[ "$status" -eq 23 ]]
fi

grep -Fq 'PRODUCTION_HELPER="/usr/local/sbin/gestion-vps-backup-guard"' "$guard"
bash -n "$guard"
printf 'backup_guard_contract=PASS application=formeducweb\n'
