# AI Model Rankings

Visualization video of AI model rankings from [Artificial Analysis](https://artificialanalysis.ai/).

## Features

- Intelligence Index rankings for top AI models (committed snapshot)
- Speed vs Intelligence scatter plot
- Provider distribution analysis
- Animated bar charts and data visualizations

## Usage

```bash
# Fetch latest leaderboard data → src/snapshot.json and public/data.js
npm run data:update

# Preview
npm run dev

# TypeScript type check
npm run check

# Render to MP4
npm run render
```

## Narration

Each locale has an Edge TTS voiceover: English, Chinese and Japanese (en-US-AriaNeural, zh-CN-XiaoxiaoNeural, ja-JP-NanamiNeural). `npm run voiceover` writes the narration for every
locale from `src/snapshot.json` (`scripts/voiceover.mjs`), so the spoken numbers always match the
snapshot, then synthesizes it with `packages/voiceover/edge_narration.py`. Scene lengths come from
the measured paragraphs, and elements appear when the narration names them (`src/timing.ts`,
Edge TTS WordBoundary). Re-run `npm run voiceover` after `npm run data:update`.

## Data Update

`scripts/setup.mjs` scrapes the Artificial Analysis models leaderboard, parses the
SSR table (model name, creator, Intelligence Index, median tokens/s), and writes
the snapshot to `src/snapshot.json` for Remotion and `public/data.js` for legacy compositions.

- `public/video.js` merges the snapshot with localized copy ported from the former `public/i18n.js`.
- Setup runs automatically in CI before validate/render; if the fetch fails it
  keeps `src/snapshot.json`; if that snapshot is missing, setup fails.

## Data Source

- Leaderboard: https://artificialanalysis.ai/leaderboards/models
- Index: Artificial Analysis Intelligence Index (average of 9 independent benchmarks)

## Remotion Port

The video is implemented in Remotion under `src/` (ported from the original HyperFrames version):

- `src/AiModelRankings.tsx` — one component for all locales (`locale` prop:
  `en` | `zh` | `ja`), 7 scenes keeping the original HyperFrames timeline
  (intro 0–240, ranking 210–510, scatter 480–780, efficiency 750–1050,
  tiers 1020–1320, providers 1290–1560, outro 1530–1800 frames).
- `src/data.ts` — typed exports from `src/snapshot.json` (15 ranked models,
  16 scatter points, 8 provider counts, tier counts, insight cards, metrics).
- `src/i18n.ts` — en+zh+ja copy ported from the former `public/i18n.js`; `{{placeholders}}`
  resolve from the static snapshot at render.
- `src/fonts.ts` — Noto Sans SC + Noto Sans JP loader (multilang project).
- `src/Root.tsx` — `AiModelRankingsEn/Zh/Ja` compositions, 1080x1920@30fps,
  1800 frames (60s). No audio; silent video.

All animation is frame-driven (`interpolate` progress + per-index stagger
delays, `Math.round` counters, scatter dots positioned from the same
speed/score scale functions precomputed at module scope). No render-time
fetch, no per-frame DOM queries.

```bash
npm run dev            # Remotion Studio
npm run check          # tsc --noEmit
npm run render         # render EN to out/video.mp4
npm run render:draft   # preview to out/preview.mp4; only changes output and log level
```

The HyperFrames source files have been removed; see the [framework decision record](../../docs/decisions/0001-remotion-as-primary-framework.md).
`npm run render:en`, `npm run render:zh`, and `npm run render:ja` render the Remotion compositions.

`npm run data:update` updates `src/snapshot.json`. Run it explicitly and review the snapshot before release; release CI does not refresh data.
Remotion bundles the JSON snapshot, so local renders and CI use the updated data without manual synchronization.
