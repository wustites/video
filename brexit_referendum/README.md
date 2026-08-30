# Brexit: The Referendum Story

Remotion data story (English narration), vertical 1080×1920. Uses Google Fonts **Inter** as a network font, awaited before rendering.

Five chapters: the pledge and the polls → referendum night (result, nation splits, age divide) → three years of parliamentary deadlock → exit day and the trade deal → conclusions. Narration is generated with Edge TTS (`en-GB-RyanNeural`), and scene timings are derived from the measured audio durations, so re-generating the voiceover automatically re-syncs the timeline.

## Run

```bash
npm install
npm run dev
npm run voiceover   # requires edge-tts + ffmpeg
npm run check
npm run render:draft
npm run render
```

## Narration

`public/voiceover/narration.en.txt` holds one paragraph per scene. `npm run voiceover` renders each paragraph to MP3, writes `segment-durations.json`, and concatenates the full track to `narration.en.mp3`. `src/timing.ts` builds the scene start/end times from those measured durations — edit the narration, then always re-run the voiceover script.

## Data

Figures live in `src/data.ts` and are illustrative anchors stitched from publicly reported numbers (Electoral Commission result, post-referendum age/nation splits, poll averages). They are meant for trend display, not as a substitute for official datasets; replace `values` and `SOURCES` before publishing a final cut.
