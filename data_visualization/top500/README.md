# 世界五百强 Remotion 可视化视频

一个中文竖屏数据可视化短片，基于 Remotion 制作，主题为 2026 年《财富》世界500强，带中文旁白。

## 使用

```bash
npm run voiceover   # 生成旁白（需要 edge-tts 与 ffmpeg）
npm run dev
```

渲染视频：

```bash
npm run render
```

输出文件：`out/video.mp4`

## 内容

- 约 66 秒、1080x1920、30fps，中文旁白（edge-tts `zh-CN-XiaoxiaoNeural`）
- 开场：总收入、总利润、员工数、女性 CEO
- 前 10 名收入排行（按国家着色）
- 国家和地区分布（500 格方块图）
- 五大行业的公司数量
- 利润视角：收入冠军与利润冠军对比、利润前四
- 结论页

场景时长由旁白各段实测时长决定，画面元素在旁白念到对应数字时出现（`src/timing.ts` 的 `cue()`，来自 Edge TTS WordBoundary）。修改 `public/voiceover/narration.zh.txt` 后运行 `npm run voiceover` 即可重新对齐。

## 数据说明

榜单口径为 2026 年《财富》世界500强（2026 年 7 月 28 日发布，按截至 2026 年 3 月 31 日的财年收入排名）。

- 总收入 43.1 万亿美元（约为全球 GDP 的三分之二）、总利润 3.4 万亿美元、员工 7,020 万、女性 CEO 34 位、36 个国家和地区、美国 141 家（2008 年以来最多）、中国 122 家（含台湾地区，比上年少 8 家）、五大行业公司数（金融 123、能源 77、科技 38、汽车及零部件 35、医疗 31，合计约六成公司、三分之二收入）、亚马逊终结沃尔玛 12 年连冠：[Fortune 2026 Global 500 新闻稿](https://finance.yahoo.com/markets/stocks/articles/fortune-announces-2026-fortune-global-100100477.html)
- 前十名收入与利润、利润前四：[新浪财经 2026 年《财富》世界500强专题](https://finance.sina.com.cn/zt_d/subject-1785232688)

其他国家的上榜数量未逐一核实，片中合并为“其他 34 个国家和地区”。

## GitHub Actions 发布

推送 `top500-<semver>` 标签时，Actions 会检查并渲染竖屏 MP4，然后上传构建产物。

发布 Release：

```bash
git tag top500-1.0.0
git push origin top500-1.0.0
```

推送 `top500-<semver>` 标签后，工作流会创建 GitHub Release，并将 `out/video.mp4` 重命名为 `top500-<semver>.mp4` 后上传。

## Remotion 移植说明

由早期 HyperFrames 版移植的 Remotion 实现位于 `src/`：

- `src/data.ts` — 全部硬编码数组（Top 10 公司 x10、国家分布 x8、行业结构 x8、利润榜 x4）与场景帧窗口、计数上限、格式化函数，无运行时请求。
- `src/Top500.tsx` — 6 场景（intro / topbars / country / industry / profit / outro），GSAP clamp 改为 `interpolate()`（含 18 帧场景淡入淡出），50 圆点经 `Array.from({length: 50})` 渲染，国家堆叠条用 flex 宽度，计数器用 `Math.round` 由帧驱动。
- `src/fonts.ts` / `src/Root.tsx` — Noto Sans SC 经 `@remotion/google-fonts` 加载，`delayRender` 门控。
- 29 秒、1080x1920、30fps（870 帧），无音频。
- 背景网格使用了 `mask-image` 渐隐，集成阶段需冒烟测试确认 headless Chromium 渲染正常（否则回退为无 mask 网格）。

```bash
npm run dev
npm run check
npm run render        # out/video.mp4
npm run render:draft  # out/preview.mp4
```
