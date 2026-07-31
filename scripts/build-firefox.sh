#!/usr/bin/env bash
set -euo pipefail

source_dir="$(cd "$(dirname "$0")/.." && pwd)"
output_file="${1:-$source_dir/dist/linear-pr-description-firefox-1.0.2.zip}"
staging_dir="$(mktemp -d "${TMPDIR:-/tmp}/linear-pr-description-firefox.XXXXXX")"

trap 'rm -rf "$staging_dir"' EXIT

mkdir -p "$staging_dir/extension" "$(dirname "$output_file")"
cp "$source_dir/manifest.json" "$staging_dir/extension/"
cp -R "$source_dir/src" "$source_dir/icons" "$staging_dir/extension/"

cd "$staging_dir/extension"
zip -qr "$output_file" .

echo "Firefox package created at $output_file"
