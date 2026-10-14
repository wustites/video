#!/usr/bin/env python3
"""Generate per-paragraph narration with Edge TTS, measure durations, and concat.

Run from a project root (npm run voiceover). Reads public/voiceover/narration.<lang>.txt,
writes public/voiceover/narration.<lang>.mp3 and public/voiceover/segment-durations.json.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path


def probe_duration(path: Path) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        capture_output=True, check=True, text=True,
    )
    return float(result.stdout.strip())


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--voice", required=True, help="Edge TTS voice, e.g. ja-JP-NanamiNeural")
    parser.add_argument("--lang", required=True, help="narration file suffix, e.g. ja")
    parser.add_argument("--rate", default="+0%", help="Edge TTS rate, e.g. +8%%")
    parser.add_argument("--expected", type=int, help="required paragraph count (SCENE_IDS in src/timing.ts)")
    parser.add_argument("--durations-format", choices=["list", "starts"], default="list",
                        help="list: [d1, ...]; starts: {durations, starts, total}")
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="project root (default: cwd)")
    args = parser.parse_args()

    vo = args.root / "public" / "voiceover"
    vo.mkdir(parents=True, exist_ok=True)
    text = (vo / f"narration.{args.lang}.txt").read_text(encoding="utf-8")
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    print(f"paragraphs: {len(paragraphs)}")
    if args.expected is not None and len(paragraphs) != args.expected:
        raise SystemExit(
            f"Narration has {len(paragraphs)} paragraphs but expected {args.expected}; "
            "update SCENE_IDS in src/timing.ts (or restore the paragraph breaks)."
        )

    segments = [vo / f"seg{i}.mp3" for i in range(1, len(paragraphs) + 1)]
    durations = []
    for segment, paragraph in zip(segments, paragraphs):
        subprocess.run(
            [sys.executable, "-m", "edge_tts", "--voice", args.voice, f"--rate={args.rate}",
             "--text", paragraph, "--write-media", str(segment)],
            check=True,
        )
        durations.append(probe_duration(segment))
        print(f"{segment.stem}: {durations[-1]:.3f}s | {paragraph[:40]}...")

    concat = vo / "concat.txt"
    concat.write_text("".join(f"file '{s.name}'\n" for s in segments), encoding="utf-8")
    final = vo / f"narration.{args.lang}.mp3"
    subprocess.run(
        ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat), "-c", "copy", str(final)],
        check=True, capture_output=True,
    )

    if args.durations_format == "starts":
        starts, total = [], 0.0
        for d in durations:
            starts.append(total)
            total += d
        payload = {"durations": durations, "starts": starts, "total": total}
    else:
        payload = durations
    (vo / "segment-durations.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    for segment in segments:
        segment.unlink()
    concat.unlink()
    print(f"total: {sum(durations):.3f}s | {final.name}: {probe_duration(final):.3f}s")


if __name__ == "__main__":
    main()
