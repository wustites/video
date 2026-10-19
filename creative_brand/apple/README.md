# 苹果 (Apple 风格产品介绍)

以 Apple 官网/发布会视觉风格介绍一颗**水果苹果**的创意竖屏视频。

用 Apple 的产品叙事方式(揭幕、设计、芯片、市场、系列、起源、"One more thing")
讲一颗真实的苹果:它有多大、多重、含多少营养、占全球多少产量、来自哪里。

- 框架:HyperFrames(HTML + GSAP),入口 `index.html`
- 画布:`1080 × 1920` 竖屏
- 语言:中文(Edge TTS `zh-CN-XiaoxiaoNeural` 旁白)
- 时长:随旁白生成(约 53 秒)
- 默认输出:`out/video.mp4`

## 2.0 改版(2026-10-19)

- 从 Remotion 迁移到 HyperFrames(见 [ADR 0002](../../docs/decisions/0002-free-framework-choice.md))。
- 旁白改为每段对应一个场景,由共享脚本按实测时长写入场景时间,不再依赖 VTT 和手写切换点。
- 场景之间先淡出再淡入,常驻聚光背景,去掉 1.0 版场景交界处 0.4–1.1 秒的黑场,也避免前后标题叠影。
- 新画面:写实红苹果插画与尺寸标注线、A1 芯片图形、数字计数、三色苹果、天山山脉剪影。
- 核对文案:
  - 尺寸改为 USDA 中等苹果的 7.6 cm / 182 g(1.0 版为 7 cm / 180 g);
  - "七种配色"无出处,改为红、黄、绿三大色系;
  - "世界上销量第一的水果,没有之一"不准确(香蕉、西瓜的产量和贸易量都更大),改为"全球产量最高的水果之一"。

## 内容结构

| 场景 | 主题 | 要点 |
| --- | --- | --- |
| 1 开场 | 红苹果 + `apple` | "全新一代 正式发布" |
| 2 揭幕 | 流动彩虹字 `apple` | "苹果,重新定义。" |
| 3 设计 | 尺寸标注 | 直径 7.6 cm / 重 182 g / 红黄绿三大配色 |
| 4 芯片 | A1 仿生芯片 | 每 100g:52 kcal / 膳食纤维 2.4g / 维生素 C 4.6mg |
| 5 市场 | 全球产量 | 9,730 万吨,中国占 51%,全球产量最高的水果之一 |
| 6 系列 | 三种型号 | 红富士 Pro / 嘎啦 Air / mini 小果 |
| 7 起源 | 天山脚下 | 栽培苹果祖先诞生于中亚,阿拉木图 "苹果之城" |
| 8 结尾 | One more thing | "每天一 apple,医生远离我。" + "Think different." |

## 数据来源

- 2023 年全球苹果产量约 **9,730 万吨**,中国约 **4,960 万吨、占约 51%**:FAOSTAT(联合国粮农组织)2023 数据,经维基百科 Apple "Production" 章节转引。
- 每 100 g 苹果(带皮可食部分)约 **52 kcal、膳食纤维 2.4 g、维生素 C 4.6 mg**;中等苹果约 **182 g、直径 7.6 cm**:USDA FoodData Central 记录 171688 "Apples, raw, with skin"。
- 红富士为中国第一大栽培品种;栽培苹果祖先为新疆野苹果 *Malus sieversii*,中亚天山一带为其起源中心;哈萨克斯坦阿拉木图因盛产苹果得名 "苹果之城"(词源说法在学界有争议,视频中按通行说法呈现)。

> 本视频为创意演示,与 Apple Inc. 无任何关联;"apple"、"A1"、"Pro/Air/mini"、
> "One more thing"、"Think different" 等均为戏仿梗,不构成对任何商标的误导。

## 使用

```bash
npm run voiceover      # 生成旁白并同步场景时间(Edge TTS,需 Python、FFmpeg 和网络)
npm run dev            # HyperFrames Studio 预览
npm run check          # hyperframes check(lint、布局、对比度)
npm run render         # 渲染 out/video.mp4
npm run render:draft   # 草稿质量试渲染
```

- 旁白文本:`public/voiceover/narration.zh.txt`,空行分段,一段对应一个场景(共 8 段)。
- `narration.zh.mp3` 与 `segment-durations.json` 是生成产物,不入库;CI 发版时自动生成。
- 场景内元素的入场时间写在 `index.html` 的 `data-in`(相对场景开始的秒数)上;改了旁白文本后,如果句子节奏变化较大,需要相应调整这些值。
