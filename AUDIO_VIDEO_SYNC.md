# 音画同步方案

本文档定义本仓库中旁白、字幕、画面、动画和背景音乐的时间同步方式。TTS 的生成与声音选择见 [TTS 旁白方案](./TTS.md)。

## 核心原则

旁白类视频采用“音频主时钟”方案：最终旁白音频确定后，以它的实际时间戳驱动字幕、场景和动画。

```text
最终旁白音频
    ↓ 转写或人工标注
句段/词级时间戳
    ├── 字幕出现与消失
    ├── 场景切换
    ├── 重点元素入场
    └── 图表、数字和镜头变化
```

以下内容不得成为独立时钟：

- `setTimeout`、`setInterval` 或 `Date.now()`。
- JavaScript 中手动调用 `audio.play()`、`pause()` 或修改 `currentTime`。
- 与 composition 时间轴分离运行的 CSS animation。
- 根据预估语速写死、但未用最终音频验证的时间点。

## 当前仓库实现

本仓库同时包含 Remotion 和 HyperFrames 项目。两者都遵循“最终音频优先”，但时间轴的实现方式不同：

| 项目 | 框架 | 当前同步机制 |
| --- | --- | --- |
| `metro_lima` | Remotion | TTS 分段时长由 `ffprobe` 测量，写入 `segment-durations.json`，场景起止时间自动累加。 |
| `sapporo_subway` | Remotion | 与 Metro Lima 相同，旁白段落与场景按顺序一一对应。 |
| `cloudflare_history` | Remotion | 使用 `src/timing.ts` 中维护的场景时间数组；旁白脚本会生成分段时长，但当前场景时间仍需人工维护。 |
| `japan_economy` | Remotion | 与 Metro Lima 相同：旁白段落实测时长驱动场景起止与总时长。 |
| `solar` | HyperFrames | 生成 MP3 后用 `ffprobe` 测量实际时长，生成 cue JSON/JS，并更新 composition 与音频时长。 |
| `apple` | HyperFrames | 使用已生成的 MP3、VTT 和 HTML 中的静态 cue 时间。 |
| `kakeya_conjecture` | HyperFrames | 当前没有音频轨道，只有 42 秒视觉时间轴。 |

### Remotion 时间轴

Remotion 以帧作为唯一运行时钟：

```ts
const seconds = frame / fps;
```

场景、淡入淡出和元素入场都通过 `useCurrentFrame()` 转换为秒数计算。Metro Lima 和 Sapporo Subway 的旁白脚本会执行以下流程：

```text
段落文本
  → Edge TTS 生成分段 MP3
  → ffprobe 测量每段实际时长
  → 合并最终 MP3
  → 写入 segment-durations.json
  → timing.ts 累加场景起止时间
  → Remotion 按帧渲染
```

旁白段落数与场景数不一致时，TypeScript 模块会直接抛错，阻止错误渲染。旁白结束后还会保留尾部淡出和余量，避免音频被截断。

### HyperFrames 时间轴

HyperFrames 使用 HTML 媒体轨道和 GSAP 时间轴：

- `<audio>` 使用 `data-start`、`data-duration`、`data-track-index` 接入；
- GSAP 时间轴以 `paused: true` 创建，并注册到 `window.__timelines`；
- HyperFrames 统一负责播放器 seek、音频时间和 GSAP 时间轴；
- 不使用 `setTimeout`、`audio.play()`、`audio.pause()` 或手动修改 `currentTime` 驱动同步。

Solar 是当前自动化程度最高的 HyperFrames 项目。`scripts/generate_voiceover.py` 会根据最终音频写出 cue，`scripts/validate_sync.py` 再比较 MP3 的 `ffprobe` 时长、cue 边界、HTML 音频时长和 composition 尾部余量。

### 通用 Action 流程

普通项目统一使用 `.github/workflows/render-release.yml`：

```text
解析 <project_key>-<semver>[-<variant>]
  → 精确定位同名项目目录
  → npm ci
  → 生成旁白（如果项目定义 voiceover）
  → npm run check
  → npm run render 或 npm run render:<variant>
  → ffprobe 校验 MP4 视频流
  → 上传 GitHub Release
```

例如 `solar-1.0.0-zh` 会定位到 `solar/`，并执行 `npm run render:zh`。生成的 MP3、`segment-durations.json` 和 `out/` 文件不提交 Git；Solar 的 cue JS/JSON 是同步数据文件，由旁白生成脚本在构建时更新。

当前通用 Action 只强制检查最终 MP4 是否包含视频流，还没有把“必须包含音频流”作为所有项目的统一门槛。没有音频的 Kakeya Conjecture 因此使用纯视觉时间轴；有旁白的项目仍由各自的 `check` 或专用同步校验负责音频验证。

## 向统一旁白同步机制迁移

其他项目可以迁移到与 Solar 相同的“实际音频时长驱动”机制，但应统一数据协议，而不是强行复用 Remotion 和 HyperFrames 的同一套运行时代码。

### 推荐的统一协议

所有带旁白的项目应遵循以下流程：

```text
旁白段落文本
  → 按段生成 TTS 音频
  → 使用 ffprobe 测量每段实际时长
  → 生成 cues.json（start / end / text / scene）
  → 由框架读取 cues 驱动画面和字幕
  → check-sync 校验音频、cue 和 composition 时长
  → 渲染并校验最终 MP4
```

建议的 cue 数据至少包含：

```json
{
  "id": "intro",
  "start": 0.0,
  "end": 4.8,
  "text": "旁白文本",
  "scene": "intro"
}
```

Remotion 通过 `useCurrentFrame()` 将帧转换为秒数读取 cue；HyperFrames 则通过 `<audio>` 的媒体轨道和暂停的 GSAP 时间轴读取同一份时间数据。

### 项目迁移状态

| 项目 | 迁移难度 | 下一步 |
| --- | --- | --- |
| `metro_lima` | 低 | 已按段测量音频时长，只需抽取为统一 cue manifest。 |
| `sapporo_subway` | 低 | 已按段测量音频时长，只需抽取为统一 cue manifest。 |
| `cloudflare_history` | 低 | 已生成分段时长，但需把 `src/timing.ts` 的手工场景时间改为读取 manifest。 |
| `apple` | 中 | 将现有 WebVTT 逐句时间戳转换为统一 cue manifest。 |
| `japan_economy` | 低 | 已按段测量音频时长并驱动场景时间轴，只需抽取为统一 cue manifest。 |
| `ai_model_rankings` | 中 | 先增加旁白和段落 cue。 |
| `openrouter_rankings` | 中 | 先增加旁白和段落 cue。 |
| `population_cn` | 中 | 当前只有背景音乐说明，需要先定义旁白或保持纯视觉模式。 |
| `qs_universities` | 中 | 先增加旁白和段落 cue。 |
| `top500` | 中 | 先增加旁白和段落 cue。 |
| `kakeya_conjecture` | 不适用 | 当前没有音频，保持 42 秒纯视觉时间轴；除非新增旁白。 |

### Variant 与旁白生成

通用 Action 已支持 `<project>-<version>-<variant>`，例如：

```text
solar-1.0.0-zh
  → project = solar
  → variant = zh
  → npm run render:zh
```

为了让旁白生成也只处理目标变体，带多语言的项目应支持：

```bash
npm run voiceover -- --language zh
```

通用 Action 随后将 Tag 中的 variant 传给 `voiceover` 和 `render:<variant>`。当前 Action 已按 variant 选择渲染脚本，但仍会调用项目默认的 `npm run voiceover`；Solar 的 variant 构建因此仍可能先生成全部语言，这是后续统一时需要消除的差异。

HyperFrames 播放器负责统一 seek 媒体与 GSAP 时间轴。所有同步事件都使用相对于 composition 开头的秒数表示。

## 同步精度

同步分为三层：

| 层级 | 用途 | 建议精度 |
| --- | --- | ---: |
| 段落级 | 场景、镜头、主题切换 | 句子或语义段边界 |
| 词组级 | 常规字幕 | 3–6 个词或一个短语 |
| 单词级 | 卡拉 OK、逐词高亮、数字强调 | 转写的词级时间戳 |

普通科普、榜单和数据视频优先使用段落级画面同步与词组级字幕。只有确实需要逐词强调时才使用单词级动画，避免时间轴过度复杂。

30 fps 下，一帧约为 `0.0333` 秒。人工同步通常控制在 2–3 帧以内；口型同步类内容需要更严格的专用流程，不属于本文档范围。

## 标准工作流

### 1. 锁定最终旁白

先完成旁白文本审校和 TTS 生成。确认语言、声音、语速、停顿和专业词发音后，将音频视为时间基准。

旁白发生以下任何变化时，必须重新同步：

- 修改文本。
- 更换声音模型。
- 调整语速或停顿。
- 剪掉音频头尾静音。
- 更换音频编码后导致实际时长变化。

### 2. 获取时间戳

使用最终音频生成转写结果：

```bash
npx --yes hyperframes@0.6.112 transcribe \
  public/voiceover/narration.zh.wav \
  --model small \
  --language zh
```

英语可明确使用英语模型：

```bash
npx --yes hyperframes@0.6.112 transcribe \
  public/voiceover/narration.en.wav \
  --model small.en \
  --language en
```

非英语音频不要使用 `.en` 模型，否则可能被翻译成英语而不是按原语言转写。语言未知时使用 `--model small`，不传 `--language`，让模型自动识别。

自动转写后必须人工核对人名、地名、数字、缩写和句段边界。

### 3. 建立统一时间数据

旁白、字幕和画面应共享同一份时间数据，不要在多个数组中重复维护相同时间点。

推荐结构：

```js
const cues = [
  {
    id: "intro",
    start: 0.20,
    end: 4.80,
    text: "从太阳开始，我们开启一段太阳系之旅。",
    scene: "sun",
    emphasis: []
  },
  {
    id: "mercury",
    start: 4.80,
    end: 12.40,
    text: "最靠近太阳的是水星。",
    scene: "mercury",
    emphasis: ["水星"]
  }
];
```

数据约束：

- `start >= 0`。
- `end > start`。
- 所有 cue 按 `start` 递增排列。
- 常规字幕同一时刻只显示一组，不应相互重叠。
- 最后一个 cue 的 `end` 不得超过 composition 总时长。
- 画面切换可以略早于关键词，但必须通过预览确认符合语义。

### 4. 接入音频轨道

音频使用独立 `<audio>` 元素：

```html
<audio
  id="voiceover"
  src="../public/voiceover/narration.zh.wav"
  data-start="0"
  data-duration="90"
  data-track-index="2"
  data-volume="1"
></audio>
```

视频素材必须静音，并将原视频中的声音作为独立音轨接入：

```html
<video
  id="source-video"
  src="../public/video/source.mp4"
  data-start="0"
  data-duration="30"
  data-track-index="0"
  muted
  playsinline
></video>

<audio
  id="source-audio"
  src="../public/video/source.mp4"
  data-start="0"
  data-duration="30"
  data-track-index="2"
  data-volume="1"
></audio>
```

使用素材片段中间部分时，视频与对应音频必须使用相同的 `data-start`、`data-duration` 和 `data-media-start`。

```html
data-start="12"
data-duration="8"
data-media-start="35.5"
```

`data-track-index` 管理时间轨道冲突，不决定视觉层级；视觉层级使用 CSS `z-index`。

### 5. 驱动画面与字幕

GSAP 时间轴必须暂停创建，并注册给 HyperFrames：

```js
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });

cues.forEach((cue, index) => {
  const caption = document.getElementById(`caption-${index}`);

  tl.from(
    caption,
    { opacity: 0, y: 24, duration: 0.25, ease: "power3.out" },
    cue.start
  );

  tl.to(
    caption,
    { opacity: 0, scale: 0.96, duration: 0.12, ease: "power2.in" },
    cue.end - 0.12
  );

  tl.set(caption, { opacity: 0, visibility: "hidden" }, cue.end);
});

window.__timelines["composition-id"] = tl;
```

字幕结束后必须有确定性的隐藏操作，防止 seek 或渲染时残留。每次只显示一组常规字幕。

不要异步创建时间轴，也不要用 `onStart` 临时替换同一个 DOM 节点的文字作为唯一实现。为每组字幕预先创建独立元素更容易 seek、检查和保证退出状态。

### 6. 对齐场景和强调动画

视觉事件建议相对 cue 时间表达：

```js
tl.from("#planet-mercury", {
  opacity: 0,
  scale: 0.88,
  duration: 0.6,
  ease: "expo.out"
}, cues[1].start - 0.15);

tl.from("#mercury-label", {
  opacity: 0,
  y: 30,
  duration: 0.4,
  ease: "back.out(1.4)"
}, cues[1].start + 0.10);
```

常用偏移参考：

- 新场景可在对应句子前 `0.10–0.25` 秒开始，让观众先获得视觉上下文。
- 标题和关键词通常在说到该词时或提前不超过 `0.10` 秒出现。
- 数据计数动画应在旁白说完数值前完成，避免观众同时追逐两个不同值。
- 转场应落在自然停顿或语义边界，不要切在一个词的中间。

偏移只是起点，最终以人工试听为准。

## 字幕分组

字幕根据语气和内容分组：

- 高能短视频：每组 2–3 个词。
- 日常讲述：每组 3–5 个词。
- 平稳科普：每组 4–6 个词或一个短句。
- 遇到句号、问号、明显语义边界或超过 150 ms 的停顿时优先断组。

竖屏视频的字幕通常放在下方中部，距离底边约 `600–700px`，避免遮挡主体和平台 UI。字幕容器应留出缩放和发光效果空间，不要用 `overflow: hidden` 裁切强调词。

动态文本可使用 HyperFrames 的文字适配工具：

```js
const fit = window.__hyperframes.fitTextFontSize(cue.text, {
  maxWidth: 900,
  baseFontSize: 64,
  minFontSize: 42,
  fontFamily: "Noto Sans SC",
  fontWeight: 700
});
```

## 背景音乐与音效

旁白、背景音乐和音效应分轨管理：

| 轨道示例 | 内容 | 音量建议 |
| --- | --- | ---: |
| 2 | 旁白 | `1` |
| 3 | 背景音乐 | `0.12–0.25` |
| 4 | 音效 | 根据素材调整 |

音量值只是起点。最终应在渲染后的成片中试听，确认手机扬声器和耳机下旁白都清晰。若需要自动 ducking，应先离线处理出混音文件，或将音乐拆成可控片段；不要在渲染时依赖实时音频分析。

关键音效应绑定到确定的视觉事件时间，例如按钮落下、数字完成或转场开始，而不是由浏览器事件临时触发。

## Composition 时长

根 composition 的 `data-duration` 是最终时长来源，优先级高于 GSAP 时间轴长度。

总时长应满足：

```text
composition duration >= 最后一个音频结束时间 + 结尾安全余量
```

建议预留 `0.2–0.5` 秒结尾余量，避免尾音被截断。不要创建空 tween 来撑长时间轴。

如果需要裁切媒体，使用 `data-media-start` 和 `data-duration`，不要修改媒体播放进度。

## 验证流程

### 结构检查

在项目目录执行：

```bash
npm run check
npx --yes hyperframes@0.6.112 lint --verbose
npx --yes hyperframes@0.6.112 compositions
```

重点修复：

- 缺少 `data-track-index`。
- 同一轨道片段重叠。
- 时间轴未注册。
- composition 时长小于媒体时长。
- 音频路径不存在。

### 时间点检查

使用 cue 的开始、结束和场景切换时间进行定点检查：

```bash
npx --yes hyperframes@0.6.112 inspect \
  --at 0.2,4.8,12.4,20.1
```

字幕密集的项目再执行：

```bash
npx --yes hyperframes@0.6.112 inspect --samples 15
```

### Studio 试听

```bash
npm run dev
```

至少检查：

- 从头播放是否同步。
- 跳转到中间和结尾后是否仍同步。
- 暂停再继续是否同步。
- 字幕是否在对应语音开始时进入、结束后彻底消失。
- 场景和关键词是否匹配。
- 最后一个字和尾音是否完整。

seek 后仍然正确是必要条件。只从头播放正常，通常说明实现依赖了 `onStart`、异步回调或未重置状态。

### 试渲染

```bash
npx --yes hyperframes@0.6.112 render \
  --quality draft \
  --output out/av-sync-preview.mp4
```

最终检查必须基于渲染文件，而不只是在 Studio 中试听。逐段检查开头、中段、结尾，并重点查看长视频后半段是否产生累计漂移。

## 常见问题

### 整段固定提前或延后

表现：从开头到结尾偏差基本一致。

处理：统一调整 `<audio data-start>` 或全部 cue 的基准偏移。不要逐条修改 cue 来补偿同一个全局误差。

### 越到后面偏差越大

表现：开头同步，后半段逐渐漂移。

常见原因：

- cue 来自旧版音频。
- 音频被重新编码、变速或裁切。
- 画面按预估总时长平均分段。
- 媒体使用了不一致的 `data-media-start`。

处理：以最终音频重新转写和标注，不要用线性拉伸所有时间点掩盖局部节奏变化。

### 从头正常，seek 后错误

常见原因：

- 依赖 `onStart` 更新文本或状态。
- 使用 `setTimeout`、Promise 或异步创建时间轴。
- 字幕退出后没有确定性隐藏。
- 手动控制媒体播放。

处理：让每个画面状态都能由当前 timeline 时间唯一确定，字幕组结束时使用 `tl.set` 强制隐藏。

### 字幕重叠或残留

处理：检查 cue 是否重叠，并确保每组字幕在 `end` 时间执行 hard kill。常规字幕在任意时刻只能有一组可见。

### 尾音被截断

处理：测量最终音频真实时长，增加 composition 时长和 `0.2–0.5` 秒结尾余量，检查 `<audio data-duration>` 是否过短。

## Solar 项目当前状态

Solar 已采用自然段级音频主时钟：

1. `scripts/generate_voiceover.py` 将每种语言的 11 个自然段分别交给 Edge TTS。
2. FFmpeg 按顺序合并分段 MP3，并以每段实际时长生成 `cues.<lang>.js/json`。
3. `public/solar-composition.js` 使用同一组 cue 驱动字幕、星球名称和 Three.js segment。
4. 每组字幕有独立 DOM 元素，在 cue 结束时确定性隐藏，seek 不依赖 `onStart` 改写文本。
5. 音轨时长等于最终 MP3，composition 时长为音频时长加 0.5 秒。
6. `scripts/validate_sync.py` 校验 cue 数量、时间递增、重叠、音频真实时长和结尾余量。

本次实际生成结果：

| 语言 | Cue | 音频时长 | Composition 时长 |
| --- | ---: | ---: | ---: |
| 英语 | 11 | 74.544 秒 | 75.044 秒 |
| 中文 | 11 | 90.048 秒 | 90.548 秒 |
| 日语 | 11 | 113.136 秒 | 113.636 秒 |
| 韩语 | 11 | 107.568 秒 | 108.068 秒 |

GitHub Actions 支持 tag 和手动触发。单语言 tag（例如 `v1.0.0-solar-zh`）解析出 `zh`，只生成、校验和渲染中文；`v*-solar` 保留全部语言构建。视频和同步诊断使用不同 artifact，只有 tag 构建创建 Release。

当前精度为自然段级。若未来需要逐词高亮或口型同步，应在现有 cue 之上增加词级转写数据，而不是替换段落级场景时间轴。

## 交付检查清单

- [ ] 使用的是最终旁白音频。
- [ ] cue 来自最终音频，并已人工核对。
- [ ] 音频、视频和动画共用 composition 时间轴。
- [ ] 每个媒体元素都有唯一 `id`、`data-start` 和 `data-track-index`。
- [ ] 视频为 `muted playsinline`，声音使用独立 `<audio>`。
- [ ] GSAP timeline 使用 `{ paused: true }` 并正确注册。
- [ ] 没有 `setTimeout`、实时钟或手动媒体播放控制。
- [ ] 每组字幕在结束时间确定性隐藏。
- [ ] 场景切换位于语义边界或自然停顿。
- [ ] composition 覆盖完整音频并保留结尾余量。
- [ ] 从头播放、seek、暂停恢复均保持同步。
- [ ] draft 渲染文件已人工检查开头、中段和结尾。
