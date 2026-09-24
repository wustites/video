#!/usr/bin/env python3
"""Generate Russian narration with Edge TTS, measure each scene, and sync captions."""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
VOICE_DIR = BASE / "public" / "voiceover"
NARRATION = VOICE_DIR / "narration.ru.txt"
CAPTIONS = VOICE_DIR / "subtitles.ru-en.json"
VOICE = "ru-RU-SvetlanaNeural"
RATE = "-4%"
EXPECTED_SEGMENTS = 8


def duration(path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip())


def vtt_timestamp(seconds: float) -> str:
    total_ms = round(seconds * 1000)
    hours, remainder = divmod(total_ms, 3_600_000)
    minutes, remainder = divmod(remainder, 60_000)
    secs, millis = divmod(remainder, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"


def write_vtt(durations: list[float], captions: list[dict[str, str]]) -> None:
    if len(durations) != len(captions):
        raise SystemExit("字幕数量与旁白段落数不一致")

    start = 0.0
    lines = ["WEBVTT", "", "NOTE Russian narration with English translation", ""]
    for index, (dur, caption) in enumerate(zip(durations, captions), 1):
        end = start + dur
        lines.extend(
            [
                str(index),
                f"{vtt_timestamp(start)} --> {vtt_timestamp(end)}",
                caption["ru"],
                caption["en"],
                "",
            ]
        )
        start = end
    (VOICE_DIR / "subtitles.ru-en.vtt").write_text("\n".join(lines), encoding="utf-8")


VOICE_DIR.mkdir(parents=True, exist_ok=True)
text = NARRATION.read_text(encoding="utf-8")
paragraphs = [paragraph.strip() for paragraph in text.split("\n\n") if paragraph.strip()]
print(f"paragraphs: {len(paragraphs)}")
if len(paragraphs) != EXPECTED_SEGMENTS:
    raise SystemExit(
        f"旁白段落数 {len(paragraphs)} != 预期 {EXPECTED_SEGMENTS}，"
        "请同步 src/timing.ts 的 SCENE_IDS"
    )

captions = json.loads(CAPTIONS.read_text(encoding="utf-8"))
expected_scene_ids = ["intro", "network", "history", "map", "depth", "architecture", "service", "outro"]
if len(captions) != EXPECTED_SEGMENTS or [caption.get("scene") for caption in captions] != expected_scene_ids:
    raise SystemExit(
        f"字幕数量或场景顺序不正确，预期 {len(expected_scene_ids)} 个：{', '.join(expected_scene_ids)}"
    )
if any(caption.get("ru") != paragraph for caption, paragraph in zip(captions, paragraphs)):
    raise SystemExit("俄语字幕与旁白文本不一致，请同步 subtitles.ru-en.json")

durations: list[float] = []
for index, paragraph in enumerate(paragraphs, 1):
    segment = VOICE_DIR / f"seg{index}.mp3"
    subprocess.run(
        [
            sys.executable,
            "-m",
            "edge_tts",
            "--voice",
            VOICE,
            f"--rate={RATE}",
            "--text",
            paragraph,
            "--write-media",
            str(segment),
        ],
        check=True,
    )
    measured = duration(segment)
    durations.append(measured)
    print(f"seg{index}: {measured:.3f}s | {paragraph[:64]}...")

concat_list = VOICE_DIR / "concat.txt"
with concat_list.open("w", encoding="utf-8") as handle:
    for index in range(1, len(paragraphs) + 1):
        handle.write(f"file 'seg{index}.mp3'\n")

final_audio = VOICE_DIR / "narration.ru.mp3"
subprocess.run(
    [
        "ffmpeg",
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        str(concat_list),
        "-c",
        "copy",
        str(final_audio),
    ],
    check=True,
    capture_output=True,
)

final_duration = duration(final_audio)
with (VOICE_DIR / "segment-durations.json").open("w", encoding="utf-8") as handle:
    json.dump(durations, handle, ensure_ascii=False, indent=2)
    handle.write("\n")
write_vtt(durations, captions)

print(f"total: {sum(durations):.3f}s")
print(f"final narration.ru.mp3: {final_duration:.3f}s")
print(f"wrote subtitles.ru-en.vtt ({len(captions)} cues)")

for index in range(1, len(paragraphs) + 1):
    (VOICE_DIR / f"seg{index}.mp3").unlink(missing_ok=True)
concat_list.unlink(missing_ok=True)
print("done")
