# Plan: Remotion Video - China Province Birth Population Changes (2000 Years)

## Overview
Create a Remotion video showing an animated bar chart race visualization of birth population changes across Chinese provinces from 0 AD to present.

## Technical Stack
- **Framework**: Remotion (React-based video creation)
- **Language**: TypeScript
- **Visualization**: Custom SVG-based bar chart race
- **Styling**: CSS Modules or Tailwind

## Project Structure
```
population-cn/
├── src/
│   ├── Root.tsx              # Root composition
│   ├── Main.tsx              # Main video component
│   ├── components/
│   │   ├── BarChartRace.tsx  # Main bar chart race component
│   │   ├── ProvinceBar.tsx   # Individual province bar
│   │   ├── YearLabel.tsx     # Year display
│   │   └── Legend.tsx         # Province legend
│   ├── data/
│   │   └── population.ts     # Historical population data
│   ├── utils/
│   │   └── interpolate.ts    # Data interpolation utilities
│   └── styles/
│       └── main.css          # Global styles
├── public/
│   └── china-map.svg         # Optional: China map asset
├── package.json
├── tsconfig.json
└── remotion.config.ts
```

## Implementation Steps

### Step 1: Initialize Remotion Project
- Create new Remotion project with TypeScript template
- Install dependencies: remotion, @remotion/cli, @remotion/bundler

### Step 2: Historical Data Collection
Create `src/data/population.ts` with estimated birth population data:
- **Sources**: Historical records, census data, academic estimates
- **Time periods**: 
  - 0-500 AD: Han Dynasty → Three Kingdoms → Jin Dynasty
  - 500-1000 AD: Sui → Tang → Song Dynasties
  - 1000-1500 AD: Song → Yuan → Ming Dynasties
  - 1500-2000 AD: Ming → Qing → Republic → PRC
- **Provinces**: Modern 31 provinces/regions (data mapped to current boundaries)
- **Data points**: Every 50 years (40 data points total)

### Step 3: Data Interpolation
Create smooth transitions between data points:
- Linear interpolation for intermediate years
- Handle province boundary changes over time

### Step 4: Bar Chart Race Component
Build animated visualization:
- Top 10 provinces displayed at any time
- Smooth bar width transitions
- Province name labels
- Year counter animation
- Color coding by region (North/South/East/West)

### Step 5: Video Composition
- **Duration**: 30 seconds (900 frames at 30fps)
- **Resolution**: 1920x1080 (Full HD)
- **Background**: Dark theme for better contrast
- **Title**: Animated title at start
- **Ending**: Final statistics summary

### Step 6: Styling & Polish
- Color palette: Traditional Chinese colors
- Typography: Chinese-friendly fonts
- Transitions: Smooth easing functions
- Legend: Region color explanation

## Data Sources (Estimated)
Historical birth population estimates based on:
1. Chinese historical census records (household registration)
2. Academic research on historical demographics
3. Modern census data (1953, 1964, 1982, 1990, 2000, 2010, 2020)

## GitHub Actions CI/CD

### Workflow: Build & Release on Version Tag
Triggered on: `v*` tags (e.g., `v1.0.0`, `v1.2.3`)

```yaml
# .github/workflows/build.yml
name: Build Video

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npx remotion render src/index.ts MyVideo out/video.mp4
      - uses: actions/upload-artifact@v4
        with:
          name: video
          path: out/video.mp4
```

### Release Workflow (Optional)
Create GitHub Release with built video attached:
```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install && npx remotion render src/index.ts MyVideo out/video.mp4
      - uses: softprops/action-gh-release@v2
        with:
          files: out/video.mp4
```

## Key Considerations
- Province boundaries changed significantly over 2000 years
- Early data is estimated based on historical records
- Modern data uses actual census figures
- Animation speed varies by data density
