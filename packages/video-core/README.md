# @video/core

跨视频复用且不包含具体视觉设计的基础能力。

当前模块：

- `timeline.ts`：纯函数时间轴、场景进度、透明度和入场动画计算。
- `remotion-timeline.ts`：把纯函数包装为 Remotion hooks。

项目通过 `createRemotionTimeline(sceneIds, durations, options)` 创建自己的时间轴，并继续在项目内维护场景 ID、尾帧、淡化和动画参数。共享包不应包含某个视频专用的数据、配色、布局或场景组件。
