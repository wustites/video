#!/usr/bin/env python3
"""Generate per-paragraph Chinese narration with Edge TTS, measure durations, concat."""
import json
import os
import subprocess
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VO = os.path.join(BASE, "public", "voiceover")
VOICE = "zh-CN-YunjianNeural"
RATE = "+12%"

os.makedirs(VO, exist_ok=True)

with open(os.path.join(VO, "narration.zh.txt"), encoding="utf-8") as f:
    text = f.read()
paras = [p.strip() for p in text.split("\n\n") if p.strip()]
print(f"paragraphs: {len(paras)}")

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
    print(f"seg{i}: {dur:.3f}s | {len(para)} chars | {para[:40]}...")

total = sum(durations)
print(f"total: {total:.3f}s")

concat_list = os.path.join(VO, "concat.txt")
with open(concat_list, "w", encoding="utf-8") as f:
    for i in range(1, len(paras) + 1):
        f.write(f"file 'seg{i}.mp3'\n")
final = os.path.join(VO, "narration.zh.mp3")
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
print(f"final narration.zh.mp3: {float(out.stdout.strip()):.3f}s")

# cumulative start times per scene
starts = []
acc = 0.0
for d in durations:
    starts.append(acc)
    acc += d
with open(os.path.join(VO, "segment-durations.json"), "w", encoding="utf-8") as f:
    json.dump({"durations": durations, "starts": starts, "total": acc}, f, indent=2)

for i in range(1, len(paras) + 1):
    os.remove(os.path.join(VO, f"seg{i}.mp3"))
os.remove(concat_list)
print("done")
