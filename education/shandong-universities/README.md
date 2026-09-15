# 山东本科院校 · Remotion 竖屏版

1080×1920 竖屏视频：真实山东省地图速览（DataV GeoAtlas 省界与 16 地级市分区、地级市行政中心标记）、16 地市快速列举、每个地市最多 5 所代表性本科院校、中文 Edge TTS 旁白。

```bash
npm install
npm run voiceover   # 重新生成中文旁白与分段时长（联网调用 edge-tts）
npm run check
npm run dev
npm run render:draft
```

旁白声音：`zh-CN-XiaoxiaoNeural`。具体招生计划、专业组和录取要求请以当年官方招生章程为准。

## 地图数据

地图不是手绘示意，而是基于自然资源部行政区划边界（阿里 DataV GeoAtlas，adcode 370000）生成：

| 文件 | 内容 |
| --- | --- |
| `data/shandong-370000.json` | 山东省省界（MultiPolygon，含岛屿） |
| `data/shandong-370000-full.json` | 16 个地级市边界 |
| `scripts/gen_geo.py` | 简化（Douglas-Peucker）→ 等距圆柱投影（含纬度余弦修正）→ 行政中心标记校验 → 标签防重叠排版 → 生成数据 |
| `src/shandongGeo.ts` | 生成结果：viewBox 坐标系内的省界/地市 path、标记点、标签点 |

修改或更新边界后重新生成：

```bash
python3 scripts/gen_geo.py
npm run check
```

生成脚本内置校验：每个地市行政中心点必须落在该市（简化后）边界内，否则回退到多边形质心；全部标签两两不重叠、不压住任何标记点。