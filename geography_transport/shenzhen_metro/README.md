# 深圳地铁

中文竖屏解说，1080 × 1920、30 fps、约 68 秒。HyperFrames 0.8.174；配音为 edge-tts `zh-CN-YunxiNeural`（+5%），字幕与画面揭示时间都取自 edge-tts WordBoundary。

一个数字贯穿全片：2004 年首段开通约 20 公里，到今天全市城市轨道交通 653.7 公里。七个场景各用一张真实照片：罗湖站、1 号线车厢、布吉站、岗厦北枢纽、14 号线列车、车公庙站厅、11 号线车窗外的珠江口，依次讲首段开通、最初两条线、2011 年大运会前二期五线通车、四线换乘的岗厦北、时速 120 公里的 14 号线、2025 年客流，以及今天的线网规模。

## 使用

在仓库根目录 `npm ci --include=dev` 并 `pip install -r requirements-voiceover.txt`，然后进入本目录：

```bash
npm run voiceover     # edge-tts 旁白 + WordBoundary，然后运行 build.py
npm run build         # 只按现有旁白时间重建 index.html、compositions/、poster/ 和 SRT
npm run check
npm run dev
npm run render        # out/shenzhen-metro-zh.mp4
npm run render:still  # 发版封面 out/cover.png
```

旁白 MP3、时长和词边界是生成产物，不提交。改文案请改 `public/voiceover/narration.zh.txt`，改画面请改 `build.py` 的 `SCENES`，然后重新 voiceover / build。音轨只有旁白，没有配乐。

照片由 `scripts/prepare_photos.py` 从 Wikimedia Commons 原图裁切生成并提交到 `assets/photos/`，渲染不需要联网。数据口径、来源、作者与许可见 [SOURCES.md](./SOURCES.md)；`STORYLINES.md` 是备选方案，`SPEC.md` 是视觉规范。
