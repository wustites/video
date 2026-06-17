# population-cn

Remotion 视频：中国各省出生人口变化 (2000-2023)

## 安装

```bash
npm install
```

## 背景音乐

Bach - Overture No. 3 In D Major (来源: archive.org)

GitHub Actions 会自动下载，本地预览需手动下载：
```bash
curl -L -o public/bgm.mp3 "https://archive.org/download/Classical-Bach-1/Bach%2002-%20Overture%20No.%203%20In%20D%20Major.mp3"
```

## 使用

```bash
# 启动预览
npm start

# 渲染视频
npm run build
```

## GitHub Actions

推送 `v*` Tag 自动构建并发布：

```bash
git tag v1.0.0
git push origin v1.0.0
```
