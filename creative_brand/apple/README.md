# 苹果 (Apple 风格产品介绍)

以 Apple 官网/发布会视觉风格介绍一颗**水果苹果**的创意竖屏视频。

用 Apple 的产品叙事方式(揭幕、设计、芯片、市场、系列、起源、"One more thing")
讲一颗真实的苹果:它有多大、多重、含多少营养、占全球多少产量、来自哪里。

- 画布:`1080 × 1920` 竖屏
- 语言:中文(zh-CN 旁白)
- 时长:54 秒(旁白实测 52.3s;见 `src/data.ts` 的 `TOTAL_SECONDS` 常量)
- 默认输出:`out/video.mp4`

## 内容结构

| 场景 | 主题 | 要点 |
| --- | --- | --- |
| 1 开场 | 苹果剪影 + `apple` logo | "全新一代 正式发布" |
| 2 揭幕 | 彩虹渐变 `apple` | "苹果,重新定义。" |
| 3 设计 | 机身参数三卡 | 直径 7cm / 重 180g / 7 种配色 |
| 4 芯片 | A1 仿生芯片三卡 | 每 100g:52 kcal / 膳食纤维 2.4g / 维生素 C 4.6mg |
| 5 市场 | 全球产量 | 9,730 万吨,中国占 51%,销量第一的水果 |
| 6 系列 | 三种型号 | 红富士 Pro / 嘎啦 Air / mini 小果 |
| 7 起源 | 天山脚下 | 栽培苹果祖先诞生于中亚,阿拉木图 "苹果之城" |
| 8 结尾 | One more thing | "每天一 apple,医生远离我。" + "Think different." |

## 数据来源

- 2023 年全球苹果产量约 **9,730 万吨**,中国约 **4,960 万吨、占约 51%**:FAOSTAT(联合国粮农组织)2023 数据,经维基百科 Apple "Production" 章节转引。
- 每 100 g 苹果(带皮可食部分)约 **52 kcal、膳食纤维 2.4 g、维生素 C 4.6 mg**;中等苹果约 **182 g、直径 7.6 cm**:USDA FoodData Central 记录 171688 "Apples, raw, with skin"。
- 红富士为中国第一大栽培品种;栽培苹果祖先为新疆野苹果 *Malus sieversii*,中亚天山一带为其起源中心;哈萨克斯坦阿拉木图因盛产苹果得名 "苹果之城"(词源说法在学界有争议,视频中按通行说法呈现)。

> 本视频为创意演示,与 Apple Inc. 无任何关联;"apple"、"A1"、"Pro/Air/mini"、
> "One more thing"、"Think different" 等均为戏仿梗,不构成对任何商标的误导。

## 脚本

```bash
npm run check      # TypeScript 类型检查
npm run dev        # 本地预览(Studio)
npm run voiceover  # 用 Edge TTS 重新生成旁白 MP3 + WebVTT
npm run render     # 渲染 out/video.mp4
```

## 旁白与 TTS

- 旁白文本:`public/voiceover/narration.zh.txt`(提交入库)。
- 逐句时间戳:`public/voiceover/narration.zh.vtt`(Edge TTS WordBoundary,提交入库)。
- 音频:`public/voiceover/narration.zh.mp3`(Edge TTS `zh-CN-XiaoxiaoNeural`,
  不入库,见 `.gitignore`;重生成:`npm run voiceover`,前置 `pip install edge-tts==7.2.7`)。
- 本机网络受限时,Edge TTS 需走代理,例如:
  `python -m edge_tts --voice zh-CN-XiaoxiaoNeural --file public/voiceover/narration.zh.txt
   --write-media public/voiceover/narration.zh.mp3 --proxy http://127.0.0.1:7890`。
- CI(GitHub Actions)可直接访问 Edge TTS,无需代理。

## 时长同步

当前 Remotion 时间轴位于 `src/data.ts`：`TOTAL_SECONDS` 为 54 秒，`SCENES` 定义场景切换点。
重新生成旁白后若时长变化，请根据 MP3 实测时长和 VTT cue 调整场景时间及总时长，并保留结尾余量。
旧 HyperFrames 版的 `index.html` 时间轴需另行维护。

## Remotion 移植

HyperFrames 版(`index.html`)之外,本目录同时提供 Remotion 版(`src/`)。
原文件保留不动;Remotion 版按相同 54s / 8 场景时间轴重放。

```bash
npm run dev            # Remotion Studio 预览
npm run check          # tsc --noEmit
npm run voiceover      # 同 HyperFrames 版,重新生成旁白 MP3 + WebVTT
npm run render         # 渲染 Apple 成片到 out/video.mp4
npm run render:draft   # 预览渲染到 out/preview.mp4，仅更改输出路径与日志级别
```

### VTT → Sequence 映射

`src/data.ts` 的 `SCENES` 表由 `index.html` 顶部 `SCENES` 数组逐项移植
(秒,相邻场景重叠 0.5s 交叉淡入淡出);`cues` 列为该场景覆盖的
`public/voiceover/narration.zh.vtt` 句子编号(共 20 句),与原版注释一致:

| 场景 | 时间(秒) | VTT 句子 | 句子时间 |
| --- | --- | --- | --- |
| intro 开场 | 0.0–5.0 | 1–2 | 0.1–4.4s |
| reveal 揭幕 | 4.4–8.5 | 3 | 4.44–7.86s |
| design 设计 | 8.0–14.6 | 4–5 | 7.86–14.28s |
| chip 芯片 | 14.2–25.3 | 6–9 | 14.28–24.84s |
| market 市场 | 24.8–34.0 | 10–12 | 24.84–33.73s |
| lineup 系列 | 33.7–42.0 | 13–15 | 33.73–41.48s |
| origin 起源 | 41.5–47.5 | 16–17 | 41.48–46.45s |
| outro 结尾 | 47.0–54.0 | 18–20 | 46.45–52.21s |

### HyperFrames → Remotion 对应关系

| 原版 | Remotion 版 |
| --- | --- |
| `SCENES` 表 + `sceneOpacity`/`applyScene`(含 `display:none` 切换) | 每场景一个 `<Sequence>` + `SceneShell`(0.4s 淡入/尾 0.5s 淡出,透明度为 0 时返回 `null`) |
| `tl.from` 入场(`at` 绝对秒) | `easeAt(t, at-start, dur)` → `interpolate` + `Easing.out(Easing.cube)`(对应 `power3.out`),`stagger` 展开为按索引递增的 `at` |
| `back.out(1.6)`(origin 引言章) | `spring({damping: 12})` 缩放回弹 |
| `#market-bar-fill` width tween(0% → 51%) | `interpolate(t, [3.5, 5.1], [0, 51])` → `width: %` |
| `#outro-line` scaleX tween | `interpolate(t, [1.0, 1.9], [0, 1])` → `scaleX` |
| `#outro-think` letterSpacing tween | `interpolate(t, [3.9, 4.9], [18, 3])` → `letterSpacing` |
| 内联 apple 剪影 SVG | `AppleMark` JSX 组件 |
| `@font-face` Noto Sans SC 可变字体 | `@remotion/google-fonts/NotoSansSC` + `Root` 字体门控 |
| 单条 `<audio>` 旁白 MP3 | 单个 `<Audio staticFile("voiceover/narration.zh.mp3")>`(无运行时 fetch,渲染时需 MP3 已生成) |
