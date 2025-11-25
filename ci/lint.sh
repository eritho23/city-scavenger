#!/usr/bin/env bash

ERR=0

bun install || ERR=1

echo "::add-matcher::ci/matchers/svelte.json"
bunx sv check --output machine-verbose || ERR=1
echo "::remove-matcher owner=svelte::"

echo "::add-matcher::ci/matchers/eslint.json"
bunx eslint --format compact || ERR=1
echo "::remove-matcher owner=eslint::"

exit $ERR
