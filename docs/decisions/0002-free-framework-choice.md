# ADR 0002：按项目自由选择视频框架

- 状态：已采纳
- 日期：2026-10-19
- 取代：[ADR 0001](./0001-remotion-as-primary-framework.md) 第 1、3、4 条中“monorepo 内一律使用 Remotion”“HyperFrames 不接入 `projects.json` 和发布流程”“两类仓库互不迁移”的限制

## 背景

ADR 0001 把框架按仓库划分：本仓库只用 Remotion，Agent 按作品生成的视频放到独立的 HyperFrames 仓库。实际做 [Claude MHS](../../science_nature/claude_mhs/) 时，这条视频按分工规则应当用 HyperFrames，却又要用本仓库的旁白脚本和发布流程。为了遵守规则，要么另建仓库，要么选不合适的框架，两种做法都不划算。

## 决定

1. 每个项目自行选择框架，目前支持 **Remotion** 和 **HyperFrames**，在 `projects.json` 中用 `framework` 字段登记（省略时为 `remotion`）。
2. 两种框架共用同一套约定：
   - 目录、`projects.json` 登记、`package.json` 中的 `check`、`dev`、`render`、`render:draft` 脚本，渲染结果写入 `out/*.mp4`；
   - 旁白统一用 `packages/voiceover` 的 Edge TTS 脚本，由旁白时长驱动场景时间；
   - 框架版本精确锁定：Remotion 全仓库一个版本；HyperFrames 项目在 `devDependencies` 中锁定 `hyperframes` 版本。
3. 只服务于 Remotion 的共享代码（`@video/core`、`remotion-config`）不强制 HyperFrames 项目使用。HyperFrames 项目用自己的脚本把 `segment-durations.json` 写进 HTML 的 `data-start` / `data-duration`（参考 `claude_mhs/sync-timing.mjs`）。
4. 已有项目可以在两种框架之间迁移，但必须在同一提交中更新 `projects.json`、项目 README，并完成一次完整渲染。
5. 账号内的独立 HyperFrames 仓库（如 [wustites/anime](https://github.com/wustites/anime)）照常保留；新作品放在哪里由作者决定。

## 如何选择

不是硬性规则，只是默认倾向：

| 倾向 Remotion | 倾向 HyperFrames |
| --- | --- |
| 同一模板批量产出、数据每期刷新、无人值守生产 | 每条视频单独设计，由 Agent 从文字、文章或设计稿生成 |
| 大量数据计算、地图投影、需要 TypeScript 类型和单元测试 | 以排版、动效和转场为主，HTML/CSS + GSAP 更直接 |
| 需要复用 React 组件或 `@video/core` | 需要使用 HyperFrames 的 registry 组件、Studio 编辑或 Agent 工作流 |

## 影响

- `scripts/validate-projects.mjs` 按 `framework` 分别校验：Remotion 项目检查 `src/Root.tsx` 和字体加载，HyperFrames 项目检查 `index.html` 和锁定的 CLI 版本。
- 发布工作流不变：仍按 tag 执行 `npm run voiceover`、`npm run check`、`npm run render`，校验 `out/` 下的 MP4。
- 维护两套运行时会带来两套检查和文档，这是有意接受的成本。
