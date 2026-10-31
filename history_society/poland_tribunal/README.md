# 波兰宪法法院之争

中文竖屏解说，1080 × 1920、30 fps、约 132 秒。HyperFrames 0.8.174；配音为 edge-tts `zh-CN-YunxiNeural`（+5%），字幕与画面揭示时间都取自 edge-tts WordBoundary。

讲 2026 年 10 月 30—31 日的波兰宪法法院危机：宪法法院 15 名法官、2015 年以来的任命争议；2026 年议会选出 8 名新法官，总统纳夫罗茨基只为其中 3 人监誓；10 月 30 日晚新法官进入法院，宣布院长希维昂奇科夫斯基与副院长停职，防暴警察包围法院；“政变”的指控与对停职法律依据的质疑；31 日凌晨总统进入法院、宣布宪法秩序遭到破坏；如今同一座法院两套领导层对峙。“政变”只作为一方的指控引用，片子不下定性。内容截至 2026 年 10 月 31 日。

## 使用

在仓库根目录 `npm ci --include=dev` 并 `pip install -r requirements-voiceover.txt`，然后进入本目录：

```bash
npm run voiceover     # edge-tts 旁白 + WordBoundary，然后运行 build.py
npm run build         # 只按现有旁白时间重建 index.html、compositions/、poster/ 和 SRT
npm run check
npm run dev
npm run render        # out/poland-tribunal-zh.mp4
npm run render:still  # 发版封面 out/cover.png
```

旁白 MP3、时长和词边界是生成产物，不提交。改文案请改 `public/voiceover/narration.zh.txt`，改画面请改 `build.py` 的 `SCENES`，然后重新 voiceover / build。音轨只有旁白，没有配乐。

照片由 `scripts/prepare_photos.py` 从 Wikimedia Commons 原图裁切生成并提交到 `assets/photos/`，渲染不需要联网。资料汇总见 [RESEARCH.md](./RESEARCH.md)，画面与旁白的出处、作者与许可见 [SOURCES.md](./SOURCES.md)；`SPEC.md` 是视觉规范，`REVIEW.md` 是成片检查记录。
