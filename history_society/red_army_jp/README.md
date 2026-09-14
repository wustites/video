# 日本赤軍歴史解説動画 (red_army_jp)

Remotion 制作的日语竖屏 (1080×1920) 历史解说短视频,讲述日本赤军 (JRA) 从成立、海外恐怖袭击、2001 年解散到 2022 年重信房子出所的历史。结构沿用 `southern_kurils_jp`:7 段 Edge TTS 日语旁白驱动场景时间轴,重新生成旁白后时长自动对齐。

## 使用

```bash
npm install
npm run check        # TypeScript 类型检查
npm run voiceover    # 生成日语旁白 (需要 python3 + edge_tts + ffmpeg)
npm run dev          # Remotion Studio 预览
npm run render       # 正式渲染 out/red-army-ja.mp4
npm run render:draft # 低清快速预览
```

## 场景 (与旁白段落一一对应)

1. intro — 标题
2. formation — 1969–1971 成立与海外转移
3. lod — 1972 特拉维夫罗德机场乱射事件
4. hijack — 连环劫机与使馆占领 (1973/1975/1977 达卡事件)
5. dissolve — 2001 解散宣言
6. justice — 2000 逮捕、判决、2022 出所
7. outro — 历史评价
