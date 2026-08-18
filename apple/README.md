# 苹果 (Apple 风格产品介绍)

以 Apple 官网/发布会视觉风格介绍一颗**水果苹果**的创意竖屏视频。

用 Apple 的产品叙事方式(揭幕、设计、芯片、市场、系列、起源、"One more thing")
讲一颗真实的苹果:它有多大、多重、含多少营养、占全球多少产量、来自哪里。

- 画布:`1080 × 1920` 竖屏
- 语言:中文(zh-CN 旁白)
- 时长:54 秒(旁白实测 52.3s;见 `index.html` 顶部 `TOTAL` 常量)
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
npm run check      # lint + validate + inspect(布局与对比度)
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

`index.html` 顶部 `TOTAL`(54s)与 `<audio data-duration="52.3">` 需与旁白 MP3
实测时长一致;场景切换点位于 `SCENES` 数组(秒),已按 `narration.zh.vtt` 的逐句 cue 对齐。
重新生成旁白后若时长变化,请同步更新这两处。
