# 视频项目索引

本文件记录仓库中各视频项目的名称和根目录路径。每个项目都是独立的 Remotion 工程；`cover/`、`skills/` 和根目录文档不属于视频项目。

## 数据可视化与榜单

| 项目名 | 项目路径 | 内容简介 |
| --- | --- | --- |
| AI Model Rankings | [`ai_model_rankings/`](./ai_model_rankings/) | AI 模型能力、速度与厂商分布 |
| OpenRouter Rankings | [`openrouter_rankings/`](./openrouter_rankings/) | OpenRouter 每周模型使用排名 |
| QS Universities | [`qs_universities/`](./qs_universities/) | QS 世界大学排名 |
| Top 500 | [`top500/`](./top500/) | 2025 年《财富》世界 500 强 |
| Japan Economy | [`japan_economy/`](./japan_economy/) | 日本 1985—2026 年经济指标与日经指数 |
| Population CN | [`population_cn/`](./population_cn/) | 中国各省出生人口变化 |

## 历史、社会与时事

| 项目名 | 项目路径 | 内容简介 |
| --- | --- | --- |
| Brexit Referendum | [`brexit_referendum/`](./brexit_referendum/) | 英国脱欧公投回顾 |
| Cloudflare History | [`cloudflare_history/`](./cloudflare_history/) | Cloudflare 发展历程 |
| Red Army JP | [`red_army_jp/`](./red_army_jp/) | 日本赤军历史 |
| Southern Kurils JP | [`southern_kurils_jp/`](./southern_kurils_jp/) | 南千岛群岛介绍 |
| Imperial House Law JP | [`imperial_house_law_jp/`](./imperial_house_law_jp/) | 皇室典范改正议题 |

## 地理与交通

| 项目名 | 项目路径 | 内容简介 |
| --- | --- | --- |
| Metro de Lima | [`metro_lima/`](./metro_lima/) | 秘鲁利马地铁系统介绍 |
| Sapporo Subway | [`sapporo_subway/`](./sapporo_subway/) | 日本札幌市营地铁介绍 |

## 科学与自然

| 项目名 | 项目路径 | 内容简介 |
| --- | --- | --- |
| Kakeya Conjecture | [`kakeya_conjecture/`](./kakeya_conjecture/) | 挂谷猜想科普动画 |
| Solar System | [`solar/`](./solar/) | 太阳系科普动画 |

## 创意与品牌

| 项目名 | 项目路径 | 内容简介 |
| --- | --- | --- |
| Apple | [`apple/`](./apple/) | 水果苹果创意介绍 |

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
