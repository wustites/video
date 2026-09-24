# Visual direction

## Palette

- `#070c17` — ink-blue background
- `#f3c969` — warm signal gold for headlines and key figures
- `#e45058`, `#4d9be8`, `#53bf8a`, `#f0a052`, `#a879e8`, `#45c4c7` — the six schematic metro line colors
- `#c8d6e8` / `#8ea4c1` — secondary copy and metadata

## Type

Noto Sans (Cyrillic + Latin subsets) carries both Russian narration and English translation. Russian is the primary display language; English appears as a smaller subtitle layer.

## Composition

- 1080 × 1920 portrait, 30 fps
- 8 scene windows driven by measured Russian narration durations
- Full-height SVG schematic map for the network scene, with a lightweight six-line layer in the main composition for reliable high-resolution rendering
- A depth gauge and geometric motif cards for the geological and architectural beats
- Burned-in bilingual captions in a fixed bottom safe area; no runtime CSS timers

## Motion

All animation is derived from `useCurrentFrame()`: scene fades, eased entrances, and line/station draw progress. The final black fade begins after the last narration segment so the tail is not clipped.
