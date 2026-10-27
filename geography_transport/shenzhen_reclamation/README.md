# 深圳填海造陆发展史

中文竖屏卫星地图解说，1080 × 1920、30 fps、约 63 秒。HyperFrames 0.8.174；配音为 edge-tts `zh-CN-YunxiNeural`（+5%），字幕与画面揭示时间都取自 edge-tts WordBoundary。

同一片深圳西海岸，六张真实 Landsat 卫星影像（1979、1988、1995、2004、2013、2026）依次叠换。白色虚线是 1979 年海岸线，橙色是每个阶段新增的陆地，由影像水体变化计算得出，不是手绘。镜头依次推近蛇口、宝安沿海、后海、机场与前海、深圳湾红树林，最后拉回全景，给出累计约 50 km² 的数字。

## 使用

在仓库根目录 `npm ci --include=dev` 并 `pip install -r requirements-voiceover.txt`，然后进入本目录：

```bash
npm run voiceover  # edge-tts 旁白 + WordBoundary，然后运行 build.py
npm run build      # 只按现有旁白时间重建 index.html、compositions/ 和 SRT
npm run check
npm run dev
npm run render     # out/shenzhen-reclamation-zh.mp4
```

旁白 MP3、时长和词边界是生成产物，不提交。`build.py` 生成 `index.html`、`compositions/scene-0…6.html`、`compositions/captions.html` 和 `public/voiceover/subtitles.zh.srt`，并把系统里的 Noto Sans CJK SC 子集化到 `assets/fonts/`（OFL）。改文案或镜头请改 `build.py` 的 `SCENES`，然后重新 build。音轨只有旁白，没有配乐。

## 影像与数据

`assets/map/` 由 `scripts/prepare_imagery.py` 生成并提交，渲染时不需要联网。这个脚本从 Microsoft Planetary Computer 读取 Landsat Collection 2 数据，裁成 113.76–114.04°E、22.26–22.72°N（北向上，每像素约 26.7 m），输出调色后的年份影像、各阶段新增陆地蒙版、轮廓路径和面积（`map.json`）。重新生成需要网络，以及 rasterio、scipy、scikit-image（见脚本头注释）。

面积是估算值：潮位、水体浑浊度和 30–60 m 的像元都会带来误差。统计只算画面内深圳一侧，不含香港，也不含画面外的东部海岸。来源与方法见 [SOURCES.md](./SOURCES.md)。

`STORYLINES.md` 记录了三个备选方案，`SPEC.md` 是视觉规范。
