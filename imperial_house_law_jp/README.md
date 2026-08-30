# 皇室典范2026改正案解说视频 (imperial_house_law_jp)

Remotion 制作的日语竖屏 (1080×1920) 解说短视频,讲述 2026 年成立的《皇室典范》改正案:女性皇族婚后可保留皇籍、删除现行第 12 条、创设旧宫家男系男子养子制度,以及男系继承传统维持与先送议题。结构沿用 `red_army_jp`:7 段 Edge TTS 日语旁白驱动场景时间轴,重新生成旁白后时长自动对齐。

## 使用

```bash
npm install
npm run check        # TypeScript 类型检查
npm run voiceover    # 生成日语旁白 (需要 python + edge_tts + ffmpeg)
npm run dev          # Remotion Studio 预览
npm run render       # 正式渲染 out/imperial-house-law-ja.mp4
npm run render:draft # 低清快速预览
```

## 场景 (与旁白段落一一对应)

1. intro — 标题:79 年ぶりの本格改正
2. background — 皇族数減少と婚姻離脱ルール
3. article12 — 第 12 条削除、女性皇族の婚姻後の身分保留
4. adoption — 旧宮家男系男子の養子制度 (15 歳以上・未婚・子なし)
5. limits — 配偶者・子は一般国民、男系継承は維持
6. enactment — 2025.6 閣議決定 → 2026.7 成立
7. outro — 女性宮家など先送りされた論点
