# QS世界大学排名前100

一个使用 Remotion 创建的动画视频，展示QS世界大学排名前100的大学。

## 内容

约 71 秒、1080x1920、30fps，中文旁白（edge-tts `zh-CN-XiaoxiaoNeural`）：

1. 开场：1,500+ 所大学上榜，MIT 连续第 15 年第一
2. 前十名：帝国理工、斯坦福并列第二，加州理工从第 10 升至第 7
3. 前 100 名的国家和地区分布（由 `src/data.ts` 统计），新南威尔士大学首次成为澳大利亚第一
4. 中国内地 6 所、中国香港 5 所
5. 第 11–100 名滚动，旁白念到时停在布宜诺斯艾利斯大学（第 84，拉美唯一）
6. 结论：香港 78%、中国内地 72% 的上榜大学名次提高

场景时长由旁白各段实测时长决定，元素在旁白念到时出现（`src/timing.ts` 的 `cue()`）。修改 `public/voiceover/narration.zh.txt` 后运行 `npm run voiceover`。

## 数据

QS World University Rankings 2027（2026 年 6 月 18 日发布），前 100 名快照在 `src/data.ts`。MIT 连续 15 年、加州理工升至第 7、UNSW 首次成为澳大利亚第一、布宜诺斯艾利斯大学为拉美唯一前 100、香港 78% 与中国内地 72% 名次上升：[QS 新闻稿](https://www.prnewswire.com/news-releases/worlds-best-universities-revealed-302803262.html)。

## 文件结构

```
data_visualization/qs_universities/
├── src/                # 当前 Remotion 入口、组件、数据和字体
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

## Remotion 移植

由早期 HyperFrames 版移植的 Remotion 实现（`src/` + `remotion.config.ts` + `tsconfig.json`）：

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
