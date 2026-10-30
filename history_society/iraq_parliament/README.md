# 伊拉克国民议会

中文竖屏解说，1080 × 1920、30 fps、约 102 秒。HyperFrames 0.8.174；配音为 edge-tts `zh-CN-YunxiNeural`（+5%），字幕与画面揭示时间都取自 edge-tts WordBoundary。

介绍 2025 年 11 月 11 日选出的第六届伊拉克国民议会（代表理事会）：329 个席位、官方投票率 56%、前五大党派合计 155 席不过半、83 席女性与 9 席少数群体保留名额、12 月 29 日首次会议选出议长哈尔布希、2026 年 4 月选出总统阿米迪、5 月扎伊迪政府通过信任投票（23 名部长人选通过 14 人），从投票到新政府上任共六个月。两个场景用 329 个点的半圆议席图表示席位分布与保留名额。

## 使用

在仓库根目录 `npm ci --include=dev` 并 `pip install -r requirements-voiceover.txt`，然后进入本目录：

```bash
npm run voiceover     # edge-tts 旁白 + WordBoundary，然后运行 build.py
npm run build         # 只按现有旁白时间重建 index.html、compositions/、poster/ 和 SRT
npm run check
npm run dev
npm run render        # out/iraq-parliament-zh.mp4
npm run render:still  # 发版封面 out/cover.png
```

旁白 MP3、时长和词边界是生成产物，不提交。改文案请改 `public/voiceover/narration.zh.txt`，改画面请改 `build.py` 的 `SCENES`，然后重新 voiceover / build。音轨只有旁白，没有配乐。

照片由 `scripts/prepare_photos.py` 从 Wikimedia Commons 原图裁切生成并提交到 `assets/photos/`，渲染不需要联网。数据口径、来源、作者与许可见 [SOURCES.md](./SOURCES.md)；`SPEC.md` 是视觉规范，`REVIEW.md` 是成片检查记录。
