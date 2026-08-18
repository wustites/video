# Metro de Lima

西班牙语科普短视频：介绍秘鲁利马城市轨道交通系统（Metro de Lima y Callao）。
基于 **Remotion**（React）构建，旁白使用 **Edge TTS**（微软神经语音），地图为**手绘示意地铁图**（schematic map）。

## 项目信息

- **主题**：利马地铁介绍
- **语言**：西班牙语（旁白 + 屏幕文字）
- **时长**：56 秒
- **画布**：1080 × 1920 竖屏（30fps）
- **默认输出**：`out/video.mp4`

## 内容结构（8 个场景）

| 场景 | 内容 | 旁白时段 |
| --- | --- | --- |
| 开场 | Metro de Lima · 秘鲁最重要的城市轨道系统 | 0–4.9s |
| 客流 | 日均 50 万+ 乘客，纵贯首都南北 | 4.9–10.0s |
| Línea 1 地图 | 示意地图 + L1 线路动画绘制：34.6 km、26 站、高架线 | 10.0–18.8s |
| Línea 1 纪录 | 2011 年开通、2014 年全线；拉丁美洲最长高架地铁 | 18.8–25.4s |
| Línea 2 地图 | 示意地图 + L2 线路（运营段 + 在建段）：27 km、27 站、无人驾驶 | 25.4–33.7s |
| Línea 2 进度 | 2023 年首段运营，全线预计 2028 年（Callao → Ate） | 33.7–39.3s |
| 未来 | Línea 3 / Línea 4 规划中；连接豪尔赫·查韦斯国际机场 | 39.3–45.8s |
| 结尾 | 单一票价 S/ 1.50 · 无接触支付 · 地铁改变利马出行 | 45.8–52.2s |

场景时间轴与旁白逐段对齐（实测时长见 `public/voiceover/segment-durations.json`）。

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

数据口径说明：Línea 1 长 34.6 km、26 站；Línea 2 长 27 km、27 站；日均客流约 55 万人次（Línea 1 为主）；票价 S/ 1.50 为通行口径，实际执行可能随年份调整。Línea 2 全线开通年份有 2027/2028 两种说法，视频采用 2028 年。

## 使用

```bash
npm run check          # tsc 类型检查
npm run dev            # 启动 Remotion Studio 本地预览
npm run voiceover      # 重新生成旁白音频（Edge TTS，需网络）
npm run render:draft   # 草稿质量试渲染
npm run render         # 正式渲染到 out/video.mp4
```

## 旁白

- 文本：`public/voiceover/narration.es.txt`
- 音频：`public/voiceover/narration.es.mp3`（52.18s，按段落生成后拼接）
- 声音：Edge TTS `es-PE-CamilaNeural`（秘鲁西班牙语女声）
- 生成命令：`python scripts/gen_voiceover.py`（或 `npm run voiceover`）

## 文件结构

```text
metro-lima/
  src/                      # Remotion composition（TSX）
    index.ts                # registerRoot 入口
    Root.tsx                # Composition 注册
    MetroLima.tsx           # 主 composition（8 场景）
    SchematicMap.tsx        # 手绘示意地铁图组件
    timing.ts               # 场景时间轴与动画工具
  scripts/                  # 音频生成脚本
    gen_voiceover.py        # Edge TTS 旁白生成 + 拼接
  public/
    voiceover/              # 旁白文本与音频
  out/video.mp4             # 渲染产物（不入库）
```
