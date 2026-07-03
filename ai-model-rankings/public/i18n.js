window.AI_MODEL_RANKINGS_I18N = {
  shared: {
    models: [
      { rank: 1, name: "Claude Fable 5", providerKey: "anthropic", score: 60, speed: null, color: "#D97706" },
      { rank: 2, name: "Claude Opus 4.8", providerKey: "anthropic", score: 56, speed: 57, color: "#D97706" },
      { rank: 3, name: "GPT-5.5 (xhigh)", providerKey: "openai", score: 55, speed: 69, color: "#10B981" },
      { rank: 4, name: "Claude Opus 4.7", providerKey: "anthropic", score: 54, speed: 45, color: "#D97706" },
      { rank: 5, name: "GPT-5.5 (high)", providerKey: "openai", score: 53, speed: 70, color: "#10B981" },
      { rank: 6, name: "GLM-5.2 (max)", providerKey: "zai", score: 51, speed: 114, color: "#8B5CF6" },
      { rank: 7, name: "GPT-5.5 (medium)", providerKey: "openai", score: 50, speed: 69, color: "#10B981" },
      { rank: 8, name: "Gemini 3.5 Flash", providerKey: "google", score: 50, speed: 163, color: "#3B82F6" },
      { rank: 9, name: "Claude Sonnet 4.6", providerKey: "anthropic", score: 47, speed: 53, color: "#D97706" },
      { rank: 10, name: "Gemini 3.1 Pro", providerKey: "google", score: 46, speed: 140, color: "#3B82F6" },
      { rank: 11, name: "Qwen3.7 Max", providerKey: "alibaba", score: 46, speed: 203, color: "#EC4899" },
      { rank: 12, name: "MiniMax-M3", providerKey: "minimax", score: 44, speed: 86, color: "#F97316" },
      { rank: 13, name: "DeepSeek V4 Pro", providerKey: "deepseek", score: 44, speed: 76, color: "#14B8A6" },
      { rank: 14, name: "GPT-5.3 Codex", providerKey: "openai", score: 44, speed: 89, color: "#10B981" },
      { rank: 15, name: "Kimi K2.6", providerKey: "kimi", score: 43, speed: 47, color: "#EF4444" }
    ],
    scatterKeys: [
      "Claude Opus 4.8",
      "GPT-5.5 (xhigh)",
      "GLM-5.2 (max)",
      "Gemini 3.5 Flash",
      "Qwen3.7 Max",
      "MiniMax-M3",
      "DeepSeek V4 Pro",
      "GPT-5.3 Codex",
      "Kimi K2.6",
      "MiMo-V2.5-Pro",
      "Nex-N2-Pro",
      "DeepSeek V4 Flash",
      "GPT-5.4 mini",
      "Grok Build 0.1",
      "Step 3.7 Flash",
      "Mercury 2"
    ],
    scatterExtra: [
      { name: "MiMo-V2.5-Pro", providerKey: "xiaomi", score: 42, speed: 44, color: "#F59E0B" },
      { name: "Nex-N2-Pro", providerKey: "nexagi", score: 41, speed: 127, color: "#6366F1" },
      { name: "DeepSeek V4 Flash", providerKey: "deepseek", score: 40, speed: 98, color: "#14B8A6" },
      { name: "GPT-5.4 mini", providerKey: "openai", score: 40, speed: 171, color: "#10B981" },
      { name: "Grok Build 0.1", providerKey: "xai", score: 40, speed: 101, color: "#A855F7" },
      { name: "Step 3.7 Flash", providerKey: "stepfun", score: 30, speed: 381, color: "#84CC16" },
      { name: "Mercury 2", providerKey: "inception", score: 25, speed: 785, color: "#F43F5E" }
    ],
    providerCounts: [
      { providerKey: "anthropic", count: 4, color: "#D97706" },
      { providerKey: "openai", count: 4, color: "#10B981" },
      { providerKey: "google", count: 2, color: "#3B82F6" },
      { providerKey: "deepseek", count: 2, color: "#14B8A6" },
      { providerKey: "zai", count: 1, color: "#8B5CF6" },
      { providerKey: "alibaba", count: 1, color: "#EC4899" },
      { providerKey: "minimax", count: 1, color: "#F97316" },
      { providerKey: "kimi", count: 1, color: "#EF4444" },
      { providerKey: "xiaomi", count: 1, color: "#F59E0B" },
      { providerKey: "others", count: 2, color: "#64748B" }
    ]
  },
  locales: {
    en: {
      fontFamily: '"Inter", "Noto Sans SC", "Segoe UI", Arial, sans-serif',
      providers: {
        anthropic: "Anthropic",
        openai: "OpenAI",
        google: "Google",
        deepseek: "DeepSeek",
        zai: "Z AI",
        alibaba: "Alibaba",
        minimax: "MiniMax",
        kimi: "Kimi",
        xiaomi: "Xiaomi",
        nexagi: "Nex AGI",
        xai: "xAI",
        stepfun: "StepFun",
        inception: "Inception",
        others: "Others"
      },
      scenes: {
        intro: {
          kicker: "2025 AI Model Rankings",
          title: "Who Leads the<br/><span>AI Race?</span>",
          subtitle: "Intelligence, speed, and cost compared across 20+ frontier models from OpenAI, Anthropic, Google, and more.",
          metrics: [
            { label: "Models Analyzed", value: "542+", color: "#3B82F6" },
            { label: "Top Intelligence", value: "Claude Fable 5", color: "#10B981" },
            { label: "Fastest Model", value: "Mercury 2", color: "#F59E0B" }
          ]
        },
        ranking: {
          kicker: "Intelligence Index Top 15",
          title: "Claude Fable 5<br/>Leads the Pack",
          subtitle: "Intelligence Index Score (higher is better)"
        },
        scatter: {
          kicker: "Speed vs Intelligence",
          title: "Fast AND Smart?",
          subtitle: "X: Speed (tokens/s) · Y: Intelligence Index",
          xAxis: "Speed (tokens/s) →",
          yAxis: "Intelligence →"
        },
        efficiency: {
          kicker: "Efficiency Watchlist",
          title: "The best model<br/>depends on the job",
          subtitle: "Different leaders emerge when you optimize for intelligence, throughput, or balance.",
          cards: [
            { label: "Highest Intelligence", title: "Claude Fable 5", value: "60 index", color: "#D97706" },
            { label: "Fastest Throughput", title: "Mercury 2", value: "785 tok/s", color: "#F43F5E" },
            { label: "Best Fast Frontier", title: "Gemini 3.5 Flash", value: "50 · 163", color: "#3B82F6" },
            { label: "Dense Challenger", title: "Qwen3.7 Max", value: "46 · 203", color: "#EC4899" }
          ]
        },
        tiers: {
          kicker: "Capability Tiers",
          title: "Frontier quality is<br/>no longer one cluster",
          subtitle: "Top models separate into a small frontier group, a dense challenger band, and a fast utility layer.",
          rows: [
            { label: "Frontier", note: "Score 55+", count: 3, color: "#10B981" },
            { label: "Challenger", note: "Score 45-54", count: 8, color: "#3B82F6" },
            { label: "Production", note: "Score 40-44", count: 5, color: "#F59E0B" },
            { label: "Speed-first", note: "Sub-40, high throughput", count: 2, color: "#F43F5E" }
          ]
        },
        providers: {
          kicker: "Provider Distribution",
          title: "Anthropic & OpenAI<br/>Dominate the Top 20",
          subtitle: "Number of models in the top 20 by provider"
        },
        outro: {
          kicker: "Key Insights",
          title: "The AI landscape<br/>is more competitive<br/>than ever.",
          bullets: [
            "542+ models evaluated",
            "9 independent benchmarks",
            "Data from Artificial Analysis"
          ]
        }
      }
    },
    zh: {
      fontFamily: '"Noto Sans SC", "Inter", "Microsoft YaHei", Arial, sans-serif',
      providers: {
        anthropic: "Anthropic",
        openai: "OpenAI",
        google: "Google",
        deepseek: "深度求索",
        zai: "Z AI",
        alibaba: "阿里云",
        minimax: "MiniMax",
        kimi: "月之暗面",
        xiaomi: "小米",
        nexagi: "Nex AGI",
        xai: "xAI",
        stepfun: "阶跃星辰",
        inception: "Inception",
        others: "其他"
      },
      scenes: {
        intro: {
          kicker: "2025 AI 模型排名",
          title: "谁在领跑<br/><span>AI 竞赛？</span>",
          subtitle: "对比 20+ 前沿模型在智能、速度和成本方面的表现，涵盖 OpenAI、Anthropic、Google 等厂商。",
          metrics: [
            { label: "分析模型数", value: "542+", color: "#3B82F6" },
            { label: "最高智能", value: "Claude Fable 5", color: "#10B981" },
            { label: "最快速度", value: "Mercury 2", color: "#F59E0B" }
          ]
        },
        ranking: {
          kicker: "智能指数前 15 名",
          title: "Claude Fable 5<br/>领跑全场",
          subtitle: "智能指数评分（越高越好）"
        },
        scatter: {
          kicker: "速度 vs 智能",
          title: "又快又聪明？",
          subtitle: "X 轴：速度（tokens/s）· Y 轴：智能指数",
          xAxis: "速度（tokens/s）→",
          yAxis: "智能指数 →"
        },
        efficiency: {
          kicker: "效率观察",
          title: "最佳模型<br/>取决于任务",
          subtitle: "当目标从智能切换到吞吐或平衡性时，领先者会变得完全不同。",
          cards: [
            { label: "最高智能", title: "Claude Fable 5", value: "60 指数", color: "#D97706" },
            { label: "最快吞吐", title: "Mercury 2", value: "785 tok/s", color: "#F43F5E" },
            { label: "高分高速", title: "Gemini 3.5 Flash", value: "50 · 163", color: "#3B82F6" },
            { label: "挑战者代表", title: "Qwen3.7 Max", value: "46 · 203", color: "#EC4899" }
          ]
        },
        tiers: {
          kicker: "能力分层",
          title: "前沿模型<br/>不再挤成一团",
          subtitle: "头部模型分成少数前沿层、密集挑战层，以及面向速度的实用层。",
          rows: [
            { label: "前沿层", note: "55 分以上", count: 3, color: "#10B981" },
            { label: "挑战层", note: "45-54 分", count: 8, color: "#3B82F6" },
            { label: "生产层", note: "40-44 分", count: 5, color: "#F59E0B" },
            { label: "速度层", note: "低分高吞吐", count: 2, color: "#F43F5E" }
          ]
        },
        providers: {
          kicker: "厂商分布",
          title: "Anthropic 与 OpenAI<br/>主导前 20 名",
          subtitle: "各厂商在前 20 名中的模型数量"
        },
        outro: {
          kicker: "核心洞察",
          title: "AI 格局<br/>竞争空前激烈。",
          bullets: [
            "评估 542+ 款模型",
            "9 项独立基准测试",
            "数据来源：Artificial Analysis"
          ]
        }
      }
    },
    ja: {
      fontFamily: '"Noto Sans JP", "Inter", "Noto Sans SC", Arial, sans-serif',
      providers: {
        anthropic: "Anthropic",
        openai: "OpenAI",
        google: "Google",
        deepseek: "DeepSeek",
        zai: "Z AI",
        alibaba: "Alibaba",
        minimax: "MiniMax",
        kimi: "Kimi",
        xiaomi: "Xiaomi",
        nexagi: "Nex AGI",
        xai: "xAI",
        stepfun: "StepFun",
        inception: "Inception",
        others: "その他"
      },
      scenes: {
        intro: {
          kicker: "2025 AIモデルランキング",
          title: "AI競争を<br/><span>リードするのは？</span>",
          subtitle: "OpenAI、Anthropic、Google などの20以上のフロンティアモデルを、知能・速度・コストで比較します。",
          metrics: [
            { label: "分析モデル数", value: "542+", color: "#3B82F6" },
            { label: "最高知能", value: "Claude Fable 5", color: "#10B981" },
            { label: "最速モデル", value: "Mercury 2", color: "#F59E0B" }
          ]
        },
        ranking: {
          kicker: "知能指数トップ15",
          title: "Claude Fable 5 が<br/>トップを走る",
          subtitle: "知能指数スコア（高いほど優秀）"
        },
        scatter: {
          kicker: "速度 vs 知能",
          title: "速くて賢い？",
          subtitle: "X軸：速度（tokens/s）・Y軸：知能指数",
          xAxis: "速度（tokens/s）→",
          yAxis: "知能指数 →"
        },
        efficiency: {
          kicker: "効率ウォッチ",
          title: "最適なモデルは<br/>用途で変わる",
          subtitle: "知能、スループット、バランスのどれを重視するかで、勝者は変わります。",
          cards: [
            { label: "最高知能", title: "Claude Fable 5", value: "60 指数", color: "#D97706" },
            { label: "最高スループット", title: "Mercury 2", value: "785 tok/s", color: "#F43F5E" },
            { label: "高速フロンティア", title: "Gemini 3.5 Flash", value: "50 · 163", color: "#3B82F6" },
            { label: "有力チャレンジャー", title: "Qwen3.7 Max", value: "46 · 203", color: "#EC4899" }
          ]
        },
        tiers: {
          kicker: "能力レイヤー",
          title: "最上位モデルは<br/>一枚岩ではない",
          subtitle: "トップモデルは、少数のフロンティア層、厚いチャレンジャー層、速度重視の実用層に分かれます。",
          rows: [
            { label: "最前線", note: "55点以上", count: 3, color: "#10B981" },
            { label: "挑戦層", note: "45-54点", count: 8, color: "#3B82F6" },
            { label: "実用層", note: "40-44点", count: 5, color: "#F59E0B" },
            { label: "速度層", note: "低スコア高吞吐", count: 2, color: "#F43F5E" }
          ]
        },
        providers: {
          kicker: "プロバイダー分布",
          title: "Anthropic と OpenAI が<br/>トップ20を主導",
          subtitle: "トップ20に入ったモデル数をプロバイダー別に集計"
        },
        outro: {
          kicker: "主な示唆",
          title: "AIの勢力図は<br/>かつてなく競争的に。",
          bullets: [
            "542+ モデルを評価",
            "9つの独立ベンチマーク",
            "データ出典：Artificial Analysis"
          ]
        }
      }
    }
  }
};
