#!/usr/bin/env bash
set -euo pipefail

# === ΡΥΘΜΙΣΕΙΣ ===
INPUT_DIR="${1:-images/original}"      # φάκελος με τις αρχικές εικόνες
OUTPUT_BASE="${2:-images/out}"         # βάση εξόδου
SIZES="${3:-320 640 1024 1920}"        # πλάτη (px), χωρισμένα με κενά
QUALITY_JPEG="${QUALITY_JPEG:-82}"     # ποιότητα JPG (0-100)
CREATE_WEBP="${CREATE_WEBP:-false}"    # true/false
QUALITY_WEBP="${QUALITY_WEBP:-78}"     # ποιότητα WebP (0-100)

# === ΦΑΚΕΛΟΙ ===
mkdir -p "$OUTPUT_BASE"
for size in $SIZES; do
  mkdir -p "$OUTPUT_BASE/$size"
  if [ "$CREATE_WEBP" = "true" ]; then
    mkdir -p "$OUTPUT_BASE/${size}-webp"
  fi
done

# === Helpers ===
slugify() {
  echo "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9._-]+/_/g' \
    | sed -E 's/_+/_/g' \
    | sed -E 's/^_+|_+$//g'
}

change_ext() {
  local fname="$1"; local newext="$2"
  echo "${fname%.*}.${newext}"
}

# === Συλλογή αρχείων χωρίς “μαγικά” redirections ===
shopt -s nullglob
FILES=()
for ext in jpg JPG jpeg JPEG png PNG heic HEIC webp WEBP; do
  for f in "$INPUT_DIR"/*."$ext"; do FILES+=("$f"); done
done

if [ ${#FILES[@]} -eq 0 ]; then
  echo "⚠️  Δεν βρέθηκαν εικόνες σε: $INPUT_DIR"
  exit 0
fi

echo "🔧 Επεξεργασία ${#FILES[@]} εικόνων από '$INPUT_DIR' → '$OUTPUT_BASE'…"

for IMG in "${FILES[@]}"; do
  BASENAME="$(basename "$IMG")"
  SAFE_NAME="$(slugify "$BASENAME")"
  EXT_LOWER="${SAFE_NAME##*.}"

  SRC="$IMG"
  TMP=""
  # HEIC → προσωρινά JPG
  if [[ "$EXT_LOWER" =~ ^(heic)$ ]]; then
    TMP="$(mktemp -t heic2jpgXXXX).jpg"
    if magick -list format | grep -qi 'HEIC'; then
      magick "$IMG" -auto-orient -strip "$TMP"
    else
      sips -s format jpeg "$IMG" --out "$TMP" >/dev/null
    fi
    SRC="$TMP"
    SAFE_NAME="$(change_ext "$SAFE_NAME" "jpg")"
    EXT_LOWER="jpg"
  fi

  TARGET_BASE_JPG="$SAFE_NAME"
  if [[ ! "$EXT_LOWER" =~ ^(jpg|jpeg)$ ]]; then
    TARGET_BASE_JPG="$(change_ext "$SAFE_NAME" "jpg")"
  fi

  for size in $SIZES; do
    OUT_JPG="$OUTPUT_BASE/$size/$TARGET_BASE_JPG"
    magick "$SRC" \
      -auto-orient -strip \
      -sampling-factor 4:2:0 \
      -interlace Plane \
      -quality "$QUALITY_JPEG" \
      -resize "${size}x" \
      "$OUT_JPG"

    if [ "$CREATE_WEBP" = "true" ]; then
      OUT_WEBP="$OUTPUT_BASE/${size}-webp/$(change_ext "$TARGET_BASE_JPG" "webp")"
      magick "$SRC" \
        -auto-orient -strip \
        -quality "$QUALITY_WEBP" \
        -resize "${size}x" \
        "$OUT_WEBP"
    fi
  done

  [ -n "${TMP:-}" ] && [ -f "$TMP" ] && rm -f "$TMP"
done

echo "✅ Έτοιμο! Δες: $OUTPUT_BASE/<size>/"
