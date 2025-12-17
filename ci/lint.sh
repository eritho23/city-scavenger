#!/usr/bin/env bash

ERR=0

cp -al "$(nix build '.#deps' --print-out-paths | head -n1)" ./bun-cache
export BUN_INSTALL_CACHE_DIR="$(pwd)/bun-cache"

bun install || ERR=1

bun run prepare || ERR=1

make ./tmp || ERR=1
export DATABASE_URL=postgresql://cityscav@/cityscav?host=$(readlink ./tmp) || ERR=1
make gen-types || ERR=1

echo "::add-matcher::ci/matchers/svelte.json"
bunx sv check --output machine-verbose || ERR=1
echo "::remove-matcher owner=svelte::"

echo "::add-matcher::ci/matchers/eslint.json"
bunx eslint --format compact || ERR=1
echo "::remove-matcher owner=eslint::"

exit $ERR
