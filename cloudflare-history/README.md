# Cloudflare 发展历程

中文科普短视频：讲述 Cloudflare 从 2009 年创立到 2026 年的发展历程。
基于 **Remotion**（React）构建，旁白使用 **Edge TTS**（微软神经语音）生成。

## 项目信息

- **主题**：Cloudflare 企业发展史（创立 → 成名 → SSL 普及 → 边缘计算 → 上市 → AI 时代）
- **语言**：中文（旁白 + 屏幕文字）
- **时长**：90 秒
- **画布**：1080 × 1920 竖屏（30fps）
- **默认输出**：`out/video.mp4`

## 内容结构（9 个场景）

| 场景 | 内容 | 旁白时段 |
| --- | --- | --- |
| 开场 | CLOUDFLARE · 发展历程 · 从三个人到互联网的守护者 | 0–9.7s |
| 创立 | 2009 三位创始人（Prince / Zatlyn / Holloway）· 名字意为「云中的防火墙」· 2010 亮相 TechCrunch Disrupt | 9.7–19.4s |
| 成名 | 2011 一战成名 · 2013 抵御当时全球最大攻击（峰值 300 Gbps+） | 19.4–29.7s |
| SSL 与使命 | 2014 Project Galileo 免费保护记者与艺术家 · Universal SSL 让全网免费加密 | 29.7–40.5s |
| Workers | 2017 Cloudflare Workers · 边缘计算时代开启 | 40.5–48.9s |
| 1.1.1.1 | 2018 公共 DNS 上线 · 快、隐私、安全 | 48.9–57.7s |
| 上市 | 2019.9.13 纽交所上市（NYSE: NET）· 发行价 $15/股 | 57.7–68.2s |
| 扩张 | 2022 收购 Area 1 · 2023 Workers AI · 2025 收购 Replicate | 68.2–76.9s |
| 如今 | 335+ 城市 · 每秒 1.15 亿请求 · 守护全球 21% 网站 · 故事仍在继续 | 76.9–87.4s |

场景时间轴与旁白逐段对齐（实测时长见 `public/voiceover/segment-durations.json`）。

## 数据来源

- Cloudflare 官网（About / Network 页面，2026）
- Wikipedia（Cloudflare 词条，2026）
- W3Techs（2026 年 1 月：约 21.3% 网站使用 Cloudflare）

数据口径说明：视频中「全球约两成网站」对应 W3Techs 统计的约 21% 网站份额；「每秒 1.15 亿次请求」「335+ 城市」取自 Cloudflare 官方公布口径（2026）；Spamhaus 事件为 2013 年当时全球规模最大的 DDoS 攻击（峰值超 300 Gbps）。

## 使用

```bash
npm run check          # tsc 类型检查
npm run dev            # 启动 Remotion Studio 本地预览
npm run voiceover      # 重新生成旁白音频（Edge TTS，需网络）
npm run render:draft   # 草稿质量试渲染
npm run render         # 正式渲染到 out/video.mp4
```

## 旁白

- 文本：`public/voiceover/narration.zh.txt`
- 音频：`public/voiceover/narration.zh.mp3`（87.4s，按段落生成后拼接）
- 声音：Edge TTS `zh-CN-YunjianNeural`（专业男声，+8% 语速）
- 生成命令：`python3 scripts/gen_voiceover.py`（或 `npm run voiceover`）

## 文件结构

```text
cloudflare-history/
  src/                      # Remotion composition（TSX）
    index.ts                # registerRoot 入口
    Root.tsx                # Composition 注册
    CloudflareHistory.tsx   # 主 composition（9 场景）
    timing.ts               # 场景时间轴与动画工具
  scripts/
    gen_voiceover.py        # Edge TTS 旁白生成 + 拼接
  public/
    voiceover/              # 旁白文本、音频与实测时长
  out/video.mp4             # 渲染产物（不入库）
```