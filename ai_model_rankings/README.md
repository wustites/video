# AI Model Rankings

Visualization video of AI model rankings from [Artificial Analysis](https://artificialanalysis.ai/).

## Features

- Intelligence Index rankings for top AI models (live data)
- Speed vs Intelligence scatter plot
- Provider distribution analysis
- Animated bar charts and data visualizations

## Usage

```bash
# Fetch latest leaderboard data → public/data.js
npm run setup

# Preview
npm run dev

# Lint
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
