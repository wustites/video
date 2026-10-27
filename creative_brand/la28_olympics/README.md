# 洛杉矶 2028 奥运会宣传片

中文竖屏宣传片，1080 × 1920、30 fps、约 60 秒。HyperFrames 0.8.174；配音为 edge-tts `zh-CN-YunxiNeural`（+5%），字幕与画面揭示时间都取自 edge-tts WordBoundary。

一座体育场贯穿全片：洛杉矶纪念体育场办过 1932、1984 两届奥运会开幕式，2028 年 7 月 14 日第三次开幕。之后依次是：和伦敦、巴黎并列三次举办夏季奥运会；同一晚 SoFi 体育场同时开幕、球场改成游泳赛场；五个新增项目；351 个小项与女子名额首次多过男子；结尾“7.14—7.30 洛杉矶见”。

## 使用

在仓库根目录 `npm ci --include=dev` 并 `pip install -r requirements-voiceover.txt`，然后进入本目录：

```bash
npm run voiceover     # edge-tts 旁白 + WordBoundary，然后运行 build.py
npm run build         # 只按现有旁白时间重建 index.html、compositions/、poster/ 和 SRT
npm run check
npm run dev
npm run render        # out/la28-olympics-zh.mp4
npm run render:still  # 发版封面 out/cover.png
```

旁白 MP3、时长和词边界是生成产物，不提交。改文案请改 `public/voiceover/narration.zh.txt`，改画面请改 `build.py` 里的 `s0`…`s6`，然后重新 voiceover / build。音轨只有旁白，没有配乐。

照片由 `scripts/prepare_photos.py` 从 Wikimedia Commons 原图裁切生成并提交到 `assets/photos/`，渲染不需要联网。来源、作者与许可见 [SOURCES.md](./SOURCES.md)；`STORYLINES.md` 是三个备选方案，`SPEC.md` 是视觉规范。片中不使用 LA28 官方会徽（受商标保护，Commons 无可用文件）。
