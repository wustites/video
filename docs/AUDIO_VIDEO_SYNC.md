# 音画同步方案

本文档定义本仓库中旁白、字幕、画面、动画和背景音乐的时间同步方式。TTS 的生成与声音选择见 [TTS 旁白方案](./TTS.md)。所有项目均使用 Remotion（见 [ADR 0001](./decisions/0001-remotion-as-primary-framework.md)）。

## 核心原则

旁白类视频采用“音频主时钟”方案：最终旁白音频确定后，以它的实际时长驱动字幕、场景和动画。

```text
最终旁白音频
    ↓ ffprobe 实测分段时长（或转写 / 人工标注）
段落级时间数据
    ├── 场景切换
    ├── 字幕出现与消失
    ├── 重点元素入场
    └── 图表、数字和镜头变化
```

Remotion 以帧作为唯一运行时钟，所有画面状态都必须能由当前帧唯一确定：

```ts
const frame = useCurrentFrame();
const {fps} = useVideoConfig();
const seconds = frame / fps;
```

以下内容不得成为独立时钟：

- `setTimeout`、`setInterval`、`requestAnimationFrame` 或 `Date.now()`。
- 手动调用 `audio.play()`、`pause()` 或修改 `currentTime`。
- 与帧无关的 CSS animation / transition。
- 根据预估语速写死、但未用最终音频验证的时间点。

## 当前仓库实现

| 项目 | 同步机制 |
| --- | --- |
| `metro_lima`、`sapporo_subway`、`japan_economy`、`brexit_referendum`、`shandong_universities` | 旁白按段生成，`segment-durations.json` 记录实测时长；`src/timing.ts` 累加出场景起止和总时长。 |
| `red_army_jp`、`southern_kurils_jp`、`imperial_house_law_jp` | 同上，时间轴由 `@video/core` 的 `createRemotionTimeline` 构建。 |
| `saint_petersburg_metro` | 俄语旁白按段测量时长，场景时间轴与俄英双语字幕共用场景边界。 |
| `cloudflare_history` | `src/timing.ts` 中手工维护的场景时间（参照实测分段时长）；重新生成旁白后需人工核对。 |
| `solar` | `scripts/generate_voiceover.py` 为每种语言写出 `cues.<lang>.json`（cue、音频时长、composition 时长），`src/cues.ts` 读取并换算为帧。 |
| `apple` | `src/data.ts` 中的场景时间，参照 `narration.zh.vtt` 的逐句时间手工对齐。 |
| `ai_model_rankings`、`openrouter_rankings`、`population_cn`、`qs_universities`、`top500`、`kakeya_conjecture` | 无旁白，固定时长的纯视觉时间轴。 |

### 标准流水线

```text
narration.<lang>.txt（空行分段，一段对应一个场景）
  → Edge TTS 生成分段 MP3（packages/voiceover/edge_narration.py）
  → ffprobe 测量每段实际时长
  → 合并最终 MP3
  → 写入 segment-durations.json
  → src/timing.ts 通过 import 读取并累加场景起止时间
  → Remotion 按帧渲染
```

段落数与场景数不一致时会在两处失败：共享脚本的 `--expected` 在生成阶段报错；`buildSequentialTimeline` 在打包阶段抛错，阻止错误渲染。旁白结束后保留尾部余量（`tailSeconds`），避免音频被截断。

新项目应直接使用 `@video/core`：

```ts
import {createRemotionTimeline} from '@video/core';
import durations from '../public/voiceover/segment-durations.json';

export const SCENE_IDS = ['intro', 'history', 'outro'] as const;
export const timeline = createRemotionTimeline(SCENE_IDS, durations, {tailSeconds: 1.5});
// timeline.totalSeconds、timeline.useSceneOpacity(id)、timeline.useEntrance(id, offset)
```

### 发布流程

`.github/workflows/render-release.yml`：

```text
解析 <project_key>-<semver>[-<variant>]
  → 按 projects.json 定位项目目录
  → npm ci
  → 生成旁白（项目定义了 voiceover 时；Solar 只生成 variant 对应语言）
  → npm run check
  → npm run render 或 npm run render:<variant>
  → ffprobe 校验 MP4 视频流；定义了 voiceover 的项目还必须有音频流
  → 上传 GitHub Release
```

生成的 MP3、`segment-durations.json` 和 `out/` 文件不提交 Git，Solar 的 `cues.<lang>.json` 作为同步数据提交并在构建时更新。

## 同步精度

| 层级 | 用途 | 建议精度 |
| --- | --- | ---: |
| 段落级 | 场景、镜头、主题切换 | 句子或语义段边界 |
| 词组级 | 常规字幕 | 3–6 个词或一个短语 |
| 单词级 | 卡拉 OK、逐词高亮、数字强调 | 转写的词级时间戳 |

本仓库目前全部为段落级同步。普通科普、榜单和数据视频优先使用段落级画面同步与词组级字幕；只有确实需要逐词强调时才引入词级数据，并叠加在段落级场景时间轴之上，而不是替换它。

30 fps 下一帧约 `0.0333` 秒。人工同步通常控制在 2–3 帧以内；口型同步不属于本文档范围。

## 标准工作流

### 1. 锁定最终旁白

先完成旁白文本审校和 TTS 生成，确认语言、声音、语速、停顿和专业词发音后，将音频视为时间基准。

以下任何变化都必须重新运行 `npm run voiceover`，手工维护时间的项目还需重新对齐：

- 修改文本或分段。
- 更换声音或调整语速。
- 剪掉音频头尾静音，或重新编码导致时长变化。

### 2. 建立统一时间数据

旁白、字幕和画面共享同一份时间数据，不要在多个数组中重复维护相同时间点。数据通过 `import` 进入 bundle，不要在渲染时 `fetch`。

需要比场景更细的 cue 时（如 Solar），推荐结构：

```json
{
  "id": "mercury",
  "start": 4.80,
  "end": 12.40,
  "text": "最靠近太阳的是水星。",
  "scene": "mercury"
}
```

数据约束：

- `start >= 0`，`end > start`，按 `start` 递增排列。
- 常规字幕同一时刻只显示一组，不应相互重叠。
- 最后一个 cue 的 `end` 不得超过 composition 总时长。

### 3. 接入音频

```tsx
import {Audio, Sequence, staticFile} from 'remotion';

<Audio src={staticFile('voiceover/narration.zh.mp3')} />

// 背景音乐单独一条，降低音量
<Audio src={staticFile('audio/music.mp3')} volume={0.18} />

// 只在某段时间播放音效
<Sequence from={Math.round(12.4 * fps)} durationInFrames={Math.round(1 * fps)}>
  <Audio src={staticFile('sfx/whoosh.mp3')} />
</Sequence>
```

使用视频素材时用 `<OffthreadVideo>`，需要裁切时用 `startFrom` / `endAt`，不要手动控制媒体播放。

### 4. 驱动画面与字幕

每个画面状态都由当前时间计算，进出场用 `interpolate` / `spring`：

```tsx
const t = useCurrentFrame() / fps;
const visible = t >= cue.start && t < cue.end;
const opacity = interpolate(t, [cue.start, cue.start + 0.25, cue.end - 0.12, cue.end], [0, 1, 1, 0], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
if (!visible) return null;
```

字幕在 `end` 之后必须不再渲染（返回 `null` 或透明度为 0），保证跳到任意帧都不会残留。也可以把每组字幕放进 `<Sequence from durationInFrames>`，由 Remotion 管理生命周期。

### 5. 对齐场景和强调动画

视觉事件相对场景或 cue 时间表达，例如 `timeline.useEntrance('mercury', 0.1)`。常用偏移参考：

- 新场景可在对应句子前 `0.10–0.25` 秒开始，让观众先获得视觉上下文。
- 标题和关键词通常在说到该词时或提前不超过 `0.10` 秒出现。
- 数据计数动画应在旁白说完数值前完成。
- 转场应落在自然停顿或语义边界，不要切在一个词的中间。

偏移只是起点，最终以人工试听为准。

## 字幕分组

- 高能短视频：每组 2–3 个词。
- 日常讲述：每组 3–5 个词。
- 平稳科普：每组 4–6 个词或一个短句。
- 遇到句号、问号、明显语义边界或超过 150 ms 的停顿时优先断组。

竖屏视频的字幕通常放在下方中部，距离底边约 `600–700px`，避免遮挡主体和平台 UI。字幕容器应留出缩放和发光效果空间，不要用 `overflow: hidden` 裁切强调词。多语言字幕需确认对应 Noto 字体已加载。

## 背景音乐与音效

| 内容 | 音量建议 |
| --- | ---: |
| 旁白 | `1` |
| 背景音乐 | `0.12–0.25` |
| 音效 | 根据素材调整 |

音量值只是起点，应在渲染后的成片中试听，确认手机扬声器和耳机下旁白都清晰。需要 ducking 时可给 `volume` 传入按帧计算的函数，或离线处理出混音文件；不要依赖实时音频分析。关键音效应绑定到确定的帧，而不是由浏览器事件触发。

## Composition 时长

`<Composition durationInFrames>` 是最终时长来源，应由时间数据推导，不要手填：

```text
durationInFrames = ceil((最后一段音频结束时间 + 结尾余量) × fps)
```

建议预留 `0.2–0.5` 秒以上的结尾余量，避免尾音被截断。

## 验证流程

```bash
npm run voiceover      # 生成音频与时长数据
npm run check          # 类型检查
npm run dev            # Remotion Studio
npm run render:draft   # 试渲染
```

Solar 还可执行 `python3 scripts/validate_sync.py --language <lang>`，校验 cue 数量、时间递增、重叠、音频真实时长和结尾余量。

在 Studio 中至少检查：

- 从头播放、跳到中间和结尾后是否仍同步。
- 字幕是否在对应语音开始时进入、结束后彻底消失。
- 场景和关键词是否匹配。
- 最后一个字和尾音是否完整。

最终检查必须基于渲染文件，而不只是在 Studio 中试听。逐段检查开头、中段、结尾，并重点查看长视频后半段是否产生累计漂移。

## 常见问题

### 整段固定提前或延后

统一调整 `<Audio>` 所在 `<Sequence>` 的 `from`，或全部 cue 的基准偏移；不要逐条修改 cue 来补偿同一个全局误差。

### 越到后面偏差越大

常见原因：时间数据来自旧版音频；音频被重新编码、变速或裁切；画面按预估总时长平均分段；手工时间（如 cloudflare_history、apple）未随旁白更新。处理：重新运行 `npm run voiceover`，以最终音频的实测时长为准，不要线性拉伸所有时间点。

### 从头正常，跳帧后错误

说明某个状态依赖了上一帧或副作用（`useEffect` 中累积状态、`useState` 计数、定时器）。处理：让每个画面状态都只由当前帧和静态数据计算。

### 字幕重叠或残留

检查 cue 是否重叠，并确保字幕在 `end` 之后不再渲染。

### 尾音被截断

确认 composition 时长由实测音频时长推导，并增加结尾余量。

## 交付检查清单

- [ ] 使用的是最终旁白音频，时间数据由它重新生成。
- [ ] 旁白段落数与 `SCENE_IDS` 一致。
- [ ] 时间数据通过 `import` 打包，渲染时没有网络请求。
- [ ] 所有动画只依赖 `useCurrentFrame()`，没有定时器、实时钟或手动媒体控制。
- [ ] 每组字幕在结束时间后不再渲染。
- [ ] 场景切换位于语义边界或自然停顿。
- [ ] `durationInFrames` 覆盖完整音频并保留结尾余量。
- [ ] 从头播放与跳帧均保持同步。
- [ ] draft 渲染文件已人工检查开头、中段和结尾。
