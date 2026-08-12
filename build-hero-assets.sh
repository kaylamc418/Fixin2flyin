#!/usr/bin/env bash
set -euo pipefail

SOURCE="assets/DOMPROJ.jpg"

if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp is required to build responsive hero assets." >&2
  exit 1
fi

if [[ ! -f "$SOURCE" ]]; then
  echo "Missing hero source: $SOURCE" >&2
  exit 1
fi

# Desktop: preserve the complete 1440x860 composition.
cwebp -quiet -m 6 -q 84 "$SOURCE" -o assets/hero-desktop.webp

# Tablet: centered 4:3 art-directed crop, resized to 960x720.
cwebp -quiet -m 6 -q 83 \
  -crop 146 0 1147 860 \
  -resize 960 720 \
  "$SOURCE" -o assets/hero-tablet.webp

# Mobile: centered 2:3 art-directed crop, resized to 720x1080.
# Keeps the rider / flag corridor while avoiding a blind desktop cover crop.
cwebp -quiet -m 6 -q 82 \
  -crop 433 0 573 860 \
  -resize 720 1080 \
  "$SOURCE" -o assets/hero-mobile.webp

for asset in assets/hero-desktop.webp assets/hero-tablet.webp assets/hero-mobile.webp; do
  test -s "$asset"
  echo "Built $asset ($(wc -c < "$asset") bytes)"
done
