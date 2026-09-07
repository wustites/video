# AI Model Rankings

Visualization video of AI model rankings from [Artificial Analysis](https://artificialanalysis.ai/).

## Features

- Intelligence Index rankings for top AI models (committed snapshot)
- Speed vs Intelligence scatter plot
- Provider distribution analysis
- Animated bar charts and data visualizations

## Usage

```bash
# Fetch latest leaderboard data → public/data.js
npm run setup
# Manually synchronize public/data.js into src/data.ts before rendering

# Preview
npm run dev

# TypeScript type check
npm run check

# Render to MP4
npm run render
```

## Data Update

`scripts/setup.mjs` scrapes the Artificial Analysis models leaderboard, parses the
SSR table (model name, creator, Intelligence Index, median tokens/s), and writes
the snapshot to `public/data.js` (`window.AI_MODEL_RANKINGS_DATA`).

- `public/video.js` merges the snapshot with localized copy from `public/i18n.js`.
- Setup runs automatically in CI before validate/render; if the fetch fails it
  keeps the committed `public/data.js` snapshot so builds never break.

## Data Source

- Leaderboard: https://artificialanalysis.ai/leaderboards/models
- Index: Artificial Analysis Intelligence Index (average of 9 independent benchmarks)

## Remotion Port

Native Remotion port lives in `src/` alongside the original HyperFrames files:

- `src/AiModelRankings.tsx` — one component for all locales (`locale` prop:
  `en` | `zh` | `ja`), 7 scenes sharing the HyperFrames timeline
  (intro 0–240, ranking 210–510, scatter 480–780, efficiency 750–1050,
  tiers 1020–1320, providers 1290–1560, outro 1530–1800 frames).
- `src/data.ts` — static snapshot of `public/data.js` (15 ranked models,
  16 scatter points, 8 provider counts, tier counts, insight cards, metrics).
- `src/i18n.ts` — en+zh+ja copy from `public/i18n.js`; `{{placeholders}}`
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
npm run render:draft   # fast draft preview to out/preview.mp4
```

Original HyperFrames source files (`compositions/*.html`, `public/video.js`) are retained.
`npm run render:en`, `npm run render:zh`, and `npm run render:ja` now render Remotion compositions.

`npm run setup` only updates `public/data.js`; it does not update the Remotion
snapshot. Manually synchronize `src/data.ts` before checking and rendering.
CI also runs setup, but the Remotion output still uses the committed TypeScript snapshot.
