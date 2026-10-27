# Video project releases

所有项目使用统一的 tag 发版流程，不再为每个项目维护独立的 Release workflow。

## Tag 格式

```bash
git tag japan_economy-1.0.1
git push origin japan_economy-1.0.1

git tag sapporo_subway-1.0.4
git push origin sapporo_subway-1.0.4
```

格式为 `<project_key>-<version>[-<variant>]`。`version` 为三段数字（例如 `1.0.1`）；项目 key 和可选 variant 只使用字母、数字和 `_`，项目目录名不得包含连字符。项目 key 必须与分类目录下的项目目录一一对应。例如，`japan_economy-1.0.1` 会解析到 `data_visualization/japan_economy/`；`solar-1.0.0-zh` 会执行 `science_nature/solar/` 的 `render:zh` 脚本。当前解析器不支持任意 SemVer 预发布或构建元数据后缀。

1. 从仓库根目录的统一 lockfile 安装 Node.js 22 依赖；
2. 安装 FFmpeg；
3. 如果项目定义了 `voiceover`，按根目录锁定的 Python 依赖生成旁白；
4. 校验统一项目清单，并运行 `npm run check`（如果存在）；
5. 无 variant 时运行 `npm run render`；有 variant 时运行对应的 `npm run render:<variant>`；
6. 校验 MP4、归一化响度；
7. 准备封面，与 MP4 一起上传 GitHub Release。

发布流程不会执行 `data:update` 或访问排行榜数据源。需要刷新数据时，应在打 tag 前显式运行项目的 `npm run data:update`，审阅并提交生成的 snapshot。

Solar 的单语言 tag 只生成对应语言的旁白；不带 variant 的 tag 只生成默认英语旁白。其余语言继续使用已提交的 cue 数据参与打包，无需为本次发布重新合成音频。

生成的 MP3、临时时长文件和 `out/` 渲染产物不提交到 Git。旁白文本、数据、字幕和项目源代码必须提交；作为源资源使用的图片和已跟踪的时间轴快照（例如 `solar/public/voiceover/cues.*.json`）按项目约定维护，具体忽略规则见 `.gitignore`。

工作流校验 `out/` 中存在 MP4、包含视频流且总时长有效；定义了 `voiceover` 的项目还必须包含音频流，之后才会上传 artifact 和 GitHub Release。单个 MP4 重命名为 `<project_key>-<version>[-<variant>].mp4`；多个 MP4 则在各原文件名前添加该前缀。此校验仍不判断旁白内容完整性、音画同步或画面布局。

## 封面

每次发版都附带一张封面，Release 资源名为 `<project_key>-<version>[-<variant>]-cover.png`。

- **项目定义了 `render:still`**：工作流执行 `npm run render:still`，脚本必须写出 `out/cover.png`，否则发版失败。新项目都应提供专门设计的封面：Remotion 项目用 `remotion still <Composition> out/cover.png --frame=<n>`；HyperFrames 项目在 `poster/index.html` 写一个单帧封面（与视频同一套配色和字体；放子目录是为了不和根 `index.html` 一起被 `hyperframes check` 当作入口），用 `hyperframes render poster --format png-sequence --fps 1` 截第一帧后移到 `out/cover.png`，参考 `science_nature/gpt_6_1_terra`。
- **没有 `render:still`**：工作流从发布的第一个 MP4 前 20 秒里用 ffmpeg `thumbnail` 滤镜挑一张有代表性的帧作为兜底封面。兜底帧可能停在动画中途，只是保证每个 Release 都有图。

封面尺寸与视频一致（竖屏 1080×1920，横屏 1920×1080）。发版前在本地运行 `npm run render:still` 检查封面；`out/` 不提交到 Git。

旧的 `v<version>-<project>` tag 仅作为历史记录保留；普通项目使用 `<project_key>-<semver>`，带变体的项目使用 `<project_key>-<semver>-<variant>`。
