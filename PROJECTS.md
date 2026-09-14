# 视频项目索引

本文件记录仓库中各视频项目的名称和根目录路径。每个项目都是独立的 Remotion 工程；`cover/`、`skills/` 和根目录文档不属于视频项目。

## 数据可视化与榜单

| 项目名 | 项目路径 | 内容简介 |
| --- | --- | --- |
| AI Model Rankings | [`data_visualization/ai_model_rankings/`](./data_visualization/ai_model_rankings/) | AI 模型能力、速度与厂商分布 |
| OpenRouter Rankings | [`data_visualization/openrouter_rankings/`](./data_visualization/openrouter_rankings/) | OpenRouter 每周模型使用排名 |
| QS Universities | [`data_visualization/qs_universities/`](./data_visualization/qs_universities/) | QS 世界大学排名 |
| Top 500 | [`data_visualization/top500/`](./data_visualization/top500/) | 2025 年《财富》世界 500 强 |
| Japan Economy | [`data_visualization/japan_economy/`](./data_visualization/japan_economy/) | 日本 1985—2026 年经济指标与日经指数 |
| Population CN | [`data_visualization/population_cn/`](./data_visualization/population_cn/) | 中国各省出生人口变化 |

## 历史、社会与时事

| 项目名 | 项目路径 | 内容简介 |
| --- | --- | --- |
| Brexit Referendum | [`history_society/brexit_referendum/`](./history_society/brexit_referendum/) | 英国脱欧公投回顾 |
| Cloudflare History | [`history_society/cloudflare_history/`](./history_society/cloudflare_history/) | Cloudflare 发展历程 |
| Red Army JP | [`history_society/red_army_jp/`](./history_society/red_army_jp/) | 日本赤军历史 |
| Southern Kurils JP | [`history_society/southern_kurils_jp/`](./history_society/southern_kurils_jp/) | 南千岛群岛介绍 |
| Imperial House Law JP | [`history_society/imperial_house_law_jp/`](./history_society/imperial_house_law_jp/) | 皇室典范改正议题 |

## 地理与交通

| 项目名 | 项目路径 | 内容简介 |
| --- | --- | --- |
| Metro de Lima | [`geography_transport/metro_lima/`](./geography_transport/metro_lima/) | 秘鲁利马地铁系统介绍 |
| Sapporo Subway | [`geography_transport/sapporo_subway/`](./geography_transport/sapporo_subway/) | 日本札幌市营地铁介绍 |

## 科学与自然

| 项目名 | 项目路径 | 内容简介 |
| --- | --- | --- |
| Kakeya Conjecture | [`science_nature/kakeya_conjecture/`](./science_nature/kakeya_conjecture/) | 挂谷猜想科普动画 |
| Solar System | [`science_nature/solar/`](./science_nature/solar/) | 太阳系科普动画 |

## 创意与品牌

| 项目名 | 项目路径 | 内容简介 |
| --- | --- | --- |
| Apple | [`creative_brand/apple/`](./creative_brand/apple/) | 水果苹果创意介绍 |

## 发布标签

GitHub Actions 使用项目目录名作为 `project_key`：

```text
<project_path>-<semver>[-<variant>]
```

例如：

```bash
git tag japan_economy-1.0.1
git push origin japan_economy-1.0.1

git tag solar-1.0.0-zh
git push origin solar-1.0.0-zh
```

具体的渲染、旁白生成和 Release 流程见 [GitHub Actions 发布说明](./README.md#github-actions-发布)。
