# 深圳大学发展史

中文竖屏解说，1080 × 1920、30 fps、约 62 秒。HyperFrames 0.8.174；配音为 edge-tts `zh-CN-YunxiNeural`（+5%），字幕与画面揭示时间都取自 edge-tts WordBoundary。

一个数字贯穿全片：1983 年首届新生 216 人，到今天在校生 50648 人。七个场景各用一张真实校园照片：粤海校区南门、文山湖、图书馆、文科楼一带、科技楼、丽湖校区航拍与夜景，依次讲特区同步起步与三校援建、1984 年迁入粤海、几个“全国第一”、腾讯创始人、2017 年丽湖校区与 2018 年高水平大学建设。

## 使用

在仓库根目录 `npm ci --include=dev` 并 `pip install -r requirements-voiceover.txt`，然后进入本目录：

```bash
npm run voiceover     # edge-tts 旁白 + WordBoundary，然后运行 build.py
npm run build         # 只按现有旁白时间重建 index.html、compositions/、poster/ 和 SRT
npm run check
npm run dev
npm run render        # out/szu-history-zh.mp4
npm run render:still  # 发版封面 out/cover.png
```

旁白 MP3、时长和词边界是生成产物，不提交。改文案请改 `public/voiceover/narration.zh.txt`，改画面请改 `build.py` 的 `SCENES`，然后重新 voiceover / build。音轨只有旁白，没有配乐。

照片由 `scripts/prepare_photos.py` 从 Wikimedia Commons 原图裁切生成并提交到 `assets/photos/`，渲染不需要联网。来源、作者与许可见 [SOURCES.md](./SOURCES.md)；`STORYLINES.md` 是三个备选方案，`SPEC.md` 是视觉规范。
