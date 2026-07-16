#!/usr/bin/env python3
"""Generate segmented Edge TTS audio and deterministic Solar cue files."""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

import edge_tts


ROOT = Path(__file__).resolve().parents[1]
VOICEOVER_DIR = ROOT / "public" / "voiceover"
COMPOSITIONS_DIR = ROOT / "compositions"

LANGUAGES = {
    "en": {
        "voice": "en-US-AriaNeural",
        "names": ["The Sun", "The Sun", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Solar System"],
    },
    "zh": {
        "voice": "zh-CN-XiaoxiaoNeural",
        "names": ["太阳", "太阳", "水星", "金星", "地球", "火星", "木星", "土星", "天王星", "海王星", "太阳系"],
    },
    "ja": {
        "voice": "ja-JP-NanamiNeural",
        "names": ["太陽", "太陽", "水星", "金星", "地球", "火星", "木星", "土星", "天王星", "海王星", "太陽系"],
    },
    "ko": {
        "voice": "ko-KR-SunHiNeural",
        "names": ["태양", "태양", "수성", "금성", "지구", "화성", "목성", "토성", "천왕성", "해왕성", "태양계"],
    },
}

CUE_IDS = ["intro", "sun", "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune", "finale"]
SCENES = ["Sun", "Sun", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Finale"]
END_PADDING = 0.5


def run(command: list[str]) -> None:
    subprocess.run(command, check=True)


def duration(path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip())


def paragraphs(language: str) -> list[str]:
    source = VOICEOVER_DIR / f"narration.{language}.txt"
    return [part.strip() for part in re.split(r"\n\s*\n", source.read_text(encoding="utf-8")) if part.strip()]


async def synthesize(text: str, voice: str, output: Path) -> None:
    await edge_tts.Communicate(text, voice=voice).save(str(output))


def write_cues(language: str, voice: str, texts: list[str], segment_durations: list[float], audio_duration: float) -> None:
    cursor = 0.0
    cues = []
    names = LANGUAGES[language]["names"]
    for index, (text, segment_duration) in enumerate(zip(texts, segment_durations, strict=True)):
        start = round(cursor, 3)
        cursor += segment_duration
        cues.append({
            "id": CUE_IDS[index],
            "start": start,
            "end": round(cursor, 3),
            "text": text,
            "scene": SCENES[index],
            "name": names[index],
        })

    composition_duration = round(audio_duration + END_PADDING, 3)
    payload = {
        "language": language,
        "voice": voice,
        "audioDuration": round(audio_duration, 3),
        "compositionDuration": composition_duration,
        "cues": cues,
    }
    json_path = VOICEOVER_DIR / f"cues.{language}.json"
    js_path = VOICEOVER_DIR / f"cues.{language}.js"
    json_text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    json_path.write_text(json_text, encoding="utf-8")
    js_path.write_text("window.SOLAR_VOICEOVER = " + json_text.rstrip() + ";\n", encoding="utf-8")

    composition_path = COMPOSITIONS_DIR / f"{language}.html"
    html = composition_path.read_text(encoding="utf-8")
    html = re.sub(
        r'(data-composition-id="solar-[^"]+"[^>]*data-duration=")[0-9.]+"',
        rf'\g<1>{composition_duration}"',
        html,
    )
    html = re.sub(
        r'(<audio id="voiceover"[^>]*data-duration=")[0-9.]+"',
        rf'\g<1>{round(audio_duration, 3)}"',
        html,
    )
    composition_path.write_text(html, encoding="utf-8")
    if language == "en":
        index_path = ROOT / "index.html"
        index_html = index_path.read_text(encoding="utf-8")
        index_html = re.sub(r'data-duration="[0-9.]+"', f'data-duration="{composition_duration}"', index_html)
        index_path.write_text(index_html, encoding="utf-8")


async def generate_language(language: str) -> None:
    config = LANGUAGES[language]
    texts = paragraphs(language)
    if len(texts) != len(CUE_IDS):
        raise ValueError(f"{language}: expected {len(CUE_IDS)} paragraphs, got {len(texts)}")

    with tempfile.TemporaryDirectory(prefix=f"solar-tts-{language}-") as temp_dir_name:
        temp_dir = Path(temp_dir_name)
        segment_paths = []
        for index, text in enumerate(texts):
            segment_path = temp_dir / f"{index:02d}.mp3"
            await synthesize(text, config["voice"], segment_path)
            segment_paths.append(segment_path)

        concat_path = temp_dir / "concat.txt"
        concat_path.write_text("".join(f"file '{path.as_posix()}'\n" for path in segment_paths), encoding="utf-8")
        output = VOICEOVER_DIR / f"solar-system-{language}.mp3"
        run([
            "ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0",
            "-i", str(concat_path), "-c:a", "libmp3lame", "-b:a", "192k", str(output),
        ])
        segment_durations = [duration(path) for path in segment_paths]
        write_cues(language, config["voice"], texts, segment_durations, duration(output))
        print(f"Generated {language}: {output.name} ({duration(output):.3f}s, {len(texts)} cues)")


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--language", action="append", choices=sorted(LANGUAGES))
    args = parser.parse_args()
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        raise RuntimeError("ffmpeg and ffprobe are required")
    VOICEOVER_DIR.mkdir(parents=True, exist_ok=True)
    for language in args.language or LANGUAGES:
        await generate_language(language)


if __name__ == "__main__":
    asyncio.run(main())
