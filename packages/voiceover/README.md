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
