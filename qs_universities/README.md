# QS世界大学排名前100

一个使用 Remotion 创建的动画视频，展示QS世界大学排名前100的大学。

## 项目特点

- 使用 Remotion 框架创建动画视频
- 展示已提交快照中的 100 所大学，每页 10 所
- 使用按帧驱动的动画效果
- 固定1080x1920竖屏画布

## 使用方法

1. 运行检查：`npm run check`
2. 运行以下命令渲染视频：
   ```bash
   npm run render
   ```
3. 渲染完成后，视频将保存在 `out/video.mp4`

## 渲染结果

- 时长：52秒
- 分辨率：1080x1920
- 特点：每页不同主题色（红、蓝、绿、橙、紫、青、红、青、橙、绿）
- 字体：通过 `@remotion/google-fonts` 加载的 Noto Sans SC
- 数据：100所大学，使用已提交的静态快照，渲染时不抓取

## 文件结构

```
qs_universities/
├── src/                # 当前 Remotion 入口、组件、数据和字体
├── index.html          # 历史 HyperFrames composition
├── meta.json           # 项目元数据
├── public/             # 静态资源目录
└── README.md           # 项目说明
```

## 自定义

- 修改 `src/data.ts` 中的 `UNIVERSITIES` 数组可更新大学数据
- 修改 `src/QsUniversities.tsx` 中的样式可自定义外观
- 修改 `src/QsUniversities.tsx` 中的帧时间轴可调整动画效果

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

- Remotion - 视频渲染框架
- React / TypeScript - 组件与动画
- HyperFrames / GSAP - 保留的历史实现

## Remotion 移植

HyperFrames `index.html` 之外，新增 Remotion 实现（`src/` + `remotion.config.ts` + `tsconfig.json`），原文件保持不动：

- `src/data.ts` — 100 所大学静态数组，按 `PER_PAGE=10` 切分为 10 页；每页主题色（`PAGE_COLORS`，对应原 `.page-N` 变量）。
- `src/QsUniversities.tsx` — 主合成：帧索引分页（每页 150 帧/5s，52s@30fps 共 1560 帧，末页吸收 2s 尾巴）；
  条目以 `i*0.12*30` 帧 stagger 经 `spring` 入场（替代 GSAP `fromTo` + `power3.out`），页间 0.6s 交叉淡入淡出；
  前 10 名排名保持金色 `.rank-top10` 样式；无音频。
- `src/Root.tsx` + `src/index.ts` — 注册 `QsUniversities` 合成（1080x1920@30fps）；`src/fonts.ts` 经 `@remotion/google-fonts` 加载 Noto Sans SC。

```bash
npm run dev            # remotion studio
npm run check          # tsc --noEmit
npm run render         # remotion render QsUniversities out/video.mp4
npm run render:draft   # 草稿预览 out/preview.mp4
```
