"""Cut and level the music bed, and write its beat grid.

Usage: python3 scripts/prepare_music.py <karma.mp3>
The source is Mixkit "Karma" (https://assets.mixkit.co/music/1183/1183.mp3, Mixkit Stock Music
Free License). The film starts on the track's first beat and runs LENGTH beats; the bed fades out
over the last FADE seconds. Writes assets/music/karma.mp3 (-14 LUFS, -1 dBTP) and
assets/music/beats.json (beat times in seconds from the film start), which build.py times every cut to.
"""
import json
import subprocess
import sys
from pathlib import Path

import librosa
import numpy as np

OUT = Path(__file__).resolve().parent.parent / "assets" / "music"
LENGTH, FADE = 68, 2.4  # beats in the film; fade-out under the end card

src = sys.argv[1]
y, sr = librosa.load(src, sr=22050)
_, beats = librosa.beat.beat_track(y=y, sr=sr, units="time")
beats = np.asarray(beats)
start = float(beats[0])
grid = [round(float(b) - start, 3) for b in beats[:LENGTH + 1]]
period = float(np.median(np.diff(beats[:LENGTH + 1])))
total = grid[LENGTH]
OUT.mkdir(parents=True, exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{start:.3f}", "-t", f"{total:.3f}", "-i", src,
                "-af", f"afade=t=out:st={total - FADE:.3f}:d={FADE},loudnorm=I=-14:TP=-1.5:LRA=11",
                "-ar", "44100", "-b:a", "192k", str(OUT / "karma.mp3")], check=True)
(OUT / "beats.json").write_text(json.dumps({"bpm": round(60 / period, 2), "start_in_track": round(start, 3),
                                            "beats": grid}, indent=1))
print(f"bpm {60 / period:.2f}, film {total:.3f}s, track from {start:.3f}s")
