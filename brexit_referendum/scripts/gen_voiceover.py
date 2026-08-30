#!/usr/bin/env python3
"""Generate per-paragraph English narration with Edge TTS, measure durations, concat."""
import json
import os
import subprocess
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VO = os.path.join(BASE, "public", "voiceover")
VOICE = "en-GB-RyanNeural"
RATE = "+0%"

os.makedirs(VO, exist_ok=True)

EXPECTED_SEGMENTS = 6  # must match SCENE_IDS in src/timing.ts

with open(os.path.join(VO, "narration.en.txt"), encoding="utf-8") as f:
    text = f.read()
paras = [p.strip() for p in text.split("\n\n") if p.strip()]
print(f"paragraphs: {len(paras)}")
if len(paras) != EXPECTED_SEGMENTS:
    raise SystemExit(
        f"Narration has {len(paras)} paragraphs but expected {EXPECTED_SEGMENTS}; "
        "update SCENE_IDS in src/timing.ts (or restore the paragraph breaks)."
    )

durations = []
for i, para in enumerate(paras, 1):
    seg = os.path.join(VO, f"seg{i}.mp3")
    cmd = [
        sys.executable, "-m", "edge_tts",
        "--voice", VOICE,
        "--rate", RATE,
        "--text", para,
        "--write-media", seg,
    ]
    subprocess.run(cmd, check=True)
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", seg],
        capture_output=True, text=True,
    )
    dur = float(out.stdout.strip())
    durations.append(dur)
    print(f"seg{i}: {dur:.3f}s | {para[:50]}...")

total = sum(durations)
print(f"total: {total:.3f}s")

concat_list = os.path.join(VO, "concat.txt")
with open(concat_list, "w", encoding="utf-8") as f:
    for i in range(1, len(paras) + 1):
        f.write(f"file 'seg{i}.mp3'\n")
final = os.path.join(VO, "narration.en.mp3")
subprocess.run(
    ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_list,
     "-c", "copy", final],
    check=True, capture_output=True,
)
out = subprocess.run(
    ["ffprobe", "-v", "error", "-show_entries", "format=duration",
     "-of", "default=noprint_wrappers=1:nokey=1", final],
    capture_output=True, text=True,
)
print(f"final narration.en.mp3: {float(out.stdout.strip()):.3f}s")

with open(os.path.join(VO, "segment-durations.json"), "w", encoding="utf-8") as f:
    json.dump(durations, f, indent=2)

for i in range(1, len(paras) + 1):
    os.remove(os.path.join(VO, f"seg{i}.mp3"))
os.remove(concat_list)
print("done")
