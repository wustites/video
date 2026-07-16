# Solar

A HyperFrames + Three.js animation of a stylized 3D solar system with Edge TTS narration in English, Chinese, Japanese, and Korean.

## Scripts

```bash
npm install
npm run voiceover
npm run sync:validate
npm run dev
npm run check
npm run render
```

The composition IDs are `solar-en`, `solar-zh`, `solar-ja`, and `solar-ko`.
`npm run render` renders all four MP4 files into `out/`.
The narration sources are `public/voiceover/narration.{lang}.txt`. Generated MP3
files are not committed. `npm run voiceover` generates segmented Edge TTS audio,
merges each language into its final MP3, writes cue JS/JSON from measured segment
durations, and updates composition durations. `npm run check` validates the sync
data and runs HyperFrames lint.

On tags matching `v*-solar-<lang>`, `.github/workflows/solar.yml` extracts `en`,
`zh`, `ja`, or `ko` and generates, validates, renders, and releases only that
language. For example, `v1.0.0-solar-zh` outputs only
`solar-system-zh-vertical.mp4`. Legacy `v*-solar` tags still render all four
languages.

The workflow can also be started manually with an `all/en/zh/ja/ko` selector; a
manual run uploads artifacts but does not create a Release.

The current CI voices are:

- English: `en-US-AriaNeural`
- Chinese: `zh-CN-XiaoxiaoNeural`
- Japanese: `ja-JP-NanamiNeural`
- Korean: `ko-KR-SunHiNeural`

Typography is loaded from the Google Noto repository through jsDelivr at preview
and render time:

- English: `Noto Sans`
- Chinese: `Noto Sans SC`
- Japanese: `Noto Sans JP`
- Korean: `Noto Sans KR`

Network access to `cdn.jsdelivr.net` is required. Font binaries are not stored in
this repository.

Install the pinned generator before running the local pipeline:

```bash
python -m pip install edge-tts==7.2.7
npm run voiceover
npm run check
```

Audio/video timing, measured durations, and validation rules are documented in
[`../AUDIO_VIDEO_SYNC.md`](../AUDIO_VIDEO_SYNC.md).
