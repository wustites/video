# 改版待办

来源：2026-10-19 对各项目最新 Release 的质量检查（抽帧 + ffmpeg 响度、黑场、静止画面检测），以及按 [ADR 0002](./decisions/0002-free-framework-choice.md) 对框架匹配度的评估。完成一项就勾掉，并在括号里写上提交或 tag。

## 严重：已发布版本有明显错误

- [x] **cloudflare_history**：v1.0.1 中文全部显示为方框。已迁移到 HyperFrames 并修复字体（`cloudflare_history-1.1.0`）。
- [x] **metro_lima**：v1.0.0 主标题深色字压在深色背景上，几乎看不见；32 秒处“27 km / 27 estaciones”压在卡片上。现有源码标题已正常；上移 Línea 2 特性卡片，并错开 Ate / Hermilio Valdizán 站名；SVG 站名改用 Noto Sans（`metro_lima-1.0.2`）。
- [x] **solar**：地球贴图像带条纹的气态行星；金星中心有黑洞状瑕疵；字幕压在行星上（zh 17 秒）；土星标题与星球重叠。每颗行星改用各自的程序化贴图；相机改为对准倾斜轨道上行星的世界坐标（之前天王星等会偏到字幕区）；标题和字幕区加暗角，字幕加底板（`solar-1.1.0-*`）。

## 中等

- [x] **场景转场重影**：前后场景的标题在同一位置同时淡入淡出，中间帧文字叠在一起。见 top500 16 秒、openrouter_rankings 25 秒、southern_kurils_jp 49 秒。三者都改为先出后进；`@video/core` 的 `sceneOpacityAt` 一并修改，red_army_jp、imperial_house_law_jp 下次发版时生效（`top500-1.0.1`、`openrouter_rankings-1.0.1-*`、`southern_kurils_jp-1.0.1`）。
- [x] **openrouter_rankings**：环形图中心“73.9万亿”折行，“亿”掉到下一行。数字和单位分两行（`openrouter_rankings-1.1.0-*`）。
- [x] **ai_model_rankings**：19 秒“速度 vs 智能”散点图的点和标签全挤在左上角，坐标比例有问题。坐标轴改为按数据范围取整并加刻度网格，重合的点合并标签，标签做碰撞避让；图表加高；转场也改为先出后进（`ai_model_rankings-1.0.1-*`）。
- [x] **ai_model_rankings**：前 15 名列表的第 15 行贴着底部进度条（`ai_model_rankings-1.1.0-*`）。
- [x] **无声视频**：ai_model_rankings、openrouter_rankings、kakeya_conjecture、population_cn、qs_universities、top500 的音轨为空（−70 LUFS）。加背景音乐或旁白。ai_model_rankings、openrouter_rankings、top500 已加 edge-tts 旁白并更新数据（2.0.0）；kakeya_conjecture、population_cn、qs_universities 也已加旁白并改版（2.0.0）。
- [x] **响度不统一**：各视频从 −16.5 到 −23.2 LUFS 不等。在发布流程中加响度归一化（目标约 −14 LUFS），cloudflare_history（−20.2）和 brexit_referendum（−21.4）偏小。 发布流程已加入 `scripts/normalize-loudness.sh`（两遍 loudnorm，−14 LUFS / −1.5 dBTP），之后的每次发版自动生效；旧 Release 需要重新发版才会更新。

## 较轻

- [ ] **竖屏正文字号偏小**（约 20–26px）：brexit_referendum、japan_economy、qs_universities、population_cn、red_army_jp。
- [ ] **画面下半部分空**：brexit_referendum、ai_model_rankings 内容集中在上方约 55%（ai_model_rankings 已在 1.1.0 处理）。
- [ ] **长时间静止**：brexit_referendum 128 秒中约 94 秒几乎不动；japan_economy、red_army_jp 也超过 60 秒。
- [ ] **shandong_universities**：30 秒东营地图左上角有一条多余的直线。
- [x] **southern_kurils_jp**：开场岛屿图形被裁掉一半。随内容优化一并修复（`southern_kurils_jp-1.1.0`）。

## 框架迁移（改版时顺带）

只在项目本来就要大改时迁移，不单独批量迁移。

- [x] **cloudflare_history** → HyperFrames（`cloudflare_history-1.1.0`）。
- [x] **apple** → HyperFrames，同时改版：去掉场景间的黑场、改由旁白段落驱动时间轴、核对文案事实（2.0.0）。
- [ ] red_army_jp、imperial_house_law_jp、southern_kurils_jp：结构是简单的卡片叙事，适合 HyperFrames；目前没有明显问题，下次改版时再迁移。
- 两可，暂不迁移：brexit_referendum、japan_economy。
