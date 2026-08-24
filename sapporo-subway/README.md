# 札幌市営地下鉄 (Sapporo Subway)

日语科普短视频：介绍北海道札幌市的城市轨道交通系统（札幌市営地下鉄）。
基于 **Remotion**（React）构建，旁白使用 **Edge TTS**（日语神经语音），地图为**手绘示意地铁图**（schematic map）。

## 项目信息

- **主题**：札幌地铁介绍
- **语言**：日语（旁白 + 屏幕文字）
- **时长**：约 87 秒（旁白 87.05s + 结尾淡出，时长随旁白自动推导）
- **画布**：1080 × 1920 竖屏（30fps）
- **默认输出**：`out/video.mp4`

## 内容结构（8 个场景）

| 场景 | 内容 | 旁白时段 |
| --- | --- | --- |
| 开场 | 札幌市営地下鉄 · 全国第四、三大都市圈以外首座地下铁 | 0–12.9s |
| 系统概览 | 3 线路于大通交汇，总延展 48 km | 12.9–24.1s |
| 南北線地图 | 示意地图 + 绿线绘制：14.3 km、16 站，五轮之年（1971）开业 | 24.1–35.3s |
| 東西線地图 | 示意地图 + 橙线绘制：20.1 km、19 站，全线最长、最多车站 | 35.3–47.9s |
| 東豊線地图 | 示意地图 + 天蓝线绘制：13.6 km、14 站，1988 年开业的最新线路 | 47.9–59.5s |
| 札幌方式 | 中央案内轨道橡胶胎驱动；南平岸—真駒内高架段覆铝壳雪棚 | 59.5–69.7s |
| 利用情况 | 日均乘车人员约 63 万人；全站设置站台门 | 69.7–80.5s |
| 结尾 | 普通运赁 1 区 210 日元起 · SAPICA/交通系 IC 对应 | 80.5–87s |

场景时间轴由旁白实测时长自动推导（见 `public/voiceover/segment-durations.json`），重新生成旁白后无需手工同步。

## 地图

- 手绘示意地铁图（schematic map，非地理精确），纯 SVG 绘制：`src/SapporoSchematicMap.tsx`
- 南北線（緑 N）：x=540 纵贯，北=麻生 → 南=真駒内
- 東西線（橙 T）：y=990 横贯，西=宮の沢 → 東=新さっぽろ
- 東豊線（空色 H）：斜贯，北=栄町 → 南=福住
- 换乘站：大通（三线交汇）、さっぽろ（南北/东丰）
- 动画：线路生长绘制、站点依次点亮
- 片尾标注 "図は概念図です"（示意图）

## 数据来源

- 札幌市交通局（官方运赁、经营数据）
- Wikipedia（ja）：札幌市営地下鉄、南北線、東西線、東豊線
- 车站编号：南北線 N、東西線 T、東豊線 H（2006 年起）

数据口径说明：三线合计 48 km、46 站（去重换乘站）；南北線 14.3 km/16 站、東西線 20.1 km/19 站、東豊線 13.6 km/14 站；一日平均乘车人员 62.9 万人（2024 年度）；普通乘车料金 210 日元为 2024-12-01 修订后的 1 区成人票价。全线路均为案内轨道式（中央橡胶胎，「札幌方式」），全站設置式站台门 2017 年完成。

## 使用

```bash
npm run check          # tsc 类型检查
npm run dev            # 启动 Remotion Studio 本地预览
npm run voiceover      # 重新生成旁白音频（Edge TTS，需网络）
npm run render:draft   # 草稿质量试渲染
npm run render         # 正式渲染到 out/video.mp4
```

## 旁白

- 文本：`public/voiceover/narration.ja.txt`
- 音频：`public/voiceover/narration.ja.mp3`（87.05s，按段落生成后拼接）
- 声音：Edge TTS `ja-JP-NanamiNeural`（日语女声）
- 生成命令：`python3 scripts/gen_voiceover.py`（或 `npm run voiceover`）

## 文件结构

```text
sapporo-subway/
  src/                      # Remotion composition（TSX）
    index.ts                # registerRoot 入口
    Root.tsx                # Composition 注册
    SapporoSubway.tsx       # 主 composition（8 场景）
    SapporoSchematicMap.tsx # 手绘示意地铁图组件
    timing.ts               # 场景时间轴（由 segment-durations.json 推导）与动画工具
  scripts/                  # 音频生成脚本
    gen_voiceover.py        # Edge TTS 旁白生成 + 拼接
  public/
    voiceover/              # 旁白文本与音频
  out/video.mp4             # 渲染产物（不入库）
```
