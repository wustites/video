# GPT-6.1 Terra 介绍视频 (gpt_6_1_terra)

HyperFrames（HTML + GSAP）制作的中文竖屏 (1080×1920) 科技解说短视频，介绍 OpenAI 于 2026-10-27（北京时间）发布的 GPT-6.1 Terra。8 段 Edge TTS 旁白（zh-CN-YunxiNeural）驱动场景时间轴：`npm run voiceover` 生成旁白后，`packages/voiceover/sync_hyperframes_timing.mjs` 把各段时长写进 `index.html`；场景内元素的出现时间按 edge-tts WordBoundary 对齐。

来源：https://x.com/OpenAI/status/2114780711664398349 · https://openai.com/index/introducing-gpt-6-1-terra/ · https://community.openai.com/t/gpt-6-1-terra-delivering-fast-and-capable-computer-use-at-a-lower-price/1409900 · https://artificialanalysis.ai/articles/gpt-6-1-terra-pushes-the-cost-efficiency-frontier

## 使用

```bash
npm run voiceover    # 生成旁白并同步场景时间
npm run dev          # HyperFrames Studio 预览
npm run check        # lint、布局、对比度检查
npm run render       # 渲染 out/gpt-6-1-terra-zh.mp4
npm run render:still # 渲染发版封面 out/cover.png（poster/index.html）
```

## 场景

1. intro — GPT-6 家族中档模型，主打电脑操作，更快更便宜
2. price — API $1 / $5（每百万 token），比 GPT-5.6 Terra 低 50%；与 GPT-6 Astra 相当、每 token 价格 1/10；速度 3× 以上
3. ale — Agents' Last Exam（中等推理强度）：Terra 57.6% / $0.29，GPT-6 Astra 57.6% / $4.82，GPT-5.6 Terra 42.6% / $0.84
4. computer — 填表、发票、工程图纸；OSWorld 2.1 中等强度追平上一代最好成绩；MMMU-Pro 接近 Astra / Sol
5. facts — 内部诱错测试 53.6% → 16.7%（低强度），最高强度 4.3%；AA-Omniscience 幻觉率 88% → 38%
6. coding — Terminal-Bench 4.0（最高强度）21.5% → 50.3%；最难任务仍推荐 GPT-6.1 Sol / GPT-6 Astra
7. safety — 准备度框架网络安全达 Critical，沿用 GPT-6 Astra 防护，提示词注入抵抗更强
8. outro — Plus / Pro / 企业版 / 教育版，ChatGPT Work、Codex，API `gpt-6.1-terra`
