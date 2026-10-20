# Metro de Lima

西班牙语科普短视频：介绍秘鲁利马城市轨道交通系统（Metro de Lima y Callao）。
基于 **Remotion**（React）构建，旁白使用 **Edge TTS**（微软神经语音），地图为**手绘示意地铁图**（schematic map）。

## 项目信息

- **主题**：利马地铁介绍
- **语言**：西班牙语（旁白 + 屏幕文字）
- **时长**：57 秒（旁白 54.5s + 结尾 1s 停留与 1.5s 淡出，时长随旁白自动推导）
- **画布**：1080 × 1920 竖屏（30fps）
- **默认输出**：`out/video.mp4`

## 内容结构（8 个场景）

| 场景 | 内容 | 旁白时段 |
| --- | --- | --- |
| 开场 | Metro de Lima · 秘鲁最重要的城市轨道系统 | 0–4.9s |
| 客流 | 日均 50 万+ 乘客，纵贯首都南北 | 4.9–10.0s |
| Línea 1 地图 | 示意地图 + L1 线路动画绘制：34.6 km、26 站、高架线 | 10.0–18.8s |
| Línea 1 历程 | 2011 年开通、2014 年全线；由南向北穿过 11 个区 | 18.8–24.8s |
| Línea 2 地图 | 示意地图 + L2 线路（运营段 + 在建段）：27 km、27 站、无人驾驶 | 24.8–33.1s |
| Línea 2 进度 | 2023 年首段 5 站运营，全线预计 2030 年 | 33.1–39.8s |
| 未来 | Línea 3 规划中 / Línea 4 建设中；Línea 4 连接豪尔赫·查韦斯国际机场 | 39.8–47.3s |
| 结尾 | 单一票价 S/ 1.50，与距离无关 · 地铁改变利马出行 | 47.3–54.5s |

场景时间轴由旁白实测时长自动推导（见 `public/voiceover/segment-durations.json`），场景内元素在旁白念到对应数字、年份时出现（`word-marks.json` 的 Edge TTS WordBoundary，`src/timing.ts` 的 `cue()`），重新生成旁白后无需手工同步。

## 地图

- 手绘示意地铁图（schematic map，非地理精确），纯 SVG 绘制：`src/SchematicMap.tsx`
- Línea 1：南北向竖线，南端 Villa El Salvador → 北端 Bayóvar（示意主要站点）
- Línea 2：东西向横线，西端 Puerto del Callao → 东端 Ate；运营段实线 + 在建段虚线 + 规划延伸虚线
- 换乘站：Veintiocho de Julio（L1/L2，在建）；两线交叉处用大圆点标记
- 动画：线路生长绘制（L1 自南向北、L2 运营段自西向东）、站点依次点亮
- 片尾标注 "Esquema ilustrativo"（示意图）

## 数据来源

- ATU（Autoridad de Transporte Urbano para Lima y Callao）
- Metro de Lima y Callao 官方渠道
- Wikipedia（es/en）

数据口径说明：Línea 1 长 34.6 km、26 站；Línea 2 长 27 km、27 站；日均客流约 55 万人次（Línea 1 为主）；票价 S/ 1.50 为通行口径，实际执行可能随年份调整。Línea 2 目前仅首段 5 站运营；据 2026 年 8 月 Ositrán 进度报告，Etapa 1B 预计 2029 年、Etapa 2（全线）预计 2030 年投入商业运营，视频采用 2030 年（[La República](https://larepublica.pe/sociedad/2026/08/12/linea-2-del-metro-supera-el-90-en-sus-etapas-1b-y-2-pero-los-pasajeros-aun-tendran-que-esperar-hasta-2030-303072)、[Energiminas](https://energiminas.com/2026/08/11/linea-2-del-metro-etapas-1b-y-2-superan-el-90-de-avance-en-su-construccion/)）。旧版的“拉丁美洲最长高架桥”和“非接触支付”无法核实，已删除。Línea 4 首段（机场支线）已开工（2023–2024），全线仍在规划；机场接入方案存在调整，视频按官方规划口径表述。

## 使用

```bash
npm run dev            # 启动 Remotion Studio 本地预览
npm run voiceover      # 生成旁白音频与时长文件（Edge TTS，需 Python、FFmpeg 和网络）
npm run check          # tsc 类型检查
npm run render:draft   # 草稿质量试渲染
npm run render         # 正式渲染到 out/video.mp4
```

`public/voiceover/narration.es.mp3` 和 `segment-durations.json` 是生成产物，不提交到 Git。GitHub Actions 会在类型检查和正式渲染前自动生成；本地首次运行或修改旁白后，也需要先执行 `npm run voiceover`。

## 旁白

- 文本：`public/voiceover/narration.es.txt`
- 音频：`public/voiceover/narration.es.mp3`（53.18s，按段落生成后拼接）
- 声音：Edge TTS `es-PE-CamilaNeural`（秘鲁西班牙语女声）
- 生成命令：`npm run voiceover`（调用共享脚本 `packages/voiceover/edge_narration.py`）

## 文件结构

```text
geography_transport/metro_lima/
  src/                      # Remotion composition（TSX）
    index.ts                # registerRoot 入口
    Root.tsx                # Composition 注册
    MetroLima.tsx           # 主 composition（8 场景）
    SchematicMap.tsx        # 手绘示意地铁图组件
    timing.ts               # 场景时间轴（由 segment-durations.json 推导）与动画工具
  public/
    voiceover/              # 旁白文本；MP3 与时长文件由脚本 / Action 生成
  out/video.mp4             # 渲染产物（不入库）
```
