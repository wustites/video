# HyperFrames 视频制作最佳实践

本文档用于统一本仓库内 HyperFrames 视频项目的工程结构、画布规格、动画实现、数据处理与交付标准。

## 适用范围

本规范适用于竖屏数据可视化、榜单展示和科普叙事类短视频。项目默认面向移动端观看，并按以下优先级做取舍：

1. 信息准确
2. 清晰易读
3. 节奏流畅
4. 渲染稳定
5. 视觉复杂度

## 推荐项目结构

每个视频独立一个目录：

```text
project-name/
  index.html
  meta.json
  package.json
  README.md
  compositions/
    en.html
    zh.html
  public/
    voiceover/
  out/
```

目录约定：

- `index.html` 是默认 composition 入口。
- `compositions/` 用于多语言或多版本 composition。
- `meta.json` 只保存视频 `id`、`name` 等基础元信息。
- `public/` 放字体、音频、图片、脚本等静态资源。
- `out/` 放渲染产物，不要把临时文件混进源码目录。

多语言项目应使用独立 HTML 文件，例如 `compositions/en.html` 和 `compositions/zh.html`，避免在同一个 composition 中堆叠语言判断和排版分支。

## 开发环境

HyperFrames CLI 需要 Node.js 22 或更高版本，并依赖 FFmpeg 和 Chrome。开始开发前运行：

```bash
npx --yes hyperframes@0.6.112 doctor
```

新项目优先通过 CLI 初始化，以获得正确的目录和基础配置：

```bash
npx --yes hyperframes@0.6.112 init project-name
```

不要在仓库根目录安装项目专用依赖。每个项目应能够在自己的目录中独立检查、预览和渲染。

## 版本与脚本

固定 HyperFrames 版本，避免不同机器或不同时间安装到不同版本，导致渲染结果不一致。升级版本时，应同步更新仓库内所有项目并完成回归检查。

推荐 `package.json`：

```json
{
  "scripts": {
    "dev": "npx --yes hyperframes@0.6.112 preview",
    "check": "npx --yes hyperframes@0.6.112 lint",
    "render": "npx --yes hyperframes@0.6.112 render -o out/video.mp4"
  }
}
```

多语言项目：

```json
{
  "scripts": {
    "dev": "npx --yes hyperframes@0.6.112 preview",
    "check": "npx --yes hyperframes@0.6.112 lint",
    "render:en": "npx --yes hyperframes@0.6.112 render -c compositions/en.html -o out/project-en-vertical.mp4",
    "render:zh": "npx --yes hyperframes@0.6.112 render -c compositions/zh.html -o out/project-zh-vertical.mp4"
  }
}
```

## 画布规格

竖屏视频统一使用 `1080 × 1920` 画布。

```html
<html lang="zh" data-resolution="portrait">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=1080, height=1920">
  </head>
  <body>
    <div
      id="root"
      data-composition-id="project-id"
      data-start="0"
      data-duration="45"
      data-width="1080"
      data-height="1920"
    ></div>
  </body>
</html>
```

基础 CSS：

```css
* {
  box-sizing: border-box;
}

html,
body {
  width: 1080px;
  height: 1920px;
  margin: 0;
  overflow: hidden;
}

#root {
  position: relative;
  width: 1080px;
  height: 1920px;
  overflow: hidden;
}
```

安全区建议：

- 左右边距：`56px–72px`
- 顶部边距：`56px–88px`
- 底部边距：`80px–120px`
- 重要文字不要贴近画布边缘
- 底部进度条、来源、字幕之间需要留出清晰间距

## 视觉基线

开始编写 composition 前，应先确定项目的视觉方向。建议在项目目录中维护 `DESIGN.md`，至少包含：

- 色板及各颜色的用途
- 标题、正文和数字字体
- 字号与间距层级
- 动画速度和缓动偏好
- 明确禁止使用的视觉模式

先完成场景的静态“关键画面”，确认所有元素在最完整状态下位置正确，再添加入场动画。内容容器优先使用 Flexbox 或 Grid 组织，绝对定位主要用于背景和装饰元素。

## 时长设计

常见视频时长：

- 数据榜单：`30–45s`
- 科普叙事：`60–90s`
- 单主题观点：`20–30s`

场景节奏：

- 每个场景控制在 `5–8s`
- 开头 `2s` 内必须出现主题和主信息
- 每个场景只讲一个重点
- 少做复杂转场，多做信息推进
- 结尾保留 `1–2s` 的稳定画面，避免内容在最后一帧过快消失

## 动画时间轴

使用 GSAP timeline 统一管理动画。不要使用散落的 `setTimeout`、`setInterval` 或脱离主时间轴的 CSS animation。

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<script>
  window.__timelines = window.__timelines || {};

  const tl = gsap.timeline({ paused: true });
  window.__timelines["project-id"] = tl;

  tl.to("#scene-intro", { opacity: 1, duration: 0.4 })
    .from("#title", { y: 48, opacity: 0, duration: 0.8 }, "<")
    .to("#scene-intro", { opacity: 0, duration: 0.4 }, "+=4");
</script>
```

动画原则：

- 优先动画化 `opacity` 和 `transform`。确需使用 `clip-path` 或尺寸变化时，应先检查渲染性能。
- 避免频繁动画化影响布局的属性，例如复杂 `grid` 结构、动态文本重排。
- 数据图表先出现结构，再出现数值，最后出现解释。
- 排行类动画要按顺序进入，不要所有行同时出现。
- 关键数字和结论要有足够停留时间。

时间轴必须满足以下约定：

- 使用 `gsap.timeline({ paused: true })`，由播放器控制进度。
- 将 timeline 注册到 `window.__timelines[compositionId]`。
- composition 的总时长由 `data-duration` 决定，不依赖 timeline 自身长度。
- 不要异步创建 timeline，也不要使用 `Math.random()`、`Date.now()` 等非确定性逻辑。
- 不要使用 `repeat: -1`；循环次数应根据总时长计算为有限值。
- 视频只负责画面并设置 `muted playsinline`，音频使用独立的 `<audio>` 元素。

每个时间片元素都应提供唯一 `id`、`data-start` 和 `data-track-index`。同一轨道上的时间片不能重叠；视觉层级使用 CSS `z-index`，不要用轨道编号代替。

## 视觉规范

字体建议：

- 中文：`Noto Sans SC`、`PingFang SC`、`Microsoft YaHei`、`Arial`
- 英文：`Inter`、`Arial`、`Helvetica`

字号参考：

- 主标题：`68px–116px`
- 副标题：`28px–42px`
- 榜单名称：`28px–40px`
- 数字指标：`48px–80px`
- 注释和单位：`22px–28px`

布局原则：

- 竖屏优先使用纵向叙事，不要直接照搬横屏仪表盘布局。
- 不要把页面大区域都包成卡片。卡片适合单个指标、榜单项、对比项。
- 固定规格元素要有明确尺寸，例如图表行、图标、进度条、榜单项。
- 文本必须检查换行，中文标题不要出现不自然断句。
- 背景可以有网格、轻纹理或色块，但不要压过数据。

颜色原则：

- 控制主色数量，通常 `1` 个主色、`1` 个强调色、`1` 个风险或对比色足够。
- 数据颜色必须有含义，不要每个元素随机用色。
- 深色背景需要确保小字和单位仍然清晰。
- 红绿对比要谨慎，必要时加入文字标签，避免只靠颜色表达。

## 数据视频规范

数据处理建议在写页面前完成，不要把复杂清洗逻辑塞进动画代码。

榜单类视频：

- 默认展示 Top 10 或 Top 15。
- 行数超过 15 时，竖屏可读性会明显下降。
- 排名、名称、数值、单位必须同时存在。
- 长名称需要截断或手动改写，避免撑破布局。

指标类视频：

- 每个指标必须标明单位。
- 金额、人口、比例、分数等不要混用格式。
- 同一个视频内应统一数值尺度和格式；切换单位时必须明确标注，不能在没有说明的情况下混用 `million`、`billion` 或 `万亿`。
- 来源年份必须清楚，尤其是榜单、排名、人口、收入等会更新的数据。

常见问题：

- 避免重复或冲突的单位组合，例如 `7 千万百万`。
- 避免没有来源的绝对判断。
- 避免屏幕出现过多小字说明。
- 避免在动画过程中改变数值含义或排序口径。

## 音频与旁白

有旁白时，建议按语言拆分文本：

```text
public/voiceover/narration.en.txt
public/voiceover/narration.zh.txt
public/voiceover/narration.ja.txt
public/voiceover/narration.ko.txt
```

旁白节奏：

- 中文：约每秒 `4–5` 个字。
- 英文：约每秒 `2.2–2.8` 个词。
- 数据密集段落要降低语速。
- 屏幕文字不要完整复述旁白。屏幕负责数字和结构，旁白负责解释。

字幕和屏幕文案：

- 字幕不要遮挡主图表。
- 长句拆成短句。
- 同一帧内不要同时出现大段旁白字幕和复杂图表。

## 多语言规范

多语言视频建议：

- 每种语言独立 composition。
- 每种语言单独检查断行、字号和文本长度。
- 不同语言可以共享数据和动画节奏，但不要强行共享同一套排版。
- 中文、日文、韩文通常需要更宽松的行高。
- 英文长词需要检查是否溢出容器。

输出文件名建议：

```text
project-en-vertical.mp4
project-zh-vertical.mp4
project-ja-vertical.mp4
project-ko-vertical.mp4
```

## 性能与稳定性

渲染稳定性优先于复杂效果。

建议：

- 减少超大图片和远程资源依赖。
- 能本地化的资源尽量放在 `public/`。
- 避免视频渲染时依赖实时网络接口。
- Three.js 或 canvas 场景需要先确认首帧和关键帧非空白。
- 大量 DOM 行项目要提前生成，动画时只改变状态。

谨慎使用：

- 复杂滤镜
- 大范围 blur
- 多层透明叠加
- 高频粒子效果
- 每帧重新计算布局的脚本

## 交付前检查清单

### 自动检查

代码检查：

```bash
npm run check
```

布局检查：

```bash
npx --yes hyperframes@0.6.112 inspect --samples 15
```

预览检查：

```bash
npm run dev
```

渲染检查：

```bash
npm run render
```

迭代阶段可先输出低成本预览：

```bash
npx --yes hyperframes@0.6.112 render --quality draft --output out/preview.mp4
```

### 人工检查

- 首帧不是空白。
- 末帧有稳定停留。
- 每个场景都完整出现。
- 标题、榜单、数值没有溢出。
- 单位、年份、来源准确。
- 中文断行自然。
- 背景和前景对比足够。
- 旁白、字幕和画面节奏匹配。
- 输出文件名包含主题、语言和方向。

## 故障排查

### lint 报告轨道重叠

检查同一 `data-track-index` 下各元素的 `data-start` 和 `data-duration`。需要同时出现的元素应放在不同轨道，视觉前后关系再通过 `z-index` 控制。

### 预览正常但渲染缺少动画

确认 timeline 在页面加载时同步创建，并注册到与 `data-composition-id` 对应的键名。不要在 Promise、`setTimeout` 或异步回调内构造时间轴。

### 首帧或关键帧空白

检查首个场景的开始时间和入场延迟。入场前可以保留短暂呼吸时间，但画面不能长时间没有主题信息。Three.js、Canvas 和远程媒体还需要确认资源在捕获时已经可用。

### 字体或资源在不同机器上表现不一致

优先使用项目内资源，并为字体提供可靠的回退字体。最终渲染不要依赖临时链接、实时接口或需要认证的远程资源。

### 文字溢出

使用 `inspect --at` 检查明确的关键帧时间，调整容器宽度、字号、行高或文案长度。只有确认属于刻意设计的动画溢出时，才使用 `data-layout-allow-overflow`。

## 新项目启动模板

新建视频项目时，按以下顺序推进：

1. 明确主题、目标平台、语言和时长。
2. 整理数据源和口径。
3. 写出场景大纲，每个场景只表达一个重点。
4. 确定 `1080 × 1920` 画布和安全区。
5. 搭建静态首屏，确认视觉方向。
6. 补齐所有场景的静态布局。
7. 添加 GSAP timeline。
8. 跑 `npm run check`。
9. 预览检查可读性和节奏。
10. 渲染 MP4 并做最终人工检查。

## 核心原则

在 HyperFrames 视频中，HTML 负责稳定的画布与布局，GSAP 负责可控的时间轴，数据预处理负责准确性，画面只呈现当前叙事所需的信息。
