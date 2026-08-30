#!/usr/bin/env bash
# Static web export for Cloudflare Pages.
#
# Wrangler's Pages asset uploader silently skips any file whose path contains
# a `node_modules` directory segment (confirmed empirically — an empty
# `.assetsignore` does not override it). Metro's web export mirrors each
# asset's require() resolution path under `assets/`, so vendor icon fonts
# and other package assets land at e.g.
# `assets/node_modules/@expo/vector-icons/.../Ionicons.ttf` and get dropped
# from the deploy without any error. The app then loads with those assets
# 404-ing (Cloudflare's SPA fallback serves index.html in their place),
# which broke icon fonts badly enough to blank the whole app.
#
# Fix: rename that directory out of the way and rewrite the (static string)
# references to it in the built JS bundle before deploying.
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf dist
npx expo export --platform web --clear

if [ -d dist/assets/node_modules ]; then
  mv dist/assets/node_modules dist/assets/_vendor
  grep -rl "assets/node_modules" dist --include="*.js" --include="*.css" --include="*.html" --include="*.json" \
    | xargs -I{} sed -i '' 's#assets/node_modules/#assets/_vendor/#g' {}
fi

echo "Web export ready in dist/"
