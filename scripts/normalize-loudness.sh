#!/usr/bin/env bash
# Normalize every MP4 given on the command line to -14 LUFS integrated, -1.5 dBTP true peak,
# in place. Two-pass ffmpeg loudnorm: the first pass measures, the second applies a linear
# gain from those measurements. The video stream is copied untouched; files without an audio
# stream are skipped.
#
#   scripts/normalize-loudness.sh out/*.mp4
set -euo pipefail

TARGET_I=-14
TARGET_TP=-1.5
TARGET_LRA=11

for video in "$@"; do
  if [[ -z "$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$video")" ]]; then
    echo "skip (no audio): $video"
    continue
  fi

  stats="$(ffmpeg -hide_banner -nostats -i "$video" \
    -af "loudnorm=I=$TARGET_I:TP=$TARGET_TP:LRA=$TARGET_LRA:print_format=json" \
    -f null - 2>&1 | sed -n '/^{/,/^}/p')"
  get() { node -e 'const s=JSON.parse(process.argv[1]); process.stdout.write(String(s[process.argv[2]]))' "$stats" "$1"; }

  tmp="${video%.mp4}.loudnorm.mp4"
  ffmpeg -hide_banner -nostats -loglevel error -y -i "$video" \
    -af "loudnorm=I=$TARGET_I:TP=$TARGET_TP:LRA=$TARGET_LRA:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" \
    -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$tmp"
  mv "$tmp" "$video"

  after="$(ffmpeg -hide_banner -nostats -i "$video" -af ebur128 -f null - 2>&1 | grep -A1 'Integrated loudness' | tail -1 | awk '{print $2}')"
  echo "normalized: $video ($(get input_i) → $after LUFS)"
done
