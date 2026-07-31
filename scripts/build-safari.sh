#!/usr/bin/env bash
set -euo pipefail

source_dir="$(cd "$(dirname "$0")/.." && pwd)"
project_dir="${1:-$source_dir/build/LinearPRDescriptionSafari}"
project_parent="$(dirname "$project_dir")"
project_name="$(basename "$project_dir")"
staging_dir="$(mktemp -d "${TMPDIR:-/tmp}/linear-pr-title.XXXXXX")"
bundle_identifier="${BUNDLE_IDENTIFIER:-com.jacobzivandesign.linear-pr-description}"
development_team="${DEVELOPMENT_TEAM:-5X48PFL69D}"

trap 'rm -rf "$staging_dir"' EXIT

mkdir -p "$staging_dir/extension" "$project_parent"
cp "$source_dir/manifest.json" "$staging_dir/extension/"
cp -R "$source_dir/src" "$source_dir/icons" "$staging_dir/extension/"

xcrun safari-web-extension-converter "$staging_dir/extension" \
  --project-location "$project_parent" \
  --app-name "$project_name" \
  --bundle-identifier "$bundle_identifier" \
  --copy-resources \
  --force \
  --no-open

project_file="$project_dir/$project_name.xcodeproj/project.pbxproj"
sed -i '' \
  "s/CODE_SIGN_STYLE = Automatic;/CODE_SIGN_STYLE = Automatic;\\
                DEVELOPMENT_TEAM = $development_team;/g" \
  "$project_file"

echo "Safari project created at $project_dir"
echo "Configured all targets for development team $development_team"
