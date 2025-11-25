#!/usr/bin/env bash

echo "::add-matcher::ci/matchers/svelte.json"
bunx sv check --output machine-verbose
echo "::remove-matcher owner=svelte::"

echo "::add-matcher::ci/matchers/eslint.json"
bunx eslint --format compact
echo "::remove-matcher owner=eslint::"
