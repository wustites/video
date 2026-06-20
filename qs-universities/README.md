# QS世界大学排名前100

一个使用 HyperFrames 技术创建的动画视频，展示QS世界大学排名前100的大学。

## 项目特点

- 使用 HyperFrames 框架创建动画视频
- 展示QS世界大学排名前10的大学（示例数据）
- 支持GSAP动画效果
- 响应式设计，适配1080x1920分辨率

## 使用方法

1. 确保已安装 HyperFrames CLI
2. 运行以下命令渲染视频：
   ```bash
   npx hyperframes render -o out/video.mp4
   ```
3. 渲染完成后，视频将保存在 `out/video.mp4`

## 渲染结果

- 文件大小：9.7 MB
- 时长：52秒
- 分辨率：1080x1920
- 特点：每页不同主题色（红、蓝、绿、橙、紫、青、红、青、橙、绿）
- 字体：Noto Sans SC（Google Fonts）
- 数据：100所大学，来自QS官网实时抓取

## 文件结构

```
qs-universities/
├── index.html          # 主要composition文件
├── meta.json           # 项目元数据
├── public/             # 静态资源目录
└── README.md           # 项目说明
```

## 自定义

- 修改 `index.html` 中的 `universities` 数组可更新大学数据
- 修改 `index.html` 中的样式可自定义外观
- 修改 `index.html` 中的GSAP时间线可调整动画效果

## 数据说明

数据来源：QS World University Rankings 2027（2026年6月18日发布）
数据获取方式：使用Playwright爬虫从 https://www.topuniversities.com/world-university-rankings 抓取
抓取时间：2026年6月20日

2027年QS排名前10：
1. 麻省理工学院 (MIT) - 100分
2. 帝国理工学院 - 99.2分（并列第2）
2. 斯坦福大学 - 99.2分（并列第2）
4. 牛津大学 - 98.6分
5. 哈佛大学 - 97.4分
6. 剑桥大学 - 97.1分
7. 加州理工学院 - 96.6分
8. 苏黎世联邦理工学院 - 96.3分（并列第8）
8. 伦敦大学学院 (UCL) - 96.3分（并列第8）
10. 新加坡国立大学 (NUS) - 96.2分

## 技术栈

- HyperFrames - 视频渲染框架
- GSAP - 动画库
- HTML/CSS/JavaScript - 前端技术