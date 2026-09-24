# 圣彼得堡地铁 · Петербургский метрополитен

俄语科普短视频：介绍俄罗斯圣彼得堡地铁（Petersburg Metro / Петербургский метрополитен）。

项目基于 **Remotion**（React + TypeScript）构建，采用 Edge TTS 生成俄语旁白；画面使用纯 SVG 绘制的示意地铁图，并在视频底部烧录**俄语 + 英语双语字幕**。

## 项目信息

- **主题**：圣彼得堡地铁系统
- **语言**：俄语旁白；俄英双语字幕
- **画布**：1080 × 1920 竖屏（正式版 30fps）
- **草稿 composition**：`SaintPetersburgMetroDraft`（15fps，半分辨率预览）
- **时长**：当前约 98 秒（俄语旁白 93.84 秒，结尾保留淡出与余量；随重新生成的旁白自动推导）
- **默认输出**：`out/video.mp4`
- **字幕源**：`public/voiceover/subtitles.ru-en.json`
- **旁白源**：`public/voiceover/narration.ru.txt`

## 内容结构（8 个场景）

| 场景 | 画面重点 | 旁白内容 |
| --- | --- | --- |
| 开场 | Петербургский метрополитен、6/75/131 三项总览 | 地铁规模与网络 |
| 今日网络 | 6 条线、75 座车站、131 km、线路色标 | 第一段线路与城市骨架 |
| 历史 | 1941 → 1955 → 2025 时间轴 | 从战前建设到第六条线 |
| 示意地图 | 六线彩色 SVG 地图、线路生长动画 | 中心换乘节点 |
| 深度 | 地下水位、86 m 深度尺 | 水文地质与 Адмиралтейская |
| 建筑 | 大理石、镶嵌画、灯光三张视觉卡片 | 车站建筑与城市形象 |
| 服务 | 日均约 180 万人次、年客流 680+、支付方式 | 运营规模与无现金支付 |
| 结尾 | «Город под землёй» | 交通、历史与地下城市 |

场景时间轴由俄语旁白分段音频的 `ffprobe` 实测时长驱动，写入 `public/voiceover/segment-durations.json`；重新生成旁白后不需要手工修改场景边界。

## 地图

- 纯 SVG 手绘示意地图，非地理精确：完整可复用地图组件在 `src/SchematicMap.tsx`，正式 composition 使用同一套六线坐标的轻量化绘制层，保证高分辨率渲染稳定
- 六条线采用圣彼得堡地铁常用色标：红、蓝、绿、橙、紫、青
- 显示主要换乘节点和部分代表性车站；线路按场景逐步绘制
- 片尾标注 `СХЕМАТИЧНАЯ КАРТА · NOT TO SCALE`，避免被误认为精确线路图

## 字幕

- `src/BilingualSubtitles.tsx` 读取字幕 JSON，并按旁白场景边界显示字幕
- 俄语字幕对应实际旁白，英语字幕为同步翻译；两者都烧录到画面中
- `scripts/gen_voiceover.py` 同时生成 `public/voiceover/subtitles.ru-en.vtt`，方便后续导入播放器或剪辑软件
- 字幕面板固定在底部安全区，不依赖 CSS 动画或运行时计时器

## 数据口径与来源

视频采用截至 2025 年末的公开资料口径：

- **6 条线、75 座车站、总长约 131 km**：ГУП «Петербургский метрополитен» 官方数据，以及英文/俄文 Wikipedia 的线路汇总
- **1955 年 11 月 15 日开通首段**：官方与历史资料
- **Адмиралтейская 深约 86 m**：公开线路资料；不同资料对井深/轨面深度的测量口径可能略有差异
- **日均约 180 万人次、年客流 680+ 百万**：2024 年公开客流数据；视频画面明确标注数据年份
- 支付方式：«Подорожник»、 бесконтактная банковская карта

来源链接：

- [ГУП «Петербургский метрополитен»](https://metro.spb.ru/)
- [Saint Petersburg Metro — Wikipedia](https://en.wikipedia.org/wiki/Saint_Petersburg_Metro)
- [Петербургский метрополитен — Wikipedia](https://ru.wikipedia.org/wiki/Петербургский_метрополитен)

票价和客流会随年份调整；修改数据时应同步更新 `src/SaintPetersburgMetro.tsx`、旁白文本和字幕 JSON。

## 使用

```bash
# 在仓库根目录安装 workspace 依赖
npm ci

cd geography_transport/saint_petersburg_metro

# 生成俄语旁白、实测时长和双语 VTT
npm run voiceover

# TypeScript 检查
npm run check

# 打开 Remotion Studio
npm run dev

# 草稿渲染（15fps、半分辨率、4 路并发，便于快速检查）
npm run render:draft

# 正式渲染
npm run render
```

`public/voiceover/narration.ru.mp3`、`segment-durations.json` 和 `subtitles.ru-en.vtt` 是生成产物，不提交到 Git。GitHub Actions 会在检查和正式渲染前运行 `npm run voiceover`。

## 旁白

- 文本：`public/voiceover/narration.ru.txt`
- 音频：`public/voiceover/narration.ru.mp3`
- 声音：Edge TTS `ru-RU-SvetlanaNeural`（俄语女声）
- 语速：`-4%`
- 生成命令：`python3 scripts/gen_voiceover.py`（或 `npm run voiceover`）

## 文件结构

```text
geography_transport/saint_petersburg_metro/
├── public/voiceover/
│   ├── narration.ru.txt
│   └── subtitles.ru-en.json
├── scripts/gen_voiceover.py
├── src/
│   ├── BilingualSubtitles.tsx
│   ├── Root.tsx
│   ├── SaintPetersburgMetro.tsx
│   ├── SchematicMap.tsx
│   ├── fonts.ts
│   ├── index.ts
│   └── timing.ts
├── package.json
├── DESIGN.md
├── remotion.config.ts
└── tsconfig.json
```
