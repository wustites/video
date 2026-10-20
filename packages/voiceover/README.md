# voiceover

共享的 Edge TTS 旁白脚本。项目在 `package.json` 中通过参数调用，无需各自复制脚本：

```json
"voiceover": "python3 ../../packages/voiceover/edge_narration.py --voice ja-JP-NanamiNeural --lang ja --rate=+8% --expected 7"
```

- 读取 `public/voiceover/narration.<lang>.txt`（空行分段，一段对应一个场景）
- 输出 `narration.<lang>.mp3` 与 `segment-durations.json`
- `--expected` 校验段落数与 `src/timing.ts` 的 `SCENE_IDS` 一致
- `--durations-format starts` 输出 `{durations, starts, total}`，默认输出时长数组

依赖见根目录 `requirements-voiceover.txt`。有特殊需求的项目（如 Solar、Saint Petersburg Metro 的字幕同步）保留自己的脚本。

## HyperFrames 项目的时间同步

HyperFrames 的场景时间写在 HTML 的 `data-start` / `data-duration` 里，生成旁白后用 `sync_hyperframes_timing.mjs` 按 `segment-durations.json` 改写：

```json
"voiceover": "python3 ../../packages/voiceover/edge_narration.py ... && node ../../packages/voiceover/sync_hyperframes_timing.mjs --fade 0.5 --tail 0.3"
```

场景元素需带相邻的 `data-scene="<序号>" data-start data-duration`，根节点 `id="root"`，旁白 `<audio id="narration">`。`--fade` 为场景前后交叉淡化的重叠秒数，`--tail` 为旁白结束后保留的秒数。

## 词级时间（`--word-marks`）

加上 `--word-marks` 时，额外输出 `public/voiceover/word-marks.json`：每段一个数组，元素为 Edge TTS WordBoundary 的 `{text, start}`（秒，相对该段开头）。用于让画面元素在旁白念到对应词时出现。
