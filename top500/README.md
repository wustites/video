# 世界五百强 Remotion 可视化视频

一个中文竖屏数据可视化短片，基于 Remotion 制作，主题为 2025 年《财富》世界500强。

## 使用

```bash
npm install
npm run start
```

渲染视频：

```bash
npm run render
```

输出文件：`out/top500-vertical.mp4`

## 更换网络音频

编辑 `render-props.json` 里的 `audioUrl`，删除旧缓存 `public/audio/network-audio.mp3` 后运行：

```bash
npm run render
```

默认音频来源：Wikimedia Commons `Beat_electronic.ogg`，Public Domain。
默认直链：`https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3c/Beat_electronic.ogg/Beat_electronic.ogg.mp3`

## 内容

- 29 秒、1080x1920、30fps
- 网络音频轨，默认使用 Wikimedia Commons Public Domain 节拍音频
- 中文标题与数据图表
- 前 10 名收入柱状排行
- 国家和地区分布
- 行业结构
- 利润视角与结论页

## 数据说明

榜单口径为 2025 年《财富》世界500强，按 2024 财年收入排名。公司收入、利润和榜单相关指标整理自《财富》/ 财富中文公开榜单页面。

## GitHub Actions 发布

推送到 `main`/`master` 或打开 PR 时，Actions 会自动安装依赖、缓存网络音频、类型检查、渲染海报和竖屏 MP4，并上传构建产物。

发布 Release：

```bash
git tag v1.0.0
git push origin v1.0.0
```

推送 `v*` 标签后，工作流会创建 GitHub Release，并上传 `out/top500-vertical.mp4` 与 `out/poster-vertical.png`。

Actions 会在 Ubuntu runner 中安装 `fonts-noto-cjk`，确保中文标题和图表文字能正常渲染。
