# 深圳 APEC 2026 宣传片 (shenzhen_apec)

HyperFrames（HTML + GSAP）制作的竖屏 (1080×1920) 宣传片，介绍 2026 年 11 月 18—19 日在深圳举行的亚太经合组织（APEC）第三十三次领导人非正式会议。两个版本（variant）：

- `en`：英文旁白（Edge TTS `en-US-AndrewNeural`），英文字幕在上；
- `zh`：中文旁白，声音为 [~/tts](https://github.com/ZeroMarker/tts) 克隆的 `chen_hongli`（Qwen3-TTS，AI 合成），中文字幕在上。

- 7 段旁白驱动场景时间轴：`sync_hyperframes_timing.mjs` 写入各场景 `data-start` / `data-duration`。
- 字幕源文件 `public/voiceover/cues.json`：每段若干 `[英文, 中文]`，英文按顺序拼接必须等于 `narration.en.txt` 对应段落。`scripts/build_subtitles.mjs` 用 Edge TTS WordBoundary（`word-marks.json`）计算每条字幕的起止时间，写入 `index.html` 的 `CUES` 标记；画面元素用 `data-cue` 在对应字幕出现时入场。

中文旁白流程（发布时不重新生成，`narration.zh.mp3` 与 `timing.zh.json` 随仓库提交）：

1. `python3 scripts/zh_voiceover.py text > ~/tts/texts/input.txt`，在 ~/tts 提交并推送 `speech-chen_hongli-<input.txt 的 SHA-256 前 12 位>` tag，由 synthesis 工作流生成预发布；
2. `gh release download <tag> -R ZeroMarker/tts -p chen_hongli-zh-speech.mp3`；
3. `npm run voiceover:zh -- chen_hongli-zh-speech.mp3`：用 silencedetect 找出字幕间停顿，写 `timing.zh.json`（逐条打印预期/实际时间，偏差过大时报错）；
4. `npm run render:zh`：`scripts/build_zh.mjs` 由 `index.html` 生成 `index.zh.html`（场景时长、字幕时间、音频换成中文版），再渲染 `out/shenzhen-apec-zh.mp4`。

来源：[龙岗区政府](https://www.lg.gov.cn/english/news/latestnews/content/post_12588327.html)、[深圳政府在线 APEC 2026 专题](https://www.sz.gov.cn/en_szgov/news/infocus/APEC2026/News/content/post_12977146.html)

## 使用

```bash
npm run voiceover    # 生成旁白、同步场景时间、生成字幕时间轴
npm run dev          # HyperFrames Studio 预览
npm run check        # lint、布局、对比度检查
npm run render       # 渲染 out/shenzhen-apec-en.mp4（render:en 相同）
npm run render:zh    # 渲染中文旁白版 out/shenzhen-apec-zh.mp4
```

## 场景

1. intro — 深圳 · 2026 年 11 月 18—19 日 · 第 33 次领导人非正式会议
2. apec — 1989 年成立、21 个经济体、约 40% 人口、60%+ 经济总量
3. host — 2001 上海、2014 北京、2026 深圳；年度主题
4. priorities — 开放、创新、合作
5. why — 从边陲小镇到经济特区，天际线生长
6. today — 1700 万+ 人口、产业、粤港澳大湾区
7. outro — Shenzhen 2026 · 携手同行，共创未来
