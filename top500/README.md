# 世界五百强 Remotion 可视化视频

一个中文竖屏数据可视化短片，基于 Remotion 制作，主题为 2025 年《财富》世界500强。

## 使用

```bash
npm run dev
```

渲染视频：

```bash
npm run render
```

输出文件：`out/video.mp4`

## 内容

- 29 秒、1080x1920、30fps
- 中文标题与数据图表
- 前 10 名收入柱状排行
- 国家和地区分布
- 行业结构
- 利润视角与结论页

## 数据说明

榜单口径为 2025 年《财富》世界500强，按 2024 财年收入排名。公司收入、利润和榜单相关指标整理自《财富》/ 财富中文公开榜单页面。

## GitHub Actions 发布

推送 `top500-<semver>` 标签时，Actions 会检查并渲染竖屏 MP4，然后上传构建产物。

发布 Release：

```bash
git tag top500-1.0.0
git push origin top500-1.0.0
```

推送 `top500-<semver>` 标签后，工作流会创建 GitHub Release，并上传 `out/video.mp4`。

## Remotion 移植说明

HyperFrames 原文件（`index.html`）保留在原处，Remotion 移植新增在 `src/` 下：

- `src/data.ts` — 全部硬编码数组（Top 10 公司 x10、国家分布 x8、行业结构 x8、利润榜 x4）与场景帧窗口、计数上限、格式化函数，无运行时请求。
- `src/Top500.tsx` — 6 场景（intro / topbars / country / industry / profit / outro），GSAP clamp 改为 `interpolate()`（含 18 帧场景淡入淡出），50 圆点经 `Array.from({length: 50})` 渲染，国家堆叠条用 flex 宽度，计数器用 `Math.round` 由帧驱动。
- `src/fonts.ts` / `src/Root.tsx` — Noto Sans SC 经 `@remotion/google-fonts` 加载，`delayRender` 门控。
- 29 秒、1080x1920、30fps（870 帧），无音频。
- 背景网格使用了 `mask-image` 渐隐，集成阶段需冒烟测试确认 headless Chromium 渲染正常（否则回退为无 mask 网格）。

```bash
npm run dev
npm run check
npm run render        # out/video.mp4
npm run render:draft  # out/preview.mp4
```
