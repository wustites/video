# births-jp

Remotion 竖屏视频（1080x1920，30fps），讲日本各都道府县 2000–2025 年的出生人数，有中文和日文两个版本，旁白用 edge-tts。

## 使用

```bash
npm run data:update   # 从 ~/api/scripts/e-stat/datasets/prefecture-births 导入 → src/data.json（也可以传入数据集目录）
npm run voiceover     # 中日文旁白（zh-CN-XiaoxiaoNeural / ja-JP-NanamiNeural，+10%，含 WordBoundary 时间）
npm run check
npm run render:zh     # out/births-jp-zh.mp4
npm run render:ja     # out/births-jp-ja.mp4
../../scripts/normalize-loudness.sh out/*.mp4
```

## 内容

1. 2025 年出生 671,270 人，2000 年 1,190,547 人，26 年减少 44%
2. 全国 26 年柱状图：2016 年跌破 100 万，此后连续 9 年减少
3. 2025 年出生人数前十：东京 85,090 人，占全国 12.7%（约每 8 人中有 1 人）
4. 都道府县瓦片地图（2025 年 ÷ 2000 年）：47 个全部减少，22 个不到一半；秋田 35%，东京 85%
5. 出生最少的 12 个县（不满 5000 人），鸟取 2,973 人
6. 2025 年比 2024 年增加的只有 4 个（东京 +883、石川、富山、香川），其余 43 个减少

场景时长由各段旁白决定，画面元素在念到对应词时出现（`src/i18n.tsx` 的 `CUES`）。修改 `public/voiceover/narration.{zh,ja}.txt` 后运行 `npm run voiceover`；文中数字必须与 `src/data.json` 一致（`tests/review-regressions.test.mjs` 会检查）。

## 数据

厚生劳动省《人口动态统计》确定数，表 4-3「都道府県別にみた年次別出生数」，通过 e-Stat 获取（2026-10-22）。统计的是日本境内出生的日本人，按孩子住所划分都道府县。全国数使用官方全国值（47 地区合计加上住所在「外国」的人数），各都道府县数使用 47 地区的值。来源选取、修订情况和核查方法见 `~/api/scripts/e-stat/datasets/prefecture-births/README.md`。
