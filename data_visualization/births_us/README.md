# 美国各州出生人数

中文竖屏数据可视化，1080 × 1920、30 fps、约 90 秒。HyperFrames 0.8.174；配音为 edge-tts `zh-CN-XiaoxiaoNeural`（+8%），字幕与画面揭示时间都取自 edge-tts WordBoundary。

## 内容

1. 开场：2016 年加州比德州多出生 86,582 人，2025 年只多 8,429 人
2. 全国折线：397.1 万（2016）→ 2021 年低点 358.4 万 → 362.0 万（2025），十年 -8.8%
3. 加州与德州两条线：加州 -18.5%，德州 -3.1%，2025 年 39.9 万对 39.0 万
4. 50 州 + 华盛顿特区瓦片地图（2016→2025 变化率）：只有北卡、南卡、田纳西、爱达荷 4 个州增加，9 个地区降幅超过 15%
5. 降幅前五：华盛顿特区 -24.3%、阿拉斯加、怀俄明、夏威夷、伊利诺伊（均超过 -20%），全国 -8.8% 作参照
6. 2025 年比上一年：32 个州增加，佛罗里达 +4,758 最多；全国仍比 2016 年少 35.0 万

## 使用

在仓库根目录 `npm ci --include=dev` 并 `pip install -r requirements-voiceover.txt`，然后进入本目录：

```bash
npm run data:update   # 从 ~/api/scripts/census/datasets/state-births 导入 → data/births.json（也可以传入数据集目录）
npm run voiceover     # edge-tts 旁白 + WordBoundary，然后运行 build.py
npm run build         # 只按现有旁白时间重建 index.html、compositions/、poster/ 和 SRT
npm run check
npm run dev
npm run render        # out/births-us-zh.mp4
npm run render:still  # 发版封面 out/cover.png
```

画面上的所有数字都由 `build.py` 从 `data/births.json` 计算；旁白里念到的数字写在 `build.py` 的 `CHECKS` 中，数据与旁白不一致时构建会报错停止。改文案请改 `public/voiceover/narration.zh.txt`，改画面请改 `build.py` 中对应的 `scene*()`，然后重新 voiceover / build。音轨只有旁白，没有配乐。

## 数据

美国人口普查局人口估计项目（PEP）的出生数，Vintage 2020（2016–2020）与 Vintage 2025（2021–2025），按母亲居住州统计，50 州加华盛顿特区，不含波多黎各（2026-10-31 获取）。**年份不是日历年**：`2025` 指 2024-07-01 至 2025-06-30，画面底部每个场景都有说明。因此不能与 NCHS / CDC WONDER 的日历年出生登记数直接比较。来源选取、年版说明和核查方法见 `~/api/scripts/census/datasets/state-births/README.md`。

片中只描述已发生的数据，不预测德州何时超过加州。`SPEC.md` 是视觉规范，`STORYLINES.md` 是备选叙事，`REVIEW.md` 是成片检查记录。
