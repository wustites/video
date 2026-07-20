# Remotion vs HyperFrames

本文档比较两种“视频即代码”方案，并给出本仓库的技术选型建议。结论基于 2026-07-20 可用的官方文档；产品能力、版本和许可可能变化，正式采用前应重新核对。

## 结论

两者都使用浏览器技术生成视频，但抽象层不同：

- **Remotion** 把视频建模为随帧变化的 React 组件，适合已经采用 React/TypeScript、需要把视频能力嵌入 Web 产品，或需要成熟云端并行渲染方案的团队。
- **HyperFrames** 把 HTML 作为 composition 和时间轴的事实来源，以 `data-*` 描述片段与时序，并可用 GSAP、CSS、Lottie、Three.js 等驱动画面，适合 HTML 原生工作流、AI Agent 生成、命令行批处理和强调可复现输出的项目。

**对本仓库的建议：继续使用 HyperFrames。** 现有项目、检查脚本、CI、时间轴规范和多语言 composition 都已围绕 HyperFrames 建立。只有在明确需要 React 组件生态、Remotion Player 或 Remotion Lambda 时，才值得为新项目单独评估 Remotion；不建议仅为“换框架”迁移已有视频。

## 核心差异

| 维度 | Remotion | HyperFrames |
| --- | --- | --- |
| 作者格式 | React/TSX 组件 | HTML、CSS、JavaScript 与 `data-*` 属性 |
| 时间模型 | 通过 `useCurrentFrame()` 取得当前帧；composition 声明 FPS、总帧数和尺寸 | HTML 片段声明秒级起点、时长与轨道；渲染器使用虚拟时钟逐帧 seek |
| 动画表达 | 根据当前帧计算样式，常配合 `interpolate()`、`spring()` 和 React 组件组合 | GSAP timeline、CSS、Lottie、Three.js、Rive、WAAPI 等通过适配器同步到渲染时钟 |
| 组件复用 | React 组件、hooks、npm/React 生态 | HTML 片段、外部 composition、Web Components 或任意可输出 HTML 的框架 |
| 预览 | Remotion Studio；也可用 Player 嵌入 React 应用 | CLI preview/Studio；HTML 可直接用浏览器开发工具调试 |
| Web 内嵌 | `@remotion/player` 面向 React 应用，支持运行时参数化 | 可使用 HyperFrames Player；核心工作流更偏 HTML composition 与离线渲染 |
| 本地渲染 | CLI 或 Node.js 服务端渲染 | CLI 使用 Headless Chrome 捕获并交给 FFmpeg 编码 |
| 云端渲染 | 官方提供 AWS Lambda，并有 Cloud Run 与服务端渲染路径 | 官方文档强调无状态 Docker、CI 和批处理；基础设施需自行组织 |
| 确定性 | 帧驱动模型，要求动画和数据获取遵守渲染约束 | 明确以虚拟时钟和确定性适配器为设计目标，并主张相同输入产生相同字节 |
| Agent 友好度 | 官方提供 Agent Skills，React 代码也适合代码 Agent | HTML 是直接输入格式，CLI 提供 lint、inspect、JSON 输出和稳定退出码，产品定位明确面向 Agent |
| 学习成本 | React 团队低；纯设计或 HTML 团队需要学习 React 与 Remotion API | Web 前端基础即可起步；复杂动画仍需理解 GSAP、轨道和确定性约束 |
| 许可 | 使用 Remotion 自定义许可与商业定价规则，企业和云渲染场景需核对资格 | 官方称项目开源并采用 MIT/Apache-2.0；仍应逐包核对实际许可证 |

## 编程模型对照

### Remotion：画面是帧的函数

Remotion composition 是 React 组件与视频元数据的组合。组件读取当前帧，再由帧号计算位置、透明度和其他视觉属性。

```tsx
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const Title = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return <AbsoluteFill style={{opacity}}>Hello</AbsoluteFill>;
};
```

这一模型很适合把业务数据、React 状态和组件系统组合成大量参数化视频。代价是每个动态效果都必须能够由当前帧稳定重建，不能依赖真实时间或不可控的副作用。

### HyperFrames：HTML 是时间轴

HyperFrames 在普通 HTML 上增加尺寸、起点、时长和轨道等属性；视觉布局由 CSS 完成，动画可注册为受播放器控制的暂停时间轴。

```html
<div
  data-composition-id="intro"
  data-width="1920"
  data-height="1080"
  data-duration="5"
>
  <h1 id="title" data-start="0" data-duration="5" data-track-index="1">
    Hello
  </h1>
</div>

<script>
  window.__timelines = window.__timelines || {};
  const timeline = gsap.timeline({paused: true});
  timeline.from('#title', {opacity: 0, y: 40, duration: 0.6}, 0.2);
  window.__timelines.intro = timeline;
</script>
```

这一模型更接近网页创作：CSS 决定最终布局，时间属性决定片段生命周期，动画库描述进入最终布局的过程。它减少了框架专用 DSL，但开发者仍需遵守可 seek、同步构建时间轴、媒体分轨等规则。

## 如何选择

优先选择 Remotion，如果项目满足以下一项或多项：

- 产品本身是 React 应用，需要把可交互、可参数化的视频预览直接嵌入其中。
- 已有大量 React 组件、TypeScript 类型、hooks 或设计系统需要复用。
- 需要官方维护的 AWS Lambda 分片渲染路径，且可以接受 AWS 和相应许可要求。
- 团队更习惯用帧号、React 组件和声明式计算表达动画。

优先选择 HyperFrames，如果项目满足以下一项或多项：

- 希望源文件保持为可直接阅读和 diff 的 HTML/CSS，而不强制使用 React。
- 主要通过 Agent 生成和修正视频，需要非交互 CLI、结构化检查与布局审计。
- 已有 GSAP、Lottie、Three.js、Rive 或普通网页资产需要接入。
- 需要本地、Docker 或 CI 中自托管渲染，并把输出可复现性作为首要目标。
- 团队更习惯按秒、片段和轨道组织视频。

## 本仓库的落地判断

| 仓库现状 | 影响 |
| --- | --- |
| 所有项目均为 HyperFrames HTML composition | 迁移 Remotion 需要把 HTML/GSAP 时间轴重写为 React/帧计算，不能机械转换 |
| 已固定 HyperFrames CLI 版本 | 现有本地与 CI 渲染更容易复现；升级应统一回归 |
| 已有 lint、inspect、音画同步和多语言规范 | 继续使用 HyperFrames 可以直接复用质量门禁 |
| 项目以离线短视频和 GitHub Actions 发布为主 | 暂无 Remotion Player 或 Lambda 带来的决定性收益 |

因此，本仓库默认技术栈保持 HyperFrames。若未来开发“用户在网页中实时改参数并预览、提交后大规模云渲染”的视频 SaaS，可用一个独立原型同时验证以下指标，再决定是否采用 Remotion：

1. 相同模板的开发时间与代码量。
2. 预览首屏时间、seek 流畅度与长视频内存占用。
3. 单条与批量渲染耗时、失败率和基础设施成本。
4. 字体、音视频解码、透明通道和目标编码器的兼容性。
5. 许可、云资源与运维成本。

不要用两个框架各自官网的渲染速度数字直接下结论。应固定机器、Chrome/FFmpeg、分辨率、FPS、编码器、素材和并发度，用同一条代表性视频做基准测试。

## 迁移注意事项

两者概念可以映射，但代码通常不能直接复用：

| HyperFrames | Remotion 中的近似概念 |
| --- | --- |
| composition 根节点与 `data-width` / `data-height` | `<Composition>` 的 `width` / `height` |
| `data-duration`（秒） | `durationInFrames` |
| `data-start` 与轨道 | `<Sequence from={...}>` 及组件层级 |
| GSAP timeline | `useCurrentFrame()` + `interpolate()` / `spring()` |
| 外部 composition | React 子组件或嵌套 sequence |
| HTML 参数或 JSON 数据 | React props / `inputProps` |

迁移时优先保留数据、文案、媒体资源和视觉 token，再重写时间表达。不要尝试在两个运行时之间逐 tween 翻译，否则很容易把秒/帧换算、缓动、媒体 seek 和场景生命周期的细节一起带错。

## 官方资料

- [Remotion：The fundamentals](https://www.remotion.dev/docs/the-fundamentals)
- [Remotion Player](https://www.remotion.dev/docs/player)
- [Remotion Lambda](https://www.remotion.dev/docs/lambda)
- [Remotion：License, Pricing and Compliance](https://www.remotion.dev/docs/license)
- [HyperFrames：Introduction](https://hyperframes.video/docs/getting-started/introduction)
- [HyperFrames：Composition](https://hyperframes.video/docs/concepts/composition)
- [HyperFrames：Timing & tracks](https://hyperframes.video/docs/concepts/timing-and-tracks)
- [HyperFrames Docs](https://hyperframes.video/docs)
