# TTS 旁白方案

本文档说明本仓库中旁白音频的生成、接入、同步和验证方式。

## 当前方案

仓库目前有两种 TTS 使用方式：

1. **Solar 的正式发布链路**：GitHub Actions 从 tag 提取目标语言，使用 Microsoft Edge TTS 生成对应 MP3，再由 HyperFrames 渲染视频；旧式 tag 仍可一次生成全部语言。
2. **新项目和本地制作的推荐方式**：使用 HyperFrames CLI 生成本地 WAV，再接入 composition。

Solar 的 GitHub Actions 是当前唯一已经接入自动发布流程的 TTS 实现。HyperFrames CLI 方案是新项目约定，尚未替换 Solar 的发布工作流。

```text
旁白文本 -> TTS -> 本地音频 -> composition 的独立 audio 轨道 -> 预览与渲染
```

采用本地音频文件有以下好处：

- 渲染过程不依赖实时网络接口。
- 预览与最终渲染使用同一份音频，结果更稳定。
- 音频时长可以在制作字幕和场景时间轴前确定。
- 多语言版本可以分别生成、检查和替换。

环境要求：

- Node.js 22 或更高版本
- FFmpeg
- Chrome 或 Chromium

可先检查环境：

```bash
npx --yes hyperframes@0.6.112 doctor
```

## 文件约定

旁白文本和音频统一放在项目的 `public/voiceover/` 目录：

```text
public/voiceover/
├── narration.en.txt
├── narration.zh.txt
├── narration.ja.txt
├── narration.ko.txt
├── narration.en.wav
├── narration.zh.wav
├── narration.ja.wav
└── narration.ko.wav
```

单语言项目只需保留实际使用的语言。文本和音频使用相同的语言后缀，便于自动化处理和人工核对。

建议提交旁白文本；是否提交生成后的音频由项目决定。如果音频不入库，项目必须提供可复现的生成命令和声音名称。

## Solar GitHub Actions 方案

工作流文件为 `.github/workflows/solar.yml`。支持以下 tag：

| Tag | 输出 |
| --- | --- |
| `v*-solar` | 英、中、日、韩全部语言 |
| `v*-solar-en` | 仅英语 |
| `v*-solar-zh` | 仅中文 |
| `v*-solar-ja` | 仅日语 |
| `v*-solar-ko` | 仅韩语 |

发布中文：

```bash
git tag v1.0.0-solar-zh
git push origin v1.0.0-solar-zh
```

工作流从 `github.ref_name` 提取 `en/zh/ja/ko`；没有语言代码的旧式 tag 使用 `all`。随后安装 Node.js 22、FFmpeg 和固定版本的 `edge-tts`，只生成、校验和渲染目标语言。tag 构建会创建 GitHub Release。通过 `workflow_dispatch` 手动运行时，可以从下拉框选择单语言或全部语言，并且不会创建 Release。

| 语言 | 文本 | 声音 | 输出音频 |
| --- | --- | --- | --- |
| 英语 | `narration.en.txt` | `en-US-AriaNeural` | `solar-system-en.mp3` |
| 中文 | `narration.zh.txt` | `zh-CN-XiaoxiaoNeural` | `solar-system-zh.mp3` |
| 日语 | `narration.ja.txt` | `ja-JP-NanamiNeural` | `solar-system-ja.mp3` |
| 韩语 | `narration.ko.txt` | `ko-KR-SunHiNeural` | `solar-system-ko.mp3` |

视频 artifact 名称包含目标语言和 ref，例如 `solar-system-zh-v1.0.0-solar-zh`。另有保留 14 天的同步诊断 artifact；单语言构建只包含对应 MP3 和 cue JSON。

### 本地复现 Solar TTS

在 `solar/` 目录执行：

```bash
python -m pip install edge-tts==7.2.7
npm run voiceover
npm run check
```

以上命令需要网络连接，与 GitHub Actions 当前命令等价。

### 当前 CI 限制

- 工作流没有传递 `--rate`，因此没有沿用历史配置中的 `-4%` 语速。
- 时间戳精度为自然段级，不是单词级；适用于场景和整段字幕同步，不适用于口型或逐词高亮。
- Edge TTS 是网络服务，即使客户端版本固定，远端声音仍可能发生变化。
- 自动校验负责结构、时长、重叠和 lint，发音自然度及语义节奏仍需人工验收。

## HyperFrames CLI 推荐方案

### 查看可用声音

```bash
npx --yes hyperframes@0.6.112 tts --list
```

声音列表可能随 HyperFrames 版本变化，因此不要仅依赖本文档中的示例名称。生成前应以当前 CLI 返回的列表为准。

### 从文本文件生成

在具体项目目录执行：

```bash
npx --yes hyperframes@0.6.112 tts \
  public/voiceover/narration.zh.txt \
  --voice <voice-name> \
  --output public/voiceover/narration.zh.wav
```

英文示例：

```bash
npx --yes hyperframes@0.6.112 tts \
  public/voiceover/narration.en.txt \
  --voice af_nova \
  --output public/voiceover/narration.en.wav
```

也可以直接传入短文本：

```bash
npx --yes hyperframes@0.6.112 tts \
  "这是一段测试旁白。" \
  --voice <voice-name> \
  --output public/voiceover/test.zh.wav
```

正式项目推荐从文本文件生成，以便审阅、版本管理和多语言维护。

## 接入 composition

音频必须使用独立的 `<audio>` 元素，不要依靠 `<video>` 播放声音，也不要在 JavaScript 中调用 `play()`、`pause()` 或手动 seek。播放与时间同步由 HyperFrames 管理。

```html
<audio
  id="voiceover-zh"
  src="../public/voiceover/narration.zh.wav"
  data-start="0"
  data-duration="90"
  data-track-index="2"
  data-volume="1"
></audio>
```

注意事项：

- `id` 在 composition 内必须唯一。
- `data-start` 表示音频进入总时间轴的时间，单位为秒。
- `data-duration` 应与实际需要播放的时长一致；不要用它掩盖错误的音频长度。
- `data-track-index` 必须填写，同一轨道的时间片段不能重叠。
- `data-volume` 的范围为 `0` 到 `1`，默认为 `1`。
- HTML 在 `compositions/` 下时，通常使用 `../public/...`；根目录 `index.html` 通常使用 `public/...`。以文件实际相对路径为准。

如果 composition 还有背景音乐，应放在另一条音频轨道，并降低背景音乐音量，保证旁白清晰：

```html
<audio
  id="background-music"
  src="../public/audio/music.mp3"
  data-start="0"
  data-duration="90"
  data-track-index="3"
  data-volume="0.18"
></audio>
```

## 文本与节奏

建议先确定旁白，再按实际音频时长设计场景和字幕。不要先锁死画面节奏，最后再强行压缩语音。

经验参考：

- 中文：约每秒 4–5 个字。
- 英文：约每秒 2.2–2.8 个词。
- 数据密集、专业名词较多的段落应适当放慢。
- 长句应拆成短句，并用标点提供自然停顿。
- 屏幕文字负责数字和结构，旁白负责解释，不要逐字重复全部屏幕内容。

多语言项目应分别生成音频并独立调整时间轴。不同语言的表达长度不同，不应假设翻译后仍有完全相同的时长。

## 字幕同步

需要字幕时，可从最终旁白音频生成转写结果：

```bash
npx --yes hyperframes@0.6.112 transcribe \
  public/voiceover/narration.zh.wav \
  --language zh
```

字幕制作应以最终使用的音频为准。修改旁白文本或重新生成声音后，需要重新检查字幕时间。

## 验证流程

每次新增或替换旁白后，依次执行：

```bash
# 1. 检查 composition、轨道和时间轴
npm run check

# 2. 检查字幕、文字和画布溢出
npx --yes hyperframes@0.6.112 inspect --samples 15

# 3. 启动 Studio，人工检查音画同步和发音
npm run dev

# 4. 快速试渲染
npx --yes hyperframes@0.6.112 render \
  --quality draft \
  --output out/tts-preview.mp4
```

人工检查至少包括：

- 语言、声音和文本是否匹配。
- 人名、地名、数字、缩写和专业术语的发音是否正确。
- 开头和结尾是否被截断。
- 场景切换是否与语义停顿一致。
- 字幕是否早于或晚于旁白。
- 背景音乐是否盖住人声。
- composition 总时长是否覆盖完整旁白。

## Solar 项目现状

`solar/` 当前保留了四种语言的旁白文本，composition 仍引用以下 MP3：

```text
public/voiceover/solar-system-en.mp3
public/voiceover/solar-system-zh.mp3
public/voiceover/solar-system-ja.mp3
public/voiceover/solar-system-ko.mp3
```

这些 MP3 不提交到仓库，由 `scripts/generate_voiceover.py` 在本地或 GitHub Actions 中逐段生成并合并。生成过程同时写出四种语言的 cue JS/JSON，并根据实际音频时长更新 composition。

本地预览前执行 `npm run voiceover && npm run check`。旧的 `voiceover:edge`、`voiceover:gcp` 命令仍不存在；当前唯一 Solar 生成入口是 `npm run voiceover`。

## 历史方案

Solar 在迁移到 HyperFrames 前使用过自定义 Python 脚本，支持两种供应商：

- 默认：Microsoft Edge TTS。
- 备选：Google Cloud Text-to-Speech。

历史 Edge TTS 声音为：

| 语言 | 声音 | 语速 |
| --- | --- | ---: |
| 英语 | `en-US-AriaNeural` | `-4%` |
| 中文 | `zh-CN-XiaoxiaoNeural` | `-4%` |
| 日语 | `ja-JP-NanamiNeural` | `-4%` |
| 韩语 | `ko-KR-SunHiNeural` | `-4%` |

Google Cloud 方案使用各语言的 `Chirp3-HD-Aoede` 声音，并从 `GOOGLE_TTS_API_KEY` 或本地密钥文件读取凭据。

自定义脚本和配置已在 HyperFrames 迁移提交中删除。Google Cloud 方案现在仅是历史背景；Edge TTS 则由 GitHub Actions 以直接 CLI 命令继续使用。新项目不应复制已经删除的 npm 命令。

## 安全要求

- 不要将 API Key、访问令牌或云服务凭据提交到仓库。
- 不要把密钥写进 HTML、旁白文本或 npm script。
- 使用云端供应商时，通过环境变量或仓库外的密钥管理服务传递凭据。
- 发布视频前确认声音模型和素材的许可符合发布渠道要求。
