#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INPUT_PATH="${1:-$SCRIPT_DIR/wedding.html}"
OUTPUT_PATH="${2:-$SCRIPT_DIR/wedding.png}"
WIDTH="${WIDTH:-2400}"
HEIGHT="${HEIGHT:-2400}"
WAIT_MS="${WAIT_MS:-2500}"
PLAYWRIGHT_BROWSER="${PLAYWRIGHT_BROWSER:-chromium}"

if [[ ! -f "$INPUT_PATH" ]]; then
  printf 'Input HTML not found: %s\n' "$INPUT_PATH" >&2
  exit 1
fi

FILE_URL="$(node -e 'const { pathToFileURL } = require("node:url"); console.log(pathToFileURL(process.argv[1]).href)' "$INPUT_PATH")"

npx playwright screenshot \
  --browser "$PLAYWRIGHT_BROWSER" \
  --full-page \
  --viewport-size "${WIDTH},${HEIGHT}" \
  --wait-for-timeout "$WAIT_MS" \
  "$FILE_URL" \
  "$OUTPUT_PATH"

printf 'Image written to %s\n' "$OUTPUT_PATH"
