# Video project releases

普通的 Remotion / HyperFrames 项目使用统一的 tag 发版流程，不再为每个项目维护独立的 Release workflow。

## Tag 格式

```bash
git tag japan_economy-1.0.1
git push origin japan_economy-1.0.1

git tag sapporo_subway-1.0.4
git push origin sapporo_subway-1.0.4
```

格式为 `<project_key>-<version>[-<variant>]`。`version` 为三段数字（例如 `1.0.1`）；项目 key 和可选 variant 只使用字母、数字和 `_`。项目 key 必须与仓库根目录下的项目目录一一对应。例如，`japan_economy-1.0.1` 只会解析到 `japan_economy/`；`solar-1.0.0-zh` 会执行 `solar/` 的 `render:zh` 脚本。当前解析器不支持任意 SemVer 预发布或构建元数据后缀。

1. 安装 Node.js 22 依赖；
2. 安装 FFmpeg；
3. 如果项目定义了 `voiceover`，安装 `edge-tts` 并生成旁白；
4. 如果项目定义了 `setup`，运行项目 setup；
5. 运行 `npm run check`（如果存在）；
6. 无 variant 时运行 `npm run render`；有 variant 时运行对应的 `npm run render:<variant>`；
7. 校验 MP4 并上传 GitHub Release。

生成的 MP3、临时时长文件和 `out/` 渲染产物不提交到 Git。旁白文本、数据、字幕和项目源代码必须提交；作为源资源使用的图片和已跟踪的时间轴快照（例如 `solar/public/voiceover/cues.*.json`）按项目约定维护，具体忽略规则见 `.gitignore`。

工作流校验 `out/` 中存在 MP4 且包含视频流，再上传 artifact 和 GitHub Release。单个 MP4 重命名为 `<project_key>-<version>[-<variant>].mp4`；多个 MP4 则在各原文件名前添加该前缀。此校验不检查旁白完整性、音画同步或画面布局。

旧的 `v<version>-<project>` tag 仅作为历史记录保留；普通项目使用 `<project_key>-<semver>`，带变体的项目使用 `<project_key>-<semver>-<variant>`。
