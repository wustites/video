# 洛杉矶 2028 奥运会宣传片

中文竖屏宣传片，1080 × 1920、30 fps、约 31.7 秒。HyperFrames 0.8.174。无旁白、无字幕，只有配乐：Mixkit “Karma”（约 129 BPM）。68 拍里每一次切换、每一行字都落在拍点上。

一座体育场贯穿全片：洛杉矶纪念体育场办过 1932、1984 两届奥运会开幕式，2028 年 7 月 14 日第三次开幕。前奏（第 0—16 拍）讲历史；铺垫（第 16—32 拍）是航拍、7.14、伦敦 / 巴黎 / 洛杉矶三城；鼓点进入（第 32 拍）切到 SoFi，之后是 5 个新项目、351 个小项与女子名额，最后回到体育场柱廊收尾，“洛杉矶见”。

## 使用

在仓库根目录 `npm ci --include=dev`，然后进入本目录：

```bash
npm run build         # 按 assets/music/beats.json 重建 index.html、compositions/ 和 poster/
npm run check
npm run dev
npm run render        # out/la28-olympics-zh.mp4
npm run render:still  # 发版封面 out/cover.png
```

改画面请改 `build.py`：`CUTS` 是每个场景起始的拍号，`s0`…`s6` 里用 `b(k)` 指定场景内第 k 拍。换配乐要重新运行 `python3 scripts/prepare_music.py <mp3>`（需要 librosa），它会裁切音频、归一化到 -14 LUFS，并写出拍点表 `beats.json`。

照片由 `scripts/prepare_photos.py` 从 Wikimedia Commons 原图裁切；配乐和照片都提交在 `assets/` 下，渲染不需要联网。来源、作者与许可见 [SOURCES.md](./SOURCES.md)；`STORYLINES.md` 是备选方案，`SPEC.md` 是视觉规范。片中不使用 LA28 官方会徽（受商标保护，Commons 无可用文件）。
