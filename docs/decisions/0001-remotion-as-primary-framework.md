# ADR 0001：以 Remotion 作为主力视频框架

- 状态：部分被 [ADR 0002](./0002-free-framework-choice.md) 取代（第 1、3、4 条的框架限制已取消，每个项目可自由选择 Remotion 或 HyperFrames）
- 日期：2026-10-14
- 取代：[Remotion vs HyperFrames](../REMOTION_VS_HYPERFRAMES.md) 2026-07-20 版中“继续使用 HyperFrames”的结论

## 背景

本仓库在约三个月内整体切换过两次框架。两次迁移提交都只记录了改了什么，没有记录原因；本记录根据提交历史补齐背景，避免再次在缺少依据的情况下迁移。

| 阶段 | 时间 | 关键提交 | 经过 |
| --- | --- | --- | --- |
| Remotion 起步 | 2026-06-13 – 06-18 | `af36ae1` | top500、solar、population_cn 三个项目；CI 连续修复 GL 渲染器、Node 版本和音频下载问题。 |
| 转向 HyperFrames | 2026-06-18 | `0a05980` | 当天整体迁移为 HTML + GSAP，CI 改用 hyperframes CLI。 |
| HyperFrames 时期 | 2026-06-18 – 07-20 | `750cc44`、`e8e3c4e` | Solar 的 Three.js 先换成 Canvas 2D 后又恢复，并需适配静态分析；字体多次修复。比较文档结论为继续使用 HyperFrames。 |
| 新项目回到 Remotion | 2026-08-02 起 | `156f85a` | metro_lima 起，按旁白时长驱动、d3-geo/OSM 地图和数据叙事类新项目都用 Remotion 编写，两套框架并存。 |
| 全部移植到 Remotion | 2026-09-07 | `38c9dec` | 剩余 8 个 HyperFrames 项目重写为 Remotion；HyperFrames 源文件保留但不再使用。 |
| 共享层建设 | 2026-09-14 起 | `952d82a`、`f44f52d` | npm workspace、`@video/core`、共享旁白脚本与 Remotion 配置。 |

由历史推断的迁移动因：

- 第一次（→ HyperFrames）：早期 Remotion CI 环境问题较多，当时内容以 GSAP 式动画为主。
- 第二次（→ Remotion）：内容转向旁白驱动的数据叙事和地图，React/TypeScript/d3 更顺手；维护两套运行时、两套检查和两套文档的成本持续上升。决定是由新项目的需求带动的，不是因为 HyperFrames 有某个具体缺陷。

## 决定

1. Remotion 是本仓库唯一的主力框架。新项目默认使用 Remotion，并通过 `@video/core` 复用时间轴和渲染配置。
2. 删除已不再使用的 HyperFrames 源文件（`index.html`、`compositions/`、`hyperframes.json`、`meta.json` 及配套的 `public/*.js`）。需要时可从 `742918d`（清理前最后一个提交）恢复，例如 `git show 742918d:science_nature/solar/index.html`。
3. 本仓库内，HyperFrames 只用于独立于 monorepo 主流程的单件作品（例如 `cover/` 下的纯 HTML 封面），不接入 `projects.json`、CI 发布流程和 `@video/core`。
4. 账号范围内按用途分工（2026-10-14 补充）：模板化、批量或自动化生产的视频用 Remotion（本仓库、[ZeroMarker/daily](https://github.com/ZeroMarker/daily)）；Agent 从文字、音乐或设计稿直接生成、按作品维护的视频（论文科普、品牌片、MV、绘本动画等）用 HyperFrames，放在独立仓库并自带发布流程（如 [wustites/anime](https://github.com/wustites/anime)）。两类仓库互不迁移；详见 [账号范围的框架分工](../TECH_SELECTION.md#账号范围的框架分工)。
5. 在 Remotion 之内按内容类型细分的技术选型见 [按内容类型的技术选型](../TECH_SELECTION.md)。
6. HyperFrames 相关文档移入 `docs/archive/` 或标注为历史内容。

## 理由

- 18 个项目、发布流程、音频校验和共享包都建立在 Remotion 上，再迁移一次需要逐个重写动画，没有对应收益。
- 现有内容（按旁白实测时长驱动的场景、数据图表、地图）适合“画面是帧的函数”的模型，并能复用 TypeScript 类型和 React 组件。
- 一套运行时意味着一套检查、一套字体方案和一套文档。

## 重新评估的条件

只有满足下列条件之一，并且先用**一个新项目**试点（不回迁已有项目），才重新讨论框架：

- Remotion 许可成为实际成本（例如以公司名义使用，且超出免费范围）。
- 本仓库的新内容以 Agent 从零生成、按作品维护的视频为主（这类内容按第 4 条应放到独立的 HyperFrames 仓库，而不是迁移本仓库）。
- Remotion 在字体、渲染确定性或 CI 上反复出现问题，而同一条代表性视频在固定环境下的基准对比显示另一方案能解决。

任何框架迁移都必须新增一份 ADR，写明动因、对比数据和回退方案。
