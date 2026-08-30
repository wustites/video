# 南千島群島 — Remotion 日本語映像

南千島群島（南クリル諸島／日本でいう北方領土）を、地理、規模、自然、歴史、現在の領有権問題の順に紹介する約70秒の縦型映像です。1080×1920、30fps、日本語ナレーション付きです。

政治的立場に結びつく題材のため、ロシアによる実効支配と、日本・ロシア双方の領有権主張を区別して表記しています。地図は位置関係を伝えるための概念図で、国境線を示すものではありません。

## 実行

```bash
npm install
npm run voiceover
npm run check
npm run dev
npm run render:draft
npm run render
```

音声生成には Python の `edge-tts` と `ffmpeg` / `ffprobe` が必要です。ナレーション原稿を変更した場合、`npm run voiceover` を再実行すると、実測した各段落の長さに合わせてシーン尺が自動調整されます。

## 主な参照資料

- [日本国外務省「北方領土データ」](https://www.mofa.go.jp/mofaj/erp/rss/hoppo/page1w_000024.html) — 四島の面積、1945年時点の人口・産業
- [日本国外務省「北方領土問題に関するQ&A」](https://www.mofa.go.jp/mofaj/area/hoppo/mondai_qa.html) — 日本政府の立場、1855年条約、1956年共同宣言
- [Reuters](https://www.investing.com/news/world-news/russia-sees-no-reason-to-discuss-peace-with-japan-the-kremlin-says-3973090) — 現在の実効支配、ロシア側の立場、未締結の平和条約
- [UNESCO World Heritage Centre「Shiretoko」](https://whc.unesco.org/en/list/1193/) — オホーツク海周辺の流氷と海洋・陸上生態系

数値の基準日と出典は上記資料に準拠しています。映像内の面積は四捨五入した値です。
