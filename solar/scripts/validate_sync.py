#!/usr/bin/env python3
"""Validate generated Solar audio/cue timing before rendering."""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VOICEOVER_DIR = ROOT / "public" / "voiceover"
LANGUAGES = ("en", "zh", "ja", "ko")
EXPECTED_CUES = 11
TOLERANCE = 0.08


def audio_duration(path: Path) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip())


def html_durations(language: str) -> tuple[float, float]:
    html = (ROOT / "compositions" / f"{language}.html").read_text(encoding="utf-8")
    composition_match = re.search(r'data-composition-id="solar-[^"]+"[^>]*data-duration="([0-9.]+)"', html)
    audio_match = re.search(r'<audio id="voiceover"[^>]*data-duration="([0-9.]+)"', html)
    if not composition_match or not audio_match:
        raise ValueError(f"{language}: composition or audio duration not found")
    return float(composition_match.group(1)), float(audio_match.group(1))


def validate(language: str) -> None:
    audio_path = VOICEOVER_DIR / f"solar-system-{language}.mp3"
    cue_path = VOICEOVER_DIR / f"cues.{language}.json"
    if not audio_path.exists() or audio_path.stat().st_size == 0:
        raise ValueError(f"{language}: missing or empty audio")
    if not cue_path.exists():
        raise ValueError(f"{language}: missing cue JSON")

    payload = json.loads(cue_path.read_text(encoding="utf-8"))
    cues = payload["cues"]
    if len(cues) != EXPECTED_CUES:
        raise ValueError(f"{language}: expected {EXPECTED_CUES} cues, got {len(cues)}")
    previous_end = 0.0
    for cue in cues:
        if cue["start"] < previous_end - TOLERANCE:
            raise ValueError(f"{language}: overlapping cue {cue['id']}")
        if cue["end"] <= cue["start"]:
            raise ValueError(f"{language}: invalid cue {cue['id']}")
        previous_end = cue["end"]

    actual_audio_duration = audio_duration(audio_path)
    if abs(payload["audioDuration"] - actual_audio_duration) > TOLERANCE:
        raise ValueError(f"{language}: recorded audio duration differs from ffprobe")
    if previous_end > actual_audio_duration + TOLERANCE:
        raise ValueError(f"{language}: last cue exceeds audio duration")
    comp_duration, html_audio_duration = html_durations(language)
    if abs(html_audio_duration - actual_audio_duration) > TOLERANCE:
        raise ValueError(f"{language}: HTML audio duration differs from ffprobe")
    if comp_duration < actual_audio_duration + 0.45:
        raise ValueError(f"{language}: composition does not include end padding")
    print(f"Validated {language}: {len(cues)} cues, audio={actual_audio_duration:.3f}s, composition={comp_duration:.3f}s")


if __name__ == "__main__":
    for lang in LANGUAGES:
        validate(lang)
