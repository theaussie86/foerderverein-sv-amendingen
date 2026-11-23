#!/usr/bin/env bash
# Rendert flyer.html mit Chrome headless nach public/dorfmeisterschaft/ und als OG-Bild der Landingpage.
set -euo pipefail

cd "$(dirname "$0")"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
ZIEL="../../../public/dorfmeisterschaft"
SEITE="file://$PWD/flyer.html"
mkdir -p "$ZIEL"

"$CHROME" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=5000 \
  --window-size=1080,1350 --screenshot="$PWD/$ZIEL/save-the-date.png" "$SEITE?format=social"

"$CHROME" --headless=new --disable-gpu --virtual-time-budget=5000 --no-pdf-header-footer \
  --print-to-pdf="$PWD/$ZIEL/save-the-date-a5.pdf" "$SEITE?format=a5"

# OG-Bild für geteilte Links (WhatsApp, Facebook)
cp "$ZIEL/save-the-date.png" ../../../src/app/dorfmeisterschaft/opengraph-image.png
echo "Fertig: $ZIEL/save-the-date.png, $ZIEL/save-the-date-a5.pdf, opengraph-image.png"
