#!/usr/bin/env bash
# Deploy the tested listing-field change without replacing uploads or .env.
# Run as the existing deployment user; arguments are project path and commit.
set -Eeuo pipefail
umask 077

app=$(realpath "${1:?Project path required}")
requested=${2:?Tested commit required}
cd "$app"
old=$(git rev-parse HEAD)
target=$(git rev-parse "$requested^{commit}")
short=${target:0:7}
git merge-base --is-ancestor "$old" "$target"
git diff --quiet
git diff --cached --quiet
test -f .env
test -d .next
test -d node_modules/.prisma
test -z "$(git diff --name-only "$old" "$target" -- package.json package-lock.json)"

release="$(dirname "$app")/kelikuli-release-$short"
if [[ ! -d "$release" ]]; then
  git worktree add --detach "$release" "$target"
fi
test "$(git -C "$release" rev-parse HEAD)" = "$target"
if [[ ! -d "$release/node_modules" ]]; then
  cp -a node_modules "$release/node_modules"
fi
cp -a .env "$release/.env"
backup=$(mktemp -d "$(dirname "$app")/kelikuli-rollback-alibaba-$short-XXXXXX")
printf '%s\n' "$old" > "$backup/previous-commit"
printf '%s\n' "$target" > "$backup/target-commit"
preview_pid=
source_changed=0
cutover_started=0
success=0
cleanup() {
  local result=$?
  trap - EXIT
  if [[ -n "$preview_pid" ]]; then
    kill "$preview_pid" 2>/dev/null || true
    wait "$preview_pid" 2>/dev/null || true
  fi
  if [[ "$success" = 0 ]]; then
    if [[ "$cutover_started" = 1 ]]; then
      pm2 stop kelikuli >/dev/null 2>&1 || true
      if [[ -d "$backup/.next" ]]; then
        if [[ -d "$app/.next" ]]; then mv "$app/.next" "$backup/failed-next"; fi
        mv "$backup/.next" "$app/.next"
      fi
      if [[ -d "$backup/old-prisma" ]]; then
        if [[ -d "$app/node_modules/.prisma" ]]; then mv "$app/node_modules/.prisma" "$backup/failed-prisma"; fi
        mv "$backup/old-prisma" "$app/node_modules/.prisma"
      fi
    fi
    if [[ "$source_changed" = 1 ]]; then git -C "$app" reset --keep "$old"; fi
    if [[ "$cutover_started" = 1 ]]; then pm2 restart kelikuli --update-env >/dev/null; fi
    printf 'DEPLOYMENT_FAILED: production files retained or restored; backup=%s\n' "$backup"
  fi
  exit "$result"
}
trap cleanup EXIT

# Preserve the affected table before adding columns; credentials never leave .env.
node --env-file=.env - "$backup" <<'NODE'
const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
(async () => {
  if (!process.env.CUSTOM_LAB_API_KEY) throw new Error('Custom Lab API key is not configured');
  const rows = await db.product.findMany();
  fs.writeFileSync(path.join(process.argv[2], 'products.json'), JSON.stringify(rows), { mode: 0o600, flag: 'wx' });
  console.log('PRODUCT_BACKUP_COMPLETE', rows.length);
})().catch(() => { console.error('Product backup or configuration check failed'); process.exitCode = 1; }).finally(() => db.$disconnect());
NODE

cd "$release"
node_modules/.bin/prisma db execute --file prisma/updates/20261112-alibaba-drafts.sql --schema prisma/schema.prisma
node_modules/.bin/prisma db execute --file prisma/updates/20261112-alibaba-listing.sql --schema prisma/schema.prisma
# Raise only the build process's OOM score so it is preferred over the live site.
(
  printf 500 > /proc/self/oom_score_adj
  NODE_OPTIONS=--max-old-space-size=1024 nice -n 10 npm run build
) > "$backup/build.log" 2>&1
test -s .next/BUILD_ID

healthcheck() {
  node --env-file=.env --input-type=module - "$1" <<'NODE'
const base = process.argv[2];
let last;
for (let attempt = 0; attempt < 15; attempt++) {
  try {
    const home = await fetch(base + '/', { signal: AbortSignal.timeout(10000) });
    if (!home.ok) throw new Error('homepage HTTP ' + home.status);
    const response = await fetch(base + '/api/custom-lab/products', {
      headers: { Authorization: 'Bearer ' + process.env.CUSTOM_LAB_API_KEY },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('intake HTTP ' + response.status);
    const info = await response.json();
    if (info.intakeVersion !== 2 || info.supportsAlibabaListing !== true) throw new Error('intake capability mismatch');
    console.log('HEALTHCHECK_OK', JSON.stringify(info));
    process.exit(0);
  } catch (error) { last = error.message; }
  await new Promise(resolve => setTimeout(resolve, 2000));
}
console.error('HEALTHCHECK_FAILED', last);
process.exit(1);
NODE
}

node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3001 > "$backup/preview.log" 2>&1 &
preview_pid=$!
healthcheck http://127.0.0.1:3001
kill "$preview_pid"
wait "$preview_pid" || true
preview_pid=

incoming="$app/.next-incoming-$short"
test ! -e "$incoming"
cp -a .next "$incoming"
# Keep previous hashed assets available to already-open browser pages.
cp -an "$app/.next/static/." "$incoming/static/"
cd "$app"
git merge --ff-only "$target"
source_changed=1
cutover_started=1
pm2 stop kelikuli >/dev/null
mv .next "$backup/.next"
mv "$incoming" .next
mv node_modules/.prisma "$backup/old-prisma"
cp -a "$release/node_modules/.prisma" node_modules/.prisma
pm2 restart kelikuli --update-env >/dev/null
healthcheck http://127.0.0.1:3000
pm2 save >/dev/null
success=1
printf '%s\n' "$target" > "$backup/DEPLOYED"
printf 'DEPLOYMENT_SUCCEEDED commit=%s backup=%s\n' "$target" "$backup"
