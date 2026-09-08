# 挂谷猜想：一根针能藏进多小的地方？ (Kakeya Conjecture)

HyperFrames 原作（`index.html`，42s，1920×1080 横屏）+ Remotion 移植（`src/`）。

## Remotion port

- `npm run dev` — Remotion Studio 预览；`npm run check` — `tsc --noEmit`；
  `npm run render` — 渲染 `Kakeya` 到 `out/video.mp4`；
  `npm run render:draft` — 草稿预览到 `out/preview.mp4`。
- Composition `Kakeya`：42s × 30fps = 1260 帧，1920×1080 横屏。
- 5 个场景与原 GSAP 时间轴一一对应（含 8.1 / 16.2 / 33.2s 三处 blur(10px)+scale
  crossfade，以及 24.0–25.15s 的 teal 色圆形 iris wipe）：
  线条生长 per-path `strokeDashoffset` + `interpolate`，index-stagger 按 per-element
  delay 序列展开，有限旋转/挤压窗口（转针 325°、扇形 18°、三角形挤压、tube 图 4°、
  结尾针 12°）均为 clamp 后的有限补间，不使用无限循环。
- 字体经 `@remotion/google-fonts` 加载 Noto Sans SC（300/400/700/900）+
  Noto Serif SC（400/700，公式用），`Root.tsx` 以 `delayRender` 门控等待字体就绪。
- 几何坐标（扇形线、针云、tube 图）收录于 `src/data.ts`；渲染时无 fetch、无 DOM 查询。

**本片保持静默——是否配音是产品决策，移植层不预埋音频。**
