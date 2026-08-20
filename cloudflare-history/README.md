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
| 开场 | CLOUDFLARE · 发展历程 · 从三位创始人到全球网络平台 | 0–11.0s |
| 创立 | 2009 三位创始人（Prince / Zatlyn / Holloway）· 最初构想为「云中的防火墙」· 2010 公开发布 | 11.0–21.4s |
| DDoS 防护 | 2011 LulzSec 事件 · 2013 Spamhaus 相关攻击（峰值 300 Gbps+） | 21.4–33.4s |
| SSL 与使命 | 2014 Project Galileo 为弱势组织提供免费安全服务 · Universal SSL 让 Cloudflare 用户免费启用 HTTPS | 33.4–45.3s |
| Workers | 2017 Cloudflare Workers · 推动边缘计算发展 | 45.3–53.5s |
| 1.1.1.1 | 2018 公共 DNS 上线 · 快、隐私、安全 | 53.5–62.4s |
| 上市 | 2019.9.13 纽交所上市（NYSE: NET）· 发行价 $15/股 | 62.4–70.3s |
| 扩张 | 2022 收购 Area 1 · 2023 Workers AI · 2025 收购 Replicate | 70.3–78.7s |
| 如今 | 335 座城市 · 平均每秒 1.15 亿 HTTP 请求 · 约 25% 网站使用 Cloudflare 反向代理服务 | 78.7–89.7s |

场景时间轴与旁白逐段对齐（实测时长见 `public/voiceover/segment-durations.json`）。

## 数据来源

- Cloudflare 官网（About / Network 页面，2026）
- W3Techs（2026 年 8 月：约 24.7% 网站检测到使用 Cloudflare 反向代理服务）

数据口径说明：视频中「约四分之一的网站」对应 W3Techs 对 Cloudflare 反向代理服务的检测结果，不代表 Cloudflare 对所有这些网站提供相同等级的安全防护；「平均每秒 1.15 亿次 HTTP 请求」「335 座城市」取自 Cloudflare 官方 2026 年公布口径；Spamhaus 事件的 300 Gbps 数据为 Cloudflare 当时引述上游网络提供商的观测结果。

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
- 音频：`public/voiceover/narration.zh.mp3`（89.7s，按段落生成后拼接）
- 声音：Edge TTS `zh-CN-YunjianNeural`（专业男声，+12% 语速）
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
