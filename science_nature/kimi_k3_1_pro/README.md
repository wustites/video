# Kimi K3.1 Pro 介绍视频 (kimi_k3_1_pro)

HyperFrames（HTML + GSAP）制作的中文竖屏 (1080×1920) 科技解说短视频，介绍月之暗面于 2026-10-24（北京时间）发布的 Kimi K3.1 Pro。8 段 Edge TTS 旁白（zh-CN-YunxiNeural）驱动场景时间轴：`npm run voiceover` 生成旁白后，`packages/voiceover/sync_hyperframes_timing.mjs` 把各段时长写进 `index.html`。

来源：https://x.com/Kimi_Moonshot/status/2113680701770068067 · https://www.kimi.ai/blog/kimi-k3-1-pro

## 使用

```bash
npm run voiceover    # 生成旁白并同步场景时间
npm run dev          # HyperFrames Studio 预览
npm run check        # lint、布局、对比度检查
npm run render       # 渲染 out/kimi-k3-1-pro-zh.mp4
```

## 场景

1. intro — K3.1 系列首款，最强 3T 级开源权重模型
2. specs — 2.8T 总参 / 104B 激活 MoE、1M 上下文、多模态、Highspeed 2–3×
3. bench — Terminal-Bench 4.0：65.7%（Opus 5.5 66.4%、GPT-6 Astra 58.2%）；Kimi Code Bench 55.95 → 61.2
4. coding — Unity / Unreal / Godot；人体行走模拟器（36 处错误、11.2 秒）
5. cad — BenchCAD 92.7%（Opus 5.5 96.2%、GPT-6 Astra 95.9%），Blender / CAD 参数化建模
6. finance — OfficeQA Pro v2 64.4、建模 +7.2、研究 +11.6、运营 4.2×、幻觉率 23.4% → 8.3%
7. safety — 剔除网络安全数据，xdev-bench-hard 90.5% → 81.0%
8. outro — Kimi.ai / Work / Code / API 上线，11 月 4 日前开源权重
