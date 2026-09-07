# Video Projects

本仓库收录数据可视化、榜单与科普类视频项目，当前 16 个项目均基于 **Remotion** 制作；部分目录保留了早期 HyperFrames 源文件。

## 项目一览

| 项目 | 内容 | 语言 | 时长 | 框架 | 默认输出 |
| --- | --- | --- | ---: | --- | --- |
| [Metro de Lima](./metro_lima/) | 秘鲁利马地铁系统介绍 | 西 | 随旁白生成 | Remotion | `out/video.mp4` |
| [Sapporo Subway](./sapporo_subway/) | 日本札幌市营地铁介绍 | 日 | 随旁白生成 | Remotion | `out/video.mp4` |
| [Cloudflare History](./cloudflare_history/) | Cloudflare 发展历程 | 中 | 90 秒 | Remotion | `out/video.mp4` |
| [Japan Economy](./japan_economy/) | 日本 1985—2026 经济指标与日经指数 | 日 | 随旁白生成 | Remotion | `out/video.mp4` |
| [AI Model Rankings](./ai_model_rankings/) | AI 模型能力、速度与厂商分布 | 英、中、日 | 60 秒 | Remotion | `out/video.mp4` |
| [Apple](./apple/) | 水果苹果创意介绍 | 中 | 54 秒 | Remotion | `out/video.mp4` |
| [OpenRouter Rankings](./openrouter_rankings/) | OpenRouter 每周模型使用排名 | 英、中 | 45 秒 | Remotion | `out/video.mp4` |
| [Population CN](./population_cn/) | 中国各省出生人口变化 | 中 | 40 秒 | Remotion | `out/video.mp4` |
| [QS Universities](./qs_universities/) | QS 世界大学排名 | 中 | 52 秒 | Remotion | `out/video.mp4` |
| [Solar System](./solar/) | 太阳系科普动画 | 英、中、日、韩 | 随旁白生成 | Remotion | `out/video.mp4` |
| [Top 500](./top500/) | 2025 年《财富》世界 500 强 | 中 | 29 秒 | Remotion | `out/video.mp4` |
| [Kakeya Conjecture](./kakeya_conjecture/) | 挂谷猜想科普动画 | 中 | 42 秒 | Remotion | `out/video.mp4` |
| [Brexit Referendum](./brexit_referendum/) | 英国脱欧公投回顾 | 英 | 随旁白生成 | Remotion | `out/video.mp4` |
| [Red Army JP](./red_army_jp/) | 日本赤军历史 | 日 | 随旁白生成 | Remotion | `out/red-army-ja.mp4` |
| [Southern Kurils JP](./southern_kurils_jp/) | 南千岛群岛介绍 | 日 | 随旁白生成 | Remotion | `out/southern-kurils-ja.mp4` |
| [Imperial House Law JP](./imperial_house_law_jp/) | 皇室典范改正议题 | 日 | 随旁白生成 | Remotion | `out/imperial-house-law-ja.mp4` |

榜单和数据项目采用 `1080 × 1920` 竖屏画布；Kakeya Conjecture 使用 `1920 × 1080` 横屏画布。具体数据来源、内容结构和资源要求见各项目目录内的 README。

## 环境要求

- Node.js 22 或更高版本
- FFmpeg
- Chrome 或 Chromium
- npm

## 字体规范

所有 Remotion 和 HyperFrames 项目必须使用与内容语言对应的 Google Fonts **Noto 网络字体**，不能默认依赖渲染机器上的本地字体。默认字体映射如下：

| 内容语言 | Google Noto 字体 | CSS `font-family` |
| --- | --- | --- |
| 英语、西班牙语及其他拉丁文字 | Noto Sans | `"Noto Sans", sans-serif` |
| 简体中文 | Noto Sans SC | `"Noto Sans SC", sans-serif` |
| 繁体中文 | Noto Sans TC | `"Noto Sans TC", sans-serif` |
| 日语 | Noto Sans JP | `"Noto Sans JP", sans-serif` |
| 韩语 | Noto Sans KR | `"Noto Sans KR", sans-serif` |

Remotion 项目应使用 `@remotion/google-fonts` 加载对应字体，并在开始渲染前等待字体完成加载。示例：

```ts
import {loadFont} from '@remotion/google-fonts/NotoSansJP';

export const notoSansJP = loadFont('normal', {
  weights: ['400', '500', '600', '700', '800', '900'],
  subsets: ['japanese', 'latin'],
});
```

HyperFrames 项目应在 HTML 中通过 Google Fonts 的 `<link>` 或 `@import` 引入对应字体，并将其设置为页面和视频元素的全局字体：

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
```

开发预览、Remotion 渲染和 HyperFrames CI 都需要能够访问 `fonts.googleapis.com` 与 `fonts.gstatic.com`。应在截图或渲染前确认 `document.fonts.ready`；字体加载失败时才允许回退到 `sans-serif`。若要求完全离线或严格可复现的字形，应使用许可允许的字体文件和本地 `@font-face`，但仍保持对应语言的 Noto 字体族。

## 快速开始

进入任意项目目录后执行：

```bash
cd ai_model_rankings
npm ci

# TypeScript 类型检查
npm run check

# 启动本地预览
npm run dev

# 渲染默认英语版本到 out/video.mp4
npm run render
```

预览服务启动后，终端会输出 Remotion Studio 地址。修改 `src/` 中的组件、样式或数据后，预览会自动刷新。

各项目的 `npm run check` 当前均为 `tsc --noEmit`，不包含布局、内容或音画同步检查。多语言项目使用 `npm run render:<语言代码>` 单独渲染；`npm run render` 只生成默认版本。具体输出以 `package.json` 为准。

## 推荐工作流

1. 阅读项目 README，确认主题、数据口径、语言和输出文件，并执行 `npm ci`。
2. 项目定义了 `voiceover` 时，先安装 Python 的 `edge-tts` 和 FFmpeg，再运行 `npm run voiceover` 生成所需音频与时间轴文件。
3. 项目定义了 `setup` 时，按该项目的数据更新说明执行；AI 榜单项目还需手动同步 `src/data.ts`。
4. 修改 `src/` 中的组件和数据，运行 `npm run check`。
5. 运行 `npm run dev`，检查关键帧、转场、文字溢出、字幕和音画同步。
6. 运行 `npm run render:draft` 试渲染，确认后运行 `npm run render` 或对应语言脚本。

`render:draft` 的参数因项目而异，部分项目仅改变输出文件和日志级别；请查看 `package.json`，不要默认认为它会降低分辨率或缩短渲染时间。

## GitHub Actions 发布

普通的 Remotion / HyperFrames 项目统一使用 `.github/workflows/render-release.yml` 发布。工作流由 `<project_key>-<semver>` tag 触发，自动解析项目、安装依赖、生成旁白、运行检查、渲染 MP4，并上传 artifact 和 GitHub Release。

| 项目 | Tag 格式 | 工作流 |
| --- | --- | --- |
| 所有 Remotion / HyperFrames 项目 | `<project_key>-<semver>[-<variant>]`，例如 `japan_economy-1.0.0`、`solar-1.0.0-zh` | `render-release.yml` |

例如发布日本经济和札幌地铁：

```bash
git tag japan_economy-1.0.1
git push origin japan_economy-1.0.1

git tag sapporo_subway-1.0.4
git push origin sapporo_subway-1.0.4
```

所有项目都使用通用的 `project-version-variant` 格式，variant 与项目脚本直接一一对应。Solar 与 Kakeya Conjecture 发布示例：

```bash
git tag solar-1.0.0-zh
git push origin solar-1.0.0-zh

git tag kakeya_conjecture-1.0.0
git push origin kakeya_conjecture-1.0.0
```

Solar 的 variant 为 `en`、`zh`、`ja`、`ko`，可带 variant 单独发版，Action 会直接执行对应的 `npm run render:<variant>`。Solar 不带 variant 时渲染默认英语版。Kakeya Conjecture 无 variant，直接执行 `npm run render`。具体声音、复现命令和 CI 限制见 [TTS 旁白方案](./TTS.md)，同步实现与实际时长见 [音画同步方案](./AUDIO_VIDEO_SYNC.md)。

## 仓库约定

- 一个视频项目对应一个顶层目录。
- Remotion 入口为 `src/index.ts`，composition 注册在 `src/Root.tsx`。
- Remotion 多语言版本通过 composition 和语言参数注册，共享资源放在 `public/`；`compositions/` 中的 HTML 为保留的 HyperFrames 源文件。
- 渲染产物统一写入 `out/`，不要提交临时预览文件。
- 数据、单位、统计年份和来源必须在项目 README 中说明。
- 新增项目时应提供 `package.json`、`package-lock.json`、README、Remotion 入口与配置和可执行的检查、预览、渲染脚本。

## 常见问题

### 渲染失败或浏览器无法启动

先确认已执行 `npm ci`，所需旁白和时间轴文件已生成，再检查 Node.js、FFmpeg、Chrome 和可用内存。字体加载问题按上方字体规范排查。

### 文字被裁切或多语言排版不一致

在 Remotion Studio 中分别选择各语言的 composition，检查标题换行、字号、行高与场景边界。类型检查不会发现文字溢出，需要在预览和试渲染中确认。

### 渲染速度过慢

先查看 `render:draft` 的实际参数，并减少高成本滤镜、模糊和粒子效果。Solar 的 WebGL 配置与渲染要求见其项目 README。

## 文档

- [HyperFrames 视频制作最佳实践](./HYPERFRAMES_BEST_PRACTICES.md)：工程结构、视觉规范、时间轴、数据、音频、多语言与交付检查。
- [Remotion vs HyperFrames](./REMOTION_VS_HYPERFRAMES.md)：编程模型、工作流、渲染部署、选型标准与本仓库建议。
- [使用 Blender Python 生成视频](./BLENDER_PYTHON_VIDEO.md)：脚本化建模与动画、后台渲染、帧序列、FFmpeg 编码及 HyperFrames 混合工作流。
- [TTS 旁白方案](./TTS.md)：旁白生成、文件约定、composition 接入、字幕同步、验证流程与 Solar 历史方案。
- [音画同步方案](./AUDIO_VIDEO_SYNC.md)：音频主时钟、cue 数据结构、字幕与场景对齐、同步验证和漂移排查。

## 新增项目

新增 Remotion 项目时，提供 `src/index.ts`、`src/Root.tsx`、配置文件、依赖锁文件及检查、预览、渲染脚本。补充项目 README，并在上方“项目一览”中登记。提交前完成类型检查、人工布局检查和一次完整渲染。HyperFrames 的历史制作流程见上方专题文档。
