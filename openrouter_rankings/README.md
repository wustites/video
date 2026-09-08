# OpenRouter Rankings

Visualization video of weekly model usage rankings from [OpenRouter](https://openrouter.ai/rankings).

## Features

- Top 10 models by weekly token usage
- Provider distribution analysis (donut chart)
- Weekly growth / fastest risers
- Animated bar charts, count-up numbers and data visualizations
- Multi-language: English (`en`) and Chinese (`zh`)

## Usage

```bash
# Preview
npm run dev

# TypeScript type check
npm run check

# Render to MP4
npm run render
```

## Data Source

- Source: [OpenRouter Rankings](https://openrouter.ai/rankings)
- API: `https://openrouter.ai/api/frontend/v1/rankings/models`
- Snapshot date: **2026-08-03** (week of Jul 28 – Aug 3, 2026)
- Unit: tokens (prompt + completion), aggregated per model per day

### Top 10 models (weekly token usage)

| Rank | Model | Provider | Weekly tokens |
| ---: | --- | --- | ---: |
| 1 | DeepSeek V4 Flash | DeepSeek | 8.54T |
| 2 | MiMo V2.5 | Xiaomi | 6.31T |
| 3 | Hy3 | Tencent | 4.82T |
| 4 | DeepSeek V4 Pro | DeepSeek | 3.28T |
| 5 | GLM 5.2 | Z AI | 2.89T |
| 6 | Nemotron-3 Ultra | NVIDIA | 2.46T |
| 7 | MiniMax M3 | MiniMax | 1.96T |
| 8 | GPT-5.6 Luna | OpenAI | 1.94T |
| 9 | Step 3.7 Flash | StepFun | 1.66T |
| 10 | Kimi K3 | Moonshot AI | 1.42T |

### Provider share (all providers, weekly)

| Provider | Tokens | Share |
| --- | ---: | ---: |
| DeepSeek | 12.41T | 21.9% |
| Xiaomi | 6.90T | 12.2% |
| OpenAI | 5.59T | 9.8% |
| Google | 4.85T | 8.5% |
| Tencent | 4.85T | 8.5% |
| Anthropic | 4.57T | 8.0% |
| Other | 16.99T | 31.1% |

## Data update

The setup script updates `src/snapshot.json` for Remotion and legacy `public/data.js`.
Local renders and CI bundle the updated JSON snapshot without manual synchronization:

```bash
npm run setup   # fetch latest snapshot → src/snapshot.json and public/data.js
npm run check   # TypeScript type check
npm run render
```

- `scripts/setup.mjs` calls `https://openrouter.ai/api/frontend/v1/rankings/models`,
  aggregates the latest-day snapshot per model/provider, and computes the
  API-provided `change` as growth (scaled to percent and clamped to ±150%).
- The setup runs automatically in CI before validate/render; if the fetch fails
  it keeps `src/snapshot.json`; if that snapshot is missing, setup fails.
- `compositions/en.html` / `compositions/zh.html` consume `window.OPENROUTER_RANKINGS_DATA`
  and localize labels at runtime (provider names, date format, insight copy).

## Remotion port

- `src/data.ts` provides typed exports from `src/snapshot.json`; no render-time fetch.
- `src/i18n.ts` unifies the former en/zh fork: `PROVIDER_ZH` map (`zhName`), `fmtDate` per locale (`Aug 15, 2026` vs `2026.08.15`), token units (`T` vs `万亿`), and all scene copy + 4 insight rows per locale.
- `src/OpenrouterRankings.tsx` takes a `locale` prop (`en` | `zh`); `Root.tsx` registers `OpenrouterRankingsEn` + `OpenrouterRankingsZh` (1080x1920 @ 30fps, 1350 frames = 45s) sharing the one component — forked duplication eliminated.
- Frame-driven (no GSAP/DOM): bars x10 (`toFixed(2)` counters, width normalized to top model, 5f stagger), provider donut via SVG `stroke-dasharray` segments + `d-total` counter (`toFixed(1)`), growth rows x5 normalized to fastest riser (`toFixed(1)`), 4 insight rows staggered 8f, 5 scene-dots nav + timeline fill.
- Original HyperFrames files (`compositions/`, `public/`, `scripts/`) stay in place; `npm run setup` refreshes both `src/snapshot.json` and `public/data.js`.
