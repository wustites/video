# 配乐与音效来源

本文档记录本仓库可用的配乐和音效来源、各自的许可要求，以及把一首曲子接入项目的标准流程。旁白方案见 [TTS 旁白方案](./TTS.md)，音频时钟与音量见 [音画同步方案](./AUDIO_VIDEO_SYNC.md)。

## 原则

- **不用本地模型生成音频**：MusicGen、Lyria 本地生成、Kokoro、Whisper 等默认不用，除非明确要求。配音只用 edge-tts。配乐从下面的曲库里挑现成曲目。
- **不用代码写音乐**（Tone.js、Strudel、numpy 合成等）：做出来没人能试听判断好坏，效果通常不如曲库。
- **曲目入库**：裁切、归一化后的成品文件提交到项目的 `assets/music/`，发布时不联网下载。仓库 `.gitignore` 默认忽略 `*.mp3`，需要为该文件加一条 `!` 例外。
- **每首都登记来源**：在项目 `SOURCES.md` 写曲名、原始链接、截取区间和许可。需要署名的，署名要出现在片尾或发布说明里。
- **许可以官网为准**：下表是 2026 年 10 月的整理结果，用于商业发布前要再到官网确认一次，并核对该曲目是否有单独的限制。

## 配乐来源

| 来源 | 许可 | 署名 | 命令行下载 | 备注 |
| --- | --- | --- | --- | --- |
| [Mixkit](https://mixkit.co/free-stock-music/) | Mixkit Stock Music Free License（Mixkit 自有许可，**不是 CC0**） | 不需要 | 可以：`https://assets.mixkit.co/music/<id>/<id>.mp3` | **在用**（la28_olympics）。曲目页带风格、情绪、时长标签，便于按 BPM 和情绪挑选。部分曲目属于 Restricted License，只限非商业用途，下载前确认。 |
| [Pixabay Music](https://pixabay.com/music/) | Pixabay Content License（**不是 CC0**） | 不需要 | 不行：脚本访问返回 403 / 429，只能在浏览器手动下载 | 不得把曲子当单独文件转售。部分曲目登记了 YouTube Content ID，会被认领、影响变现：发布前看曲目页的 Content ID 标记，并保留登录后下载的许可证书。 |
| [incompetech](https://incompetech.com/music/royalty-free/music.html)（Kevin MacLeod） | CC BY 4.0 | **需要** | 可以 | 署名格式：`曲名 Kevin MacLeod (incompetech.com)`，加上 `Licensed under Creative Commons: By Attribution 4.0 License`。无法署名的场合（如电视广告）要买 Standard License。 |
| [Free Music Archive](https://freemusicarchive.org/) | 每首不同，多为 CC 系列 | 看许可 | 可以 | 逐首查看许可：带 NC（非商业）的不能用于商业发布，带 ND（禁止演绎）的不能裁剪或混音。 |
| HeyGen 曲库 | HeyGen 账号条款 | — | 需要登录 `heygen` CLI | HyperFrames `/media-use` 的默认来源。本机未登录，目前不可用。 |

## 音效来源

| 来源 | 许可 | 署名 | 备注 |
| --- | --- | --- | --- |
| HyperFrames `media-use` 自带音效（`~/.claude/skills/media-use/audio/assets/sfx/`） | Pixabay Content License | 不需要 | whoosh、impact、riser、pop、click 等约 20 个，`manifest.json` 有每个文件的时长和用途。 |
| [Sonniss GameAudioGDC Bundle](https://sonniss.com/gameaudiogdc) | Sonniss 免版税许可 | 不需要 | 每年 GDC 免费发布，可商用、不限项目数；不得用于训练 AI 模型。网站拒绝脚本访问，需手动下载。 |
| [ZapSplat](https://www.zapsplat.com/) | ZapSplat Standard License | 免费账号**需要**署名“ZapSplat”；Premium / Gold 会员不需要 | 库内标为 CC0 的音效任何账号都不用署名。不得单独转发音效文件。 |
| [BBC Sound Effects](https://sound-effects.bbcrewind.co.uk/) | RemArc 许可 | — | **只限个人、教育、研究用途**，不能用于本仓库的发布视频；商用要另外向 BBC 购买授权。 |

## 接入流程

以 `creative_brand/la28_olympics`（纯配乐、按拍点剪辑）为参考：

1. **挑曲**：按影片的情绪和速度挑，不按题材挑（例如“自信、有力、约 128 BPM 的 EDM”）。先下载 3–4 首候选到一个临时目录，用 librosa 估计 BPM，并按小节统计能量，找出前奏、铺垫、鼓点进入（drop）和尾声的位置。
2. **裁切与归一化**：写 `scripts/prepare_music.py`，从曲子的第一拍或最强的段落起截取整数拍（最好是整数小节），末尾淡出 2–3 s，再用 `loudnorm=I=-14:TP=-1.5` 归一化，输出到 `assets/music/`。
3. **拍点表**：同一个脚本把每拍相对影片开头的时间写入 `assets/music/beats.json`。用 librosa 检测到的实际拍点，不要套等间距网格：直线拟合在 30 秒内会漂移 0.1 s 以上。
4. **按拍点搭时间轴**：场景的起止取整数拍（`CUTS`），场景内每个元素的出场写成第几拍（`b(k)`）。全片最大的画面动作放在鼓点进入那一拍。
5. **入库**：给成品文件加 `.gitignore` 例外，在 `SOURCES.md` 登记来源；不要提交原始下载文件。
6. **验证**：渲染后运行 `npx hyperframes audio out/<file>.mp4 --json`，检查有音轨、无削波、无意外静音，响度在 -16 到 -14 LUFS（社交平台）。报告里要写明这些只是测量结果，没有人试听过。

### 与旁白同用

有旁白时旁白是时钟，配乐只做底：音量约 `0.12–0.18`（见 [音画同步方案](./AUDIO_VIDEO_SYNC.md#背景音乐与音效)），在旁白段落间的停顿处换段或加强。没有旁白时音乐就是时钟，配乐音量 `1`，靠归一化控制响度。

### 发布

项目不定义 `voiceover` 脚本时，发布工作流跳过旁白生成，也不强制要求音轨；配乐随仓库提交，CI 直接用它渲染。

## 工具

| 工具 | 用途 |
| --- | --- |
| edge-tts | 旁白（唯一的配音方式，见 [TTS 旁白方案](./TTS.md)） |
| HyperFrames | `npx hyperframes beats` 检测节拍，`npx hyperframes audio` 测量成片，`normalize-audio` 统一响度 |
| librosa（Python） | 节拍检测、按段落统计能量；la28_olympics 的 `prepare_music.py` 依赖它 |
| FFmpeg | 裁切、淡入淡出、`loudnorm` 归一化、`ebur128` 测响度 |
| Tone.js / Strudel | 代码写音乐，见上面的原则，默认不用 |
