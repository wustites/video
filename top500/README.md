# 世界五百强 HyperFrames 可视化视频

一个中文竖屏数据可视化短片，基于 HyperFrames 制作，主题为 2025 年《财富》世界500强。

## 使用

```bash
npm run dev
```

渲染视频：

```bash
npm run render
```

输出文件：`out/top500-vertical.mp4`

## 内容

- 29 秒、1080x1920、30fps
- 中文标题与数据图表
- 前 10 名收入柱状排行
- 国家和地区分布
- 行业结构
- 利润视角与结论页

## 数据说明

榜单口径为 2025 年《财富》世界500强，按 2024 财年收入排名。公司收入、利润和榜单相关指标整理自《财富》/ 财富中文公开榜单页面。

## GitHub Actions 发布

推送 `v*-top500` 标签或手动运行工作流时，Actions 会检查并渲染竖屏 MP4，然后上传构建产物。

发布 Release：

```bash
git tag v1.0.0-top500
git push origin v1.0.0-top500
```

推送 `v*-top500` 标签后，工作流会创建 GitHub Release，并上传 `out/top500-vertical.mp4`。
