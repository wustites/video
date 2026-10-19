# Claude MHS 介绍视频 (claude_mhs)

Remotion 制作的中文竖屏 (1080×1920) 科技解说短视频，介绍 Anthropic 于 2026-08-27 发布的 Model Hardware Standard (MHS) 研究预览。8 段 Edge TTS 旁白（zh-CN-YunxiNeural）驱动场景时间轴。

来源：https://www.anthropic.com/news/model-hardware-standard-research-preview

## 使用

```bash
npm run voiceover    # 生成旁白
npm run dev          # Remotion Studio 预览
npm run render       # 渲染 out/claude-mhs-zh.mp4
```

## 场景

1. intro — MHS 是什么
2. problem — 集成耗时：数周～数月 → 数小时～数分钟
3. how — 标准化驱动、发现、参考文件、MCP/CLI/代码控制
4. labs — CMU（8 小时、约 3 倍）、华盛顿大学（6 台仪器 < 1 周）、HHMI 珍利亚（7 → 1）
5. quera — 激光重锁 99.3%（700 次）、约 6 秒 vs 150 秒 / 58%
6. industry — AWS、Tecan、QIAGEN、Danaher 等
7. limits — 空间推理、编程接口、安全路线图
8. outro — 申请预览，计划开源
