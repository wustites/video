# TTS 旁白方案

本文档说明本仓库中旁白音频的生成、接入和验证方式。时间轴如何由音频驱动见 [音画同步方案](./AUDIO_VIDEO_SYNC.md)。

## 当前方案

所有带旁白的项目都使用 Microsoft Edge TTS（`edge-tts`，版本固定在根目录 `requirements-voiceover.txt`）在本地或 GitHub Actions 中生成音频，再由 Remotion 渲染：

```text
narration.<lang>.txt（空行分段）
  → Edge TTS 按段生成 MP3
  → ffprobe 测量每段实际时长
  → 合并为最终 MP3，写出时长 / cue 文件
  → src/timing.ts 或 cue 模块推导场景时间轴
  → Remotion <Audio> 播放并按帧渲染
```

生成入口统一为项目的 `npm run voiceover`：

| 方式 | 项目 | 说明 |
| --- | --- | --- |
| 共享脚本 `packages/voiceover/edge_narration.py` | metro_lima、sapporo_subway、japan_economy、brexit_referendum、cloudflare_history、red_army_jp、southern_kurils_jp、imperial_house_law_jp、shandong_universities | 声音、语速、段落数通过命令行参数配置，见 [`packages/voiceover/README.md`](../packages/voiceover/README.md) |
| 项目自带脚本 | solar（四语言 + cue）、saint_petersburg_metro（俄英字幕同步） | 有额外的 cue 或字幕需求 |
| 直接调用 CLI | apple | `edge_tts --file … --write-subtitles` 一次生成 MP3 与 WebVTT |

生成的 MP3 不提交到仓库（见 `.gitignore`），发布时由 `render-release.yml` 重新生成。

## 文件约定

旁白文本和音频统一放在项目的 `public/voiceover/` 目录：

```text
public/voiceover/
├── narration.<lang>.txt        # 提交：旁白文本，空行分段，一段对应一个场景
├── narration.<lang>.mp3        # 生成：最终音频
└── segment-durations.json      # 生成：每段实测时长，供 src/timing.ts 读取
```

Solar 例外：音频名为 `solar-system-<lang>.mp3`，时间数据为 `cues.<lang>.json`。

段落数必须与 `src/timing.ts` 的 `SCENE_IDS` 一致。共享脚本通过 `--expected` 在生成前校验，`@video/core` 的 `buildTimeline` 在渲染前再次校验。

## 环境要求

- Python 3 与 `python3 -m pip install -r requirements-voiceover.txt`
- FFmpeg（含 `ffprobe`）
- 能访问 Edge TTS 服务的网络

## 发布流程中的旁白

`render-release.yml` 在项目定义了 `voiceover` 脚本时自动安装依赖并执行：

- Solar：`npm run voiceover -- --language <variant>`，只生成目标语言（无 variant 时为 `en`）。
- 其他项目：`npm run voiceover`。

工作流随后检查最终 MP4 必须包含音频流。

## 接入 Remotion

使用 `staticFile()` 引用生成的音频，并让 composition 时长覆盖完整旁白和尾部余量：

```tsx
import {Audio, staticFile} from 'remotion';

<Audio src={staticFile('voiceover/narration.ja.mp3')} />
```

注意事项：

- 不要在渲染时 `fetch` 音频或时长数据，时长 JSON 应通过 `import` 打包进 bundle。
- 背景音乐使用单独的 `<Audio>` 并降低 `volume`，保证旁白清晰。
- 重新生成旁白后时长会变化，依赖时长 JSON 推导的项目无需手改；手工维护时间的项目（如 apple）需同步更新场景时间。

## 文本与节奏

建议先确定旁白，再按实际音频时长设计场景和字幕。不要先锁死画面节奏，最后再强行压缩语音。

经验参考：

- 中文：约每秒 4–5 个字。
- 英文：约每秒 2.2–2.8 个词。
- 数据密集、专业名词较多的段落应适当放慢。
- 长句应拆成短句，并用标点提供自然停顿。
- 屏幕文字负责数字和结构，旁白负责解释，不要逐字重复全部屏幕内容。

多语言项目应分别生成音频并独立调整时间轴。不同语言的表达长度不同，不应假设翻译后仍有完全相同的时长。

## 验证流程

每次新增或替换旁白后，在项目目录依次执行：

```bash
npm run voiceover      # 生成音频与时长文件
npm run check          # TypeScript 类型检查
npm run dev            # Remotion Studio 中人工试听
npm run render:draft   # 试渲染
```

人工检查至少包括：

- 语言、声音和文本是否匹配。
- 人名、地名、数字、缩写和专业术语的发音是否正确。
- 开头和结尾是否被截断。
- 场景切换是否与语义停顿一致。
- 字幕是否早于或晚于旁白。
- 背景音乐是否盖住人声。

## 已知限制

- 时间精度为自然段级，不是单词级；适用于场景和整段字幕同步，不适用于口型或逐词高亮。
- Edge TTS 是网络服务，即使客户端版本固定，远端声音仍可能变化；部分网络环境会返回 403。
- 自动校验覆盖段落数、时长和音频流，发音自然度及语义节奏仍需人工验收。

## 历史方案

- Solar 早期曾使用支持 Edge TTS 与 Google Cloud Text-to-Speech（`Chirp3-HD-Aoede`）的自定义脚本，在 2026-06 迁移到 HyperFrames 时删除。
- HyperFrames 时期曾约定用 `hyperframes tts` 生成 WAV 并通过 `<audio data-*>` 接入，已随框架统一到 Remotion 而废弃，见 [ADR 0001](./decisions/0001-remotion-as-primary-framework.md)。

## 安全要求

- 不要将 API Key、访问令牌或云服务凭据提交到仓库。
- 不要把密钥写进源码、旁白文本或 npm script。
- 使用云端供应商时，通过环境变量或仓库外的密钥管理服务传递凭据。
- 发布视频前确认声音模型和素材的许可符合发布渠道要求。
