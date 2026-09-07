# population-cn

HyperFrames 视频：中国各省出生人口变化 (2000-2023)

## 使用

```bash
# 检查 composition
npm run check

# 启动预览
npm run dev

# 渲染视频
npm run render
```

## GitHub Actions

推送 `v*-population-cn` Tag 自动构建并发布：

```bash
git tag v1.0.0-population-cn
git push origin v1.0.0-population-cn
```

## Remotion 端口

与 HyperFrames 原版并列的 Remotion 实现（`src/` + `remotion.config.ts`），竖屏 1080x1920@30fps，40 秒（1200 帧）。

- `src/data.ts`：静态人口数据（2000/2005/2010/2015/2020/2023，31 省）+ `regionColors` + `TOP_N=15`，
  `interpolateData()` 与原版逐行一致的纯函数：按帧年份线性插值、round、重排取前 15。
- `src/PopulationCn.tsx`：`frame → 年份 = interpolate(0, 1200f, 2000, 2023)`，
  31 行全量池绝对定位（`top = rank*76`，宽 `=(b/max)*550px`），非前 15 行隐藏；年份显示取 floor。
- 无音频：原版 GSAP 时间线同样未接线，`public/README-AUDIO.txt` 仅为 bgm 占位；
  背景音乐可作为未来可选 `Audio` 接入，目前保持静音。
