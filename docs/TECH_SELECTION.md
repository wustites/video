# 按内容类型的技术选型

本文档按视频的**内容类型**给出技术选型：用什么框架、画面怎么画、数据和素材怎么进来、旁白怎么同步，以及仓库里可参考的项目。框架可以按项目自由选择（Remotion 或 HyperFrames），见 [ADR 0002](./decisions/0002-free-framework-choice.md)。下表中的“框架”一列是推荐值，不是硬性要求；各节的画面技术以 Remotion 写法为例，用 HyperFrames 时换成对应的 HTML/CSS + GSAP 写法即可。

## 速查表

| 内容类型 | 框架 | 画面技术 | 数据 / 素材 | 时间轴 | 画布 | 参考项目 |
| --- | --- | --- | --- | --- | --- | --- |
| [榜单与排行](#1-榜单与排行) | Remotion | 手写 SVG / flex 条形、计数器 | 提交到仓库的 snapshot（`setup.mjs` 手动刷新） | 固定时长，按帧分页 | 1080×1920 | top500、qs_universities、ai_model_rankings、openrouter_rankings |
| [时序数据与图表叙事](#2-时序数据与图表叙事) | Remotion | SVG 折线 / 面积 / 条形赛跑，纯函数插值 | 静态 TS 数组或 JSON | 无旁白：固定时长；有旁白：音频驱动 | 1080×1920 | population_cn、japan_economy、brexit_referendum |
| [交通线路示意图](#3-交通线路示意图) | Remotion | 手绘 SVG 示意图（非地理精确） | 线路、站点写成 TS 常量，注明事实依据 | 音频驱动 | 1080×1920 | metro_lima、sapporo_subway、saint_petersburg_metro |
| [行政区地图与地图集](#4-行政区地图与地图集) | Remotion | 离线预计算的 SVG 路径 + transform 镜头 | GeoJSON → 离线简化、投影 → 生成 TS | 音频驱动 | 1080×1920 | shandong_universities、southern_kurils_jp |
| [历史与社会叙事](#5-历史与社会叙事) | Remotion | 排版 + 简单图形 / 地图，场景卡片 | 旁白文本为核心，事实写入 README | 音频驱动（`@video/core`） | 1080×1920 | red_army_jp、imperial_house_law_jp、cloudflare_history |
| [科学 3D 可视化](#6-科学-3d-可视化) | Remotion + Three.js | WebGL（软件渲染 `swangle`） | 程序化几何、纹理 | cue 驱动 | 1080×1920 | solar |
| [数学与概念科普](#7-数学与概念科普) | Remotion | 按帧计算的 SVG 几何 | 由公式生成 | 固定时长或音频驱动 | 1920×1080 | kakeya_conjecture |
| [品牌创意与动态排版](#8-品牌创意与动态排版) | Remotion | `spring` / `interpolate` 动态排版，可加 Lottie | 设计稿、矢量 logo | VTT 或音频驱动 | 1080×1920 | apple |
| [多语言版本](#9-多语言版本) | Remotion | 同一组件 + `locale` prop | `i18n.ts` + 每种语言的旁白 | 每种语言独立时间轴 | 同原项目 | solar、ai_model_rankings、openrouter_rankings |
| [写实三维镜头](#10-写实三维镜头) | Blender → Remotion | Blender 渲染帧序列，Remotion 合成 | `.blend` + Python 脚本 | Remotion 主时间轴 | 同原项目 | 暂无（见 [Blender 文档](./BLENDER_PYTHON_VIDEO.md)） |
| [封面与静帧](#11-封面与静帧) | `remotion still` 或独立 HTML | 同视频组件，或纯 HTML/CSS | 同视频 | 不适用 | 按平台规格 | `cover/`、imperial_house_law_jp 的 `render:still` |
| [实拍素材与口播剪辑](#12-实拍素材与口播剪辑) | 剪辑软件为主；包装用 Remotion | `<OffthreadVideo>` + 叠加图层 | 素材文件不入库 | 以素材音轨为主时钟 | 按素材 | 暂无 |
| [一次性 Agent 短片](#13-一次性-agent-短片) | HyperFrames | HTML + GSAP | 随作品 | 旁白驱动（`packages/voiceover/sync_hyperframes_timing.mjs` 写入 HTML） | 按需 | claude_mhs、[wustites/anime](https://github.com/wustites/anime) |

## 账号范围的框架分工

框架按项目自由选择（[ADR 0002](./decisions/0002-free-framework-choice.md)），本仓库内 Remotion 与 HyperFrames 项目并存，在 `projects.json` 中用 `framework` 字段区分。下面的分工只是默认倾向：

| 生产方式 | 推荐框架 | 例子 |
| --- | --- | --- |
| 模板化、批量、全自动（数据驱动、每期更新、每日生成） | Remotion | 本仓库的榜单和数据项目；[ZeroMarker/daily](https://github.com/ZeroMarker/daily) |
| Agent 按作品生成（从文章、音乐或设计稿生成，每条视频风格独立） | HyperFrames | 本仓库的 claude_mhs；[wustites/anime](https://github.com/wustites/anime) |
| 逐帧精确复刻参考动画 | 自写 Canvas + FFmpeg 渲染器 | 产品官方动画复刻、卡牌影片 |

约定：

- 不论选哪个框架，项目都登记到 `projects.json`，提供 `check`、`dev`、`render`、`render:draft` 脚本，渲染结果写入 `out/`，就能使用统一的发布流程。
- 旁白统一使用 Edge TTS（[`packages/voiceover`](../packages/voiceover/README.md)）。HyperFrames 项目在 `voiceover` 脚本后运行自己的时间同步脚本，把段落时长写进 HTML。
- 已有项目可以迁移框架，迁移时同步更新 `projects.json` 和项目 README，并完整渲染一次。
- 各框架版本精确锁定；升级时逐个项目回归。

## 通用规则

无论哪种类型，都遵守以下规则：

- **渲染确定性**：画面只依赖 `useCurrentFrame()` 和静态数据。渲染时不发网络请求，不用定时器、`Math.random()`（需要随机时用 Remotion 的 `random(seed)`）或 `Date.now()`。
- **数据先成为快照**：抓取、清洗、投影都在离线脚本里完成，结果提交到仓库；发布时用已提交的快照渲染，CI 不刷新数据。
- **字体**：使用对应语言的 Noto 字体（见根目录 README 的字体规范），并在渲染前等待加载完成。
- **画布**：短视频平台默认竖屏 1080×1920 @ 30fps；以讲解和推导为主、需要横向空间的内容用 1920×1080。
- **时间轴**：有旁白就由音频驱动，使用 `@video/core` 与 `packages/voiceover`（见[音画同步方案](./AUDIO_VIDEO_SYNC.md)）；没有旁白才用固定时长。
- **依赖**：优先手写 SVG 和纯函数。只有确实省事时才引入库，而且只用它的计算部分（比如 `d3-scale`、`d3-shape`、`d3-geo`），不用它的 DOM 操作和过渡动画。

## 1. 榜单与排行

**特点**：数据项多、结构固定（排名、数值、类别），每期更新数据而模板不变。

- **画面**：条形用 flex 宽度或 SVG `rect`，宽度按最大值归一化；数字用 `Math.round(interpolate(...))` 按帧计数；分页按帧索引切换。不需要图表库。
- **数据**：`scripts/setup.mjs` 抓取数据后写入 `src/snapshot.json`，抓取失败时保留旧快照；`src/data.ts` 负责把快照转成带类型的结构。刷新数据要手动执行 `npm run data:update`，人工审核后再提交。
- **适合扩展的方向**：模板化后用 `inputProps` 或 `calculateMetadata` 传入不同期的数据，同一组件批量渲染多期。
- **注意**：
  - 名称长度差异大，需要测试最长名称的换行和截断；
  - 写明数据来源和统计口径；
  - 网页抓取类数据源（如 QS）用 `skills/qs-ranking-scraper` 一类的离线工具，不要在渲染时抓取。

## 2. 时序数据与图表叙事

**特点**：讲“随时间怎么变”，常见形式有折线、面积图、条形赛跑和年份计数器。

- **画面**：时间进度 → 当前年份 → 插值后的数据 → 排序 → 渲染，整条链路写成纯函数（参考 population_cn 的 `interpolateData()`），并给它写单元测试，`tests/` 里已有边界用例。
- **坐标与路径**：坐标和路径生成可以用 `d3-scale` / `d3-shape`，也可以手写，二者等价；折线的绘制动画用 `strokeDasharray` / `strokeDashoffset` 按帧控制。
- **有旁白时**：每个章节对应一段旁白（japan_economy），数据动画放在场景内，用场景进度驱动。
- **注意**：
  - 排名变化时用插值后的数值排序，避免名次跳变；
  - 首尾年份要处理边界；
  - 坐标轴的单位、基准年和数据来源要显示在画面上。

## 3. 交通线路示意图

**特点**：表达线路拓扑和换乘，不追求地理精确。

- **画面**：手绘 SVG 示意图，横平竖直加 45° 折线，站点和线路都是 TS 常量（`SchematicMap.tsx`），文件头注明事实依据（线路长度、站数、开通年份）。
- **为什么不用真实地图**：真实地理坐标下站点挤在一起，竖屏里很难读清；示意图更容易控制标签不重叠，也更容易逐条线高亮。
- **动画**：线路逐段绘制用 dash offset；站点按顺序入场；换乘站单独强调。
- **多语言站名**：站名用原文加转写或翻译，双语字幕参考 saint_petersburg_metro 的 `BilingualSubtitles`。
- **注意**：在建线和规划线要用不同线型区分，并注明时间。

## 4. 行政区地图与地图集

**特点**：需要真实边界，比如省、市、岛屿，常带有“镜头”在地图上移动。

- **数据流水线**（参考 `education/shandong_universities/scripts/gen_geo.py`）：
  ```text
  GeoJSON（DataV GeoAtlas / Natural Earth / OSM，提交到 data/）
    → Douglas-Peucker 简化
    → 投影（小范围用等距投影并做纬度余弦修正；大范围用 d3-geo 的合适投影）
    → 归一化到固定 viewBox
    → 离线求解标签位置（避免重叠）
    → 生成 src/*Geo.ts
  ```
- **镜头**：对整张 SVG 做 `transform: translate/scale`，关键帧写在 `mapCamera.ts` 一类的模块里，用场景时间插值。不要在渲染时用瓦片地图或在线地图 SDK：渲染结果不确定，还有许可风险。
- **简化场景**：边界不需要精确时，可以像 southern_kurils_jp 那样手写简化路径。
- **注意**：
  - 争议领土的标注、名称和配色要谨慎，必要时在 README 中说明立场和依据；
  - 注明地图数据来源和许可；
  - 生成脚本和原始 GeoJSON 一起提交，保证可以复现。

## 5. 历史与社会叙事

**特点**：旁白是主体，画面辅助理解；时长由旁白决定；事实准确性要求高。

- **时间轴**：`narration.<lang>.txt` 按段对应场景，用 `packages/voiceover` 生成，`@video/core` 的 `createRemotionTimeline` 推导场景时间（参考 red_army_jp）。新项目不要再像 cloudflare_history 那样手工维护时间。
- **画面**：大标题、年份、引文卡片、简单地图和时间线；每个场景只讲一个要点。
- **素材**：历史照片和档案图片要确认版权（公有领域或 CC 许可），在 README 中逐项记录来源；拿不到许可的素材，用排版和示意图代替。
- **注意**：
  - 敏感或有争议的议题，在旁白中区分事实和观点，数据注明来源；
  - 涉及具体日期和数字的修正要单独提交（参考 `9e938a6` 修正 Cloudflare 内容的做法）。

## 6. 科学 3D 可视化

**特点**：需要真实的空间关系，比如天体、分子、结构体。

- **当前做法**：solar 直接使用 `three`，在 `useEffect` 里创建场景，用 `delayRender` / `continueRender` 等待第一帧；渲染器设为 `swangle`，因为无 GPU 的 CI 中 `angle` 无法创建 WebGL 上下文。
- **新项目推荐**：使用 `@remotion/three` 的 `<ThreeCanvas>`，配合 `@react-three/fiber`，由 Remotion 管理画布尺寸和逐帧渲染，相机和物体位置都从 `useCurrentFrame()` 推导，减少手写 effect 带来的状态残留。
- **性能**：软件 WebGL 渲染很慢，应控制几何面数、阴影和后处理；先用 `render:draft` 验证。
- **何时换 Blender**：需要写实材质、全局光照、物理模拟时，见[第 10 节](#10-写实三维镜头)。
- **注意**：比例尺通常需要夸张处理（行星大小与距离），应在画面或旁白中说明“示意比例”。

## 7. 数学与概念科普

**特点**：几何构造、推导过程、反例演示，强调精确和一步一步的展示。

- **画面**：几何图形用 SVG 按帧计算（参考 kakeya_conjecture）：点、线、旋转都由参数方程加当前帧算出，不预先画死；用横屏 1920×1080 获得推导空间。
- **公式**：公式数量不多时，离线用 KaTeX / MathJax 渲染成 SVG 后提交；不要在渲染时加载 CDN 上的公式引擎。
- **动画手法**：
  - 一次只引入一个新元素；
  - 已讲过的内容降低透明度，而不是删除；
  - 关键结论停留足够长（≥ 2 秒）。
- **备选**：需要大量公式变形动画（Manim 风格）时，可以用 Manim 离线渲染片段，再作为 `<OffthreadVideo>` 嵌入 Remotion。这是例外，要写进项目 README。

## 8. 品牌创意与动态排版

**特点**：节奏感、排版和转场是重点，数据少。

- **画面**：`spring()` 做回弹，`interpolate` 配合 `Easing` 做缓动，文字逐字或逐词入场；矢量 logo 转成 JSX 组件（参考 apple 的 `AppleMark`）。
- **复杂动效**：设计师在 After Effects 中做好的动效，导出 Lottie 后用 `@remotion/lottie` 接入，并用帧号控制进度；不要手工逐个移植 AE 关键帧。
- **转场**：用 `@remotion/transitions` 的 `TransitionSeries` 统一管理场景之间的转场，不要在每个场景里各写一套淡入淡出。
- **时间轴**：旁白有逐句节奏时，参考 apple 用 VTT 句子时间对齐场景；新项目更推荐按段生成旁白，让时长数据自动驱动。

## 9. 多语言版本

**特点**：同一内容输出多种语言，而不同语言的文字长度和旁白时长差异很大。

- **结构**：一个组件接收 `locale` prop，`Root.tsx` 为每种语言注册一个 composition；文案集中在 `i18n.ts`；`projects.json` 的 `variants` 与 `render:<lang>` 一一对应。
- **时间轴**：每种语言单独生成旁白、单独计算时长（solar 的 `cues.<lang>.json`）；不要假设翻译后时长相同。
- **排版**：每种语言选对应的 Noto 字体；中日韩文字和拉丁文字的字号、行高分别调整；最长的那种语言决定版面。
- **发布**：用 `<project>-<version>-<variant>` 只构建一种语言，CI 也只生成该语言的旁白。

## 10. 写实三维镜头

**特点**：需要写实材质、光照、物理模拟或复杂相机运动。

- **流水线**：Blender Python 脚本建模和渲染帧序列 → FFmpeg 编码成中间视频（需要透明背景时用 ProRes 4444 / WebM）→ 放入 `public/` → Remotion 用 `<OffthreadVideo muted>` 合成，字幕、旁白和数据叠加都在 Remotion 中完成。详见 [Blender 文档](./BLENDER_PYTHON_VIDEO.md)。
- **分工**：Blender 只负责三维镜头，文字和数据都不放进 Blender，便于修改和做多语言版本。
- **注意**：渲染出的视频文件较大，一般不提交，提交生成脚本和 `.blend`；CI 中一般不跑 Blender 渲染，中间视频需要另外存放和标注版本。

## 11. 封面与静帧

**特点**：单张图片，常用于视频平台、公众号封面。

- **与视频共用设计**：用 `remotion still` 从视频的某一帧或专门的封面 composition 导出（参考 imperial_house_law_jp 的 `render:still`），保证字体和配色与视频一致；HyperFrames 项目用单帧的 `poster/index.html`（参考 gpt_6_1_terra）。项目的 `render:still` 写出 `out/cover.png`，发版时自动作为 Release 封面上传，见 [发布流程](./RELEASING.md#封面)。
- **独立设计**：与视频无关的封面（如 `cover/` 下的节日封面）可以写成纯 HTML/CSS，用浏览器截图导出，不进入 `projects.json` 和发布流程。
- **注意**：按平台规格确定尺寸和安全区（例如微信封面的裁切比例），文字要避开平台会叠加界面的区域。

## 12. 实拍素材与口播剪辑

**特点**：以已有视频或录音为主，需要剪辑、字幕和包装。仓库目前没有这类项目。

- **剪辑本身**：粗剪交给剪辑软件（DaVinci Resolve / Premiere / 剪映）或 FFmpeg 脚本，不要在 Remotion 里做大量剪辑。
- **包装**：标题、下三分之一信息条、数据卡片和字幕用 Remotion 制作，素材用 `<OffthreadVideo>` 接入；字幕时间用 Whisper 类工具离线转写，再经人工校对，生成 cue JSON。
- **注意**：
  - 素材文件不提交，在 README 中说明获取方式；
  - 时钟以素材自身的音轨为准，不要再叠加 TTS 时间轴。
- **何时考虑 HyperFrames**：如果这类需求变多，而且主要是“给已有视频加字幕或图形包装”，可以按 ADR 0001 的重新评估条件，用一个新项目试点 HyperFrames 的字幕和图形叠加工作流。

## 13. 一次性 Agent 短片

**特点**：由 Agent 从一段文字生成、用一次就不再维护的短片，不需要复用组件，也不进入发布流程。

- **框架**：推荐 HyperFrames：HTML 源文件便于 Agent 直接生成和检查。
- **位置**：可以作为本仓库的正式项目（登记到 `projects.json`，`framework: "hyperframes"`，参考 claude_mhs），也可以放到独立的 HyperFrames 作品仓库。
- **时间轴**：有旁白时用 `packages/voiceover` 生成，再用共享脚本 `packages/voiceover/sync_hyperframes_timing.mjs` 把段落时长写进各场景的 `data-start` / `data-duration`。

## 新项目选型步骤

1. **确定框架**：按[账号范围的框架分工](#账号范围的框架分工)的倾向选择 Remotion 或 HyperFrames，在 `projects.json` 的 `framework` 字段中登记。
1. **确定内容类型**：在速查表中找到最接近的一行。同时属于多种类型时，以最主要的画面形式为准，比如“带地图的历史叙事”按第 5 节组织时间轴，地图部分按第 4 节处理。
2. **确定是否有旁白**：有旁白就由音频驱动，用 `@video/core` 和 `packages/voiceover`；没有就用固定时长。
3. **确定画布**：默认竖屏；以推导、讲解为主、需要横向空间时用横屏。
4. **确定数据与素材的来源**：写出离线生成或抓取脚本，结果作为快照提交，并在 README 中注明来源和许可。
5. **复制参考项目的结构**：从速查表的参考项目开始，而不是从零搭建；登记到 `projects.json`。
6. **超出本文档范围时**：需要新的渲染技术（如 Manim、Lottie、Blender），在项目 README 中说明原因；如果会影响多个项目，新增一份 ADR。
