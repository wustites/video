# 深圳填海造陆发展史

中文竖屏地图解说，1080 × 1920、30 fps、75.224 秒。采用 HyperFrames 0.8.174、edge-tts 中文男声 `zh-CN-YunxiNeural`（+10%）。

七幕涵盖蛇口工业区（1979）、后海（1990年代）、宝安西岸（2000年代）、前海规划（2010）、围填海严控（2018起）与生态保护。时间分期是叙事重点，区域开发时期存在重叠。2010 年是前海规划获批节点，不是填海起始。

## 使用

在仓库根目录 `npm ci` 并安装 `pip install -r requirements-voiceover.txt`，然后进入本目录：

```bash
npm run voiceover  # Edge TTS + 单词边界；按真实时长重建 HTML 和 SRT
npm run check
npm run dev
npm run render
```

输出 `out/shenzhen-reclamation-zh.mp4`。旁白 MP3 与时长、单词边界为生成产物，不提交；`voiceover` 完整重建。SRT 位于 `public/voiceover/subtitles.zh.srt`，字幕已烧录进视频。音轨只有旁白。

## 地图与资料

详见 [SOURCES.md](./SOURCES.md)。底图为 Natural Earth 1:10m land（公有领域）概化地理背景；开发重点用区位圆圈表达，不代表精确填海边界、历史海岸线或面积，不应作为测绘图使用。底图不绘行政边界。`assets/land-paths.json` 冻结裁切后的地图几何，`build.py` 可离线重建画面。

字体为 Noto Sans CJK SC 的本地 WOFF2 字符子集（OFL，见 `assets/FONT-LICENSE.txt`）。GSAP 3.14.2 已冻结为本地文件，渲染不依赖远程字体或脚本。新加文字时应相应扩展字体子集。

检查：HyperFrames lint、运行时、布局、运动均通过，120/120 项文字对比度检查通过；项目清单校验与仓库现有 9 项测试通过。

`SCRIPT.md` 为旁白，`STORYBOARD.md` 为分镜，`BRIEF.md` 记录需求与默认选择，`frame.md` 为视觉规范。
