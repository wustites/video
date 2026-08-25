# Video project releases

普通的 Remotion / HyperFrames 项目使用统一的 tag 发版流程，不再为每个项目维护独立的 Release workflow。

## Tag 格式

```bash
git tag japan-economy-1.0.1
git push origin japan-economy-1.0.1

git tag sapporo-subway-1.0.4
git push origin sapporo-subway-1.0.4
```

格式为 `<project_directory>-<semver>`。Action 会从 tag 解析项目目录，验证 `package.json`、`package-lock.json` 和 `npm run render`，然后执行：

1. 安装 Node.js 22 依赖；
2. 安装 FFmpeg；
3. 如果项目定义了 `voiceover`，安装 `edge-tts` 并生成旁白；
4. 如果项目定义了 `setup`，运行项目 setup；
5. 运行 `npm run check`（如果存在）；
6. 运行 `npm run render`；
7. 校验 MP4 并上传 GitHub Release。

生成的 MP3、时长 JSON、图片和 `out/` 目录不提交到 Git。旁白文本、数据、字幕和项目源代码必须提交。

## 特殊项目

- `solar` 保留多语言 workflow，支持按语言选择性渲染。
- `kakeya-conjecture` 不是标准 npm 项目，保留自己的横屏校验与发布 workflow。

旧的 `v<version>-<project>` tag 仅作为历史记录保留；新版本统一使用 `<project>-<semver>`。
