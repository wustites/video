#!/usr/bin/env node
/**
 * setup.mjs — fetch live weekly model rankings from OpenRouter
 * and generate public/data.js (consumed by compositions).
 *
 * Runs automatically in CI before validate/render; falls back to the
 * committed snapshot when the fetch fails so builds never break.
 *
 *   node scripts/setup.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA_FILE = path.join(ROOT, "public", "data.js");
const API = "https://openrouter.ai/api/frontend/v1/rankings/models";

const ORGS = {
  deepseek: { name: "DeepSeek", country: "cn" },
  tencent: { name: "Tencent", country: "cn" },
  openai: { name: "OpenAI", country: "us" },
  "z-ai": { name: "Z AI", country: "cn" },
  xiaomi: { name: "Xiaomi", country: "cn" },
  anthropic: { name: "Anthropic", country: "us" },
  nvidia: { name: "NVIDIA", country: "us" },
  google: { name: "Google", country: "us" },
  poolside: { name: "Poolside", country: "us" },
  minimax: { name: "MiniMax", country: "cn" },
  moonshotai: { name: "Moonshot AI", country: "cn" },
  stepfun: { name: "StepFun", country: "cn" },
  meta: { name: "Meta", country: "us" },
  xai: { name: "xAI", country: "us" },
  inclusionai: { name: "Inclusion AI", country: "cn" },
  mistral: { name: "Mistral", country: "us" },
  cohere: { name: "Cohere", country: "us" },
};

const PRETTY = {
  "deepseek/deepseek-v4-flash-20260731": "DeepSeek V4 Flash",
  "deepseek/deepseek-v4-flash-20260423": "DeepSeek V4 Flash (Apr)",
  "deepseek/deepseek-v4-pro-20260423": "DeepSeek V4 Pro",
  "tencent/hy3-20260706": "Hy3",
  "openai/gpt-5.6-luna-20260709": "GPT-5.6 Luna",
  "openai/gpt-5.6-terra-20260709": "GPT-5.6 Terra",
  "openai/gpt-5.6-sol-20260709": "GPT-5.6 Sol",
  "z-ai/glm-5.2-20260616": "GLM 5.2",
  "xiaomi/mimo-v2.5-20260422": "MiMo V2.5",
  "anthropic/claude-opus-5-20260723": "Claude Opus 5",
  "anthropic/claude-sonnet-5-20260630": "Claude Sonnet 5",
  "anthropic/claude-4.6-sonnet-20260217": "Claude 4.6 Sonnet",
  "nvidia/nemotron-3-ultra-550b-a55b-20260604": "Nemotron-3 Ultra",
  "nvidia/nemotron-3.5-lightning-20260807": "Nemotron 3.5 Lightning",
  "google/gemini-3.6-flash-20260721": "Gemini 3.6 Flash",
  "google/gemini-3-flash-preview-20251217": "Gemini 3 Flash Preview",
  "google/gemini-2.5-flash-lite": "Gemini 2.5 Flash Lite",
  "poolside/laguna-s-2.1-20260720": "Laguna S 2.1",
  "minimax/minimax-m3-20260531": "MiniMax M3",
  "moonshotai/kimi-k3-20260715": "Kimi K3",
  "stepfun/step-3.7-flash-20260528": "Step 3.7 Flash",
};

const COLORS = [
  "#3B82F6", "#F43F5E", "#22C55E", "#38BDF8", "#F59E0B",
  "#8B5CF6", "#10B981", "#22D3EE", "#E879F9", "#FB923C",
];

const KNOWN_WORDS = {
  gpt: "GPT", glm: "GLM", mimo: "MiMo", kimi: "Kimi", qwen: "Qwen",
  hy3: "Hy3", deepseek: "DeepSeek", claude: "Claude", gemini: "Gemini",
  nemotron: "Nemotron", minimax: "MiniMax", step: "Step", laguna: "Laguna",
};

function prettyGeneric(slug) {
  let name = slug.split("/").pop();
  name = name.replace(/-\d{6,8}$/, "");
  name = name.replace(/-preview$/, " Preview");
  return name
    .split("-")
    .map((w) => KNOWN_WORDS[w] || (w[0] || "").toUpperCase() + w.slice(1))
    .join(" ");
}

function prettyName(slug) {
  return PRETTY[slug] || prettyGeneric(slug);
}

function orgOf(slug) {
  return slug.split("/")[0] || "other";
}

function orgInfo(slug) {
  const org = orgOf(slug);
  const info = ORGS[org];
  if (info) return { ...info, key: org };
  return { name: org[0].toUpperCase() + org.slice(1), country: "us", key: org };
}

function buildData(rows) {
  // Snapshot is the latest date; 'change' is pct-change vs previous snapshot (×100)
  const dates = [...new Set(rows.map((r) => r.date.slice(0, 10)))].sort();
  const latest = dates[dates.length - 1];

  const bySlug = new Map();
  for (const r of rows) {
    if (r.date.slice(0, 10) !== latest) continue;
    const e = bySlug.get(r.model_permaslug) || { tokens: 0, change: 0 };
    e.tokens += r.total_completion_tokens + r.total_prompt_tokens;
    if (r.change !== null && r.change !== undefined) e.change = r.change;
    bySlug.set(r.model_permaslug, e);
  }

  const ranked = [...bySlug.entries()].sort((a, b) => b[1].tokens - a[1].tokens);
  const totalTokens = ranked.reduce((s, [, v]) => s + v.tokens, 0);

  const withGrowth = ranked.map(([slug, v]) => ({
    slug,
    tokens: v.tokens,
    growth: +Math.max(-150, Math.min(150, v.change * 100)).toFixed(1),
  }));

  const models = withGrowth.slice(0, 10).map((m, i) => {
    const info = orgInfo(m.slug);
    return {
      rank: i + 1,
      name: prettyName(m.slug),
      provider: info.name,
      country: info.country,
      tokens: +(m.tokens / 1e12).toFixed(2),
      growth: +m.growth.toFixed(1),
      color: COLORS[i % COLORS.length],
    };
  });

  // Provider share across the whole leaderboard (latest day)
  const provMap = new Map();
  ranked.forEach(([slug, v]) => {
    const info = orgInfo(slug);
    const e = provMap.get(info.key) || { name: info.name, key: info.key, tokens: 0 };
    e.tokens += v.tokens;
    provMap.set(info.key, e);
  });
  const provSorted = [...provMap.values()].sort((a, b) => b.tokens - a.tokens);
  const top6 = provSorted.slice(0, 6).map((p, i) => ({
    name: p.name,
    tokens: +(p.tokens / 1e12).toFixed(2),
    pct: +((p.tokens / totalTokens) * 100).toFixed(1),
    color: COLORS[i % COLORS.length],
  }));
  const otherTokens = totalTokens - top6.reduce((s, p) => s + p.tokens * 1e12, 0);
  const otherPct = 100 - top6.reduce((s, p) => s + p.pct, 0);
  const providers = [
    ...top6,
    { name: "Other", tokens: +(otherTokens / 1e12).toFixed(2), pct: +otherPct.toFixed(1), color: "rgba(148,163,184,.4)" },
  ];
  const top6Pct = top6.reduce((s, p) => s + p.pct, 0);

  // Fastest risers among the top 20 (by token usage)
  const growthModels = withGrowth
    .slice(0, 20)
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 5)
    .map((m) => {
      const info = orgInfo(m.slug);
      return {
        name: prettyName(m.slug),
        provider: info.name,
        growth: +m.growth.toFixed(1),
        color: m.growth >= 0 ? "#10B981" : "#F43F5E",
      };
    });

  // Insights payload (text templates stay in each composition for i18n)
  const cnCount = models.filter((m) => m.country === "cn").length;
  const cnProviders = [...new Set(models.filter((m) => m.country === "cn").map((m) => m.provider))];
  const leaderGap = models.length >= 3 && models[0].tokens > models[1].tokens + models[2].tokens;
  const topModel = models[0];
  const riser = growthModels[0];

  return {
    source: "https://openrouter.ai/rankings",
    fetchedAt: new Date().toISOString(),
    dateRange: { start: latest, end: latest },
    totalTokens: +(totalTokens / 1e12).toFixed(1),
    topModel: topModel.name,
    topTokens: topModel.tokens,
    topGrowth: { model: riser.name, provider: riser.provider, growth: riser.growth },
    cnCount,
    cnProviders,
    leaderGap,
    top6Pct: +top6Pct.toFixed(1),
    models,
    providers,
    growthModels,
  };
}

async function fetchSnapshot() {
  const res = await fetch(API, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!Array.isArray(json.data) || json.data.length < 100)
    throw new Error(`Unexpected payload (${json.data?.length ?? 0} rows)`);
  return buildData(json.data);
}

function writeSnapshot(data) {
  const banner =
    "// Auto-generated by scripts/setup.mjs — do not edit manually.\n" +
    `// Source: ${data.source}\n// Fetched: ${data.fetchedAt}\n`;
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, banner + `window.OPENROUTER_RANKINGS_DATA = ${JSON.stringify(data, null, 2)};\n`);
  console.log(
    `✔ wrote ${DATA_FILE} (top: ${data.topModel} ${data.topTokens}T, total ${data.totalTokens}T, ${data.models.length} models)`
  );
}

async function main() {
  try {
    const data = await fetchSnapshot();
    writeSnapshot(data);
  } catch (err) {
    console.warn(`⚠ fetch failed (${err.message}) — keeping committed snapshot ${DATA_FILE}`);
    if (!fs.existsSync(DATA_FILE)) {
      console.error("✖ no snapshot available and fetch failed — cannot continue");
      process.exit(1);
    }
  }
}

main();
