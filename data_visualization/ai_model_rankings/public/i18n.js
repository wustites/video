window.AI_MODEL_RANKINGS_I18N = {
  locales: {
    en: {
      fontFamily: '"Segoe UI", Arial, sans-serif',
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
          kicker: "2026 AI Model Rankings",
          title: "Who Leads the<br/><span>AI Race?</span>",
          subtitle: "Intelligence, speed, and cost compared across 100+ frontier models from OpenAI, Anthropic, Google, and more.",
          metrics: [
            { label: "Models Analyzed", value: "{{totalModels}}", color: "#3B82F6" },
            { label: "Top Intelligence", value: "{{topModel}}", color: "#10B981" },
            { label: "Fastest Model", value: "{{fastestModel}}", color: "#F59E0B" }
          ]
        },
        ranking: {
          kicker: "Intelligence Index Top 15",
          title: "Claude Opus 5<br/>Leads the Pack",
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
            { label: "Highest Intelligence", title: "{{card0}}", value: "", color: "#D97706" },
            { label: "Fastest Throughput", title: "{{card1}}", value: "", color: "#F43F5E" },
            { label: "Best Fast Frontier", title: "{{card2}}", value: "", color: "#3B82F6" },
            { label: "Dense Challenger", title: "{{card3}}", value: "", color: "#EC4899" }
          ]
        },
        tiers: {
          kicker: "Capability Tiers",
          title: "Frontier quality is<br/>no longer one cluster",
          subtitle: "Top models separate into a small frontier group, a dense challenger band, and a fast utility layer.",
          rows: [
            { label: "Frontier", note: "Score 60+", color: "#10B981" },
            { label: "Challenger", note: "Score 50-59", color: "#3B82F6" },
            { label: "Production", note: "Score 40-49", color: "#F59E0B" },
            { label: "Speed-first", note: "Sub-40, high throughput", color: "#F43F5E" }
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
            "{{total}} models evaluated",
            "9 independent benchmarks",
            "Data from Artificial Analysis"
          ]
        }
      }
    },
    zh: {
      fontFamily: '"Noto Sans SC", "Segoe UI", Arial, sans-serif',
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
          kicker: "2026 AI 模型排名",
          title: "谁在领跑<br/><span>AI 竞赛？</span>",
          subtitle: "对比 100+ 前沿模型在智能、速度和成本方面的表现，涵盖 OpenAI、Anthropic、Google 等厂商。",
          metrics: [
            { label: "分析模型数", value: "{{totalModels}}", color: "#3B82F6" },
            { label: "最高智能", value: "{{topModel}}", color: "#10B981" },
            { label: "最快速度", value: "{{fastestModel}}", color: "#F59E0B" }
          ]
        },
        ranking: {
          kicker: "智能指数前 15 名",
          title: "Claude Opus 5<br/>领跑全场",
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
            { label: "最高智能", title: "{{card0}}", value: "", color: "#D97706" },
            { label: "最快吞吐", title: "{{card1}}", value: "", color: "#F43F5E" },
            { label: "高分高速", title: "{{card2}}", value: "", color: "#3B82F6" },
            { label: "挑战者代表", title: "{{card3}}", value: "", color: "#EC4899" }
          ]
        },
        tiers: {
          kicker: "能力分层",
          title: "前沿模型<br/>不再挤成一团",
          subtitle: "头部模型分成少数前沿层、密集挑战层，以及面向速度的实用层。",
          rows: [
            { label: "前沿层", note: "60 分以上", color: "#10B981" },
            { label: "挑战层", note: "50-59 分", color: "#3B82F6" },
            { label: "生产层", note: "40-49 分", color: "#F59E0B" },
            { label: "速度层", note: "低分高吞吐", color: "#F43F5E" }
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
            "评估 {{total}} 款模型",
            "9 项独立基准测试",
            "数据来源：Artificial Analysis"
          ]
        }
      }
    },
    ja: {
      fontFamily: '"Noto Sans JP", "Segoe UI", Arial, sans-serif',
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
          kicker: "2026 AIモデルランキング",
          title: "AI競争を<br/><span>リードするのは？</span>",
          subtitle: "OpenAI、Anthropic、Google などの100以上のフロンティアモデルを、知能・速度・コストで比較します。",
          metrics: [
            { label: "分析モデル数", value: "{{totalModels}}", color: "#3B82F6" },
            { label: "最高知能", value: "{{topModel}}", color: "#10B981" },
            { label: "最速モデル", value: "{{fastestModel}}", color: "#F59E0B" }
          ]
        },
        ranking: {
          kicker: "知能指数トップ15",
          title: "Claude Opus 5 が<br/>トップを走る",
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
            { label: "最高知能", title: "{{card0}}", value: "", color: "#D97706" },
            { label: "最高スループット", title: "{{card1}}", value: "", color: "#F43F5E" },
            { label: "高速フロンティア", title: "{{card2}}", value: "", color: "#3B82F6" },
            { label: "有力チャレンジャー", title: "{{card3}}", value: "", color: "#EC4899" }
          ]
        },
        tiers: {
          kicker: "能力レイヤー",
          title: "最上位モデルは<br/>一枚岩ではない",
          subtitle: "トップモデルは、少数のフロンティア層、厚いチャレンジャー層、速度重視の実用層に分かれます。",
          rows: [
            { label: "最前線", note: "60点以上", color: "#10B981" },
            { label: "挑戦層", note: "50-59点", color: "#3B82F6" },
            { label: "実用層", note: "40-49点", color: "#F59E0B" },
            { label: "速度層", note: "低スコア高吞吐", color: "#F43F5E" }
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
            "{{total}} モデルを評価",
            "9つの独立ベンチマーク",
            "データ出典：Artificial Analysis"
          ]
        }
      }
    }
  }
};
