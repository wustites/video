#!/usr/bin/env node
/**
 * setup.mjs — fetch live AI model rankings from Artificial Analysis
 * and generate public/data.js (consumed by compositions via video.js).
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
const SOURCE_URL = "https://artificialanalysis.ai/leaderboards/models";
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

const PROVIDER_KEYS = {
  Anthropic: "anthropic",
  OpenAI: "openai",
  Google: "google",
  DeepSeek: "deepseek",
  "Z AI": "zai",
  Alibaba: "alibaba",
  MiniMax: "minimax",
  Kimi: "kimi",
  Xiaomi: "xiaomi",
  SpaceXAI: "xai",
  Meta: "meta",
  Tencent: "tencent",
  NVIDIA: "nvidia",
  Mistral: "mistral",
  Cohere: "cohere",
  StepFun: "stepfun",
  Inception: "inception",
  "Nex AGI": "nexagi",
};

const COLORS = {
  anthropic: "#D97706",
  openai: "#10B981",
  google: "#3B82F6",
  deepseek: "#14B8A6",
  zai: "#8B5CF6",
  alibaba: "#EC4899",
  minimax: "#F97316",
  kimi: "#EF4444",
  xiaomi: "#F59E0B",
  xai: "#A855F7",
  meta: "#6366F1",
  tencent: "#22C55E",
  nvidia: "#22D3EE",
  mistral: "#F43F5E",
  cohere: "#0EA5E9",
  stepfun: "#84CC16",
  inception: "#FB7185",
  nexagi: "#818CF8",
  other: "#64748B",
};

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function parseModels(html) {
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
  const clean = (s) =>
    s
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const models = [];
  for (const row of rows.slice(2)) {
    const cells = (row.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/g) || []).map(clean);
    if (cells.length < 8 || !/^\d+$/.test(cells[3])) continue; // header rows / no index
    const speed = parseFloat(cells[5]);
    const creator = cells[2];
    models.push({
      name: cells[0],
      providerKey: PROVIDER_KEYS[creator] || slug(creator),
      providerLabel: creator,
      score: +cells[3],
      speed: Number.isFinite(speed) ? speed : null,
    });
  }
  return models;
}

function buildData(models) {
  const ranked = [...models].sort((a, b) => b.score - a.score || (b.speed ?? 0) - (a.speed ?? 0));
  const top15 = ranked.slice(0, 15);
  const top20 = ranked.slice(0, 20);

  // Scatter: highest-intelligence models that report a speed (16 points)
  const withSpeed = ranked.filter((m) => m.speed);
  const scatterPoints = withSpeed.slice(0, 16);
  const top15Names = new Set(top15.map((m) => m.name));

  // Provider distribution across the top 20
  const countBy = new Map();
  top20.forEach((m) => {
    const e = countBy.get(m.providerKey) || { providerKey: m.providerKey, label: m.providerLabel, count: 0 };
    e.count += 1;
    countBy.set(m.providerKey, e);
  });
  const providerCounts = [...countBy.values()]
    .sort((a, b) => b.count - a.count)
    .map((p) => ({ ...p, color: COLORS[p.providerKey] || COLORS.other }));

  // Capability tiers over the full leaderboard
  const tierRanges = [
    { label: "frontier", min: 60 },
    { label: "challenger", min: 50 },
    { label: "production", min: 40 },
    { label: "speed", min: 0 },
  ];
  const tierCounts = tierRanges.map((t, i) => {
    const max = i > 0 ? tierRanges[i - 1].min : Infinity;
    return models.filter((m) => m.score >= t.min && m.score < max).length;
  });

  // Efficiency watchlist
  const topModel = top15[0];
  const fastest = withSpeed.reduce((a, b) => (b.speed > a.speed ? b : a));
  const fastFrontier = top20
    .filter((m) => m.speed && m.score >= 55)
    .sort((a, b) => b.speed - a.speed)[0];
  const denseChallenger = top20
    .filter((m) => m.speed && m.score >= 50 && m.name !== fastFrontier.name)
    .sort((a, b) => b.speed - a.speed)[0];

  const cards = [
    { name: topModel.name, value: `${topModel.score} index`, color: COLORS[topModel.providerKey] || COLORS.other },
    { name: fastest.name, value: `${fastest.speed} tok/s`, color: COLORS[fastest.providerKey] || COLORS.other },
    { name: fastFrontier.name, value: `${fastFrontier.score} · ${fastFrontier.speed}`, color: COLORS[fastFrontier.providerKey] || COLORS.other },
    { name: denseChallenger.name, value: `${denseChallenger.score} · ${denseChallenger.speed}`, color: COLORS[denseChallenger.providerKey] || COLORS.other },
  ];

  return {
    source: SOURCE_URL,
    fetchedAt: new Date().toISOString(),
    totalEvaluated: models.length,
    metrics: {
      totalModels: `${models.length}+`,
      topModel: topModel.name,
      topScore: topModel.score,
      fastestModel: fastest.name,
      fastestSpeed: fastest.speed,
    },
    models: top15.map((m, i) => ({
      rank: i + 1,
      name: m.name,
      providerKey: m.providerKey,
      providerLabel: m.providerLabel,
      score: m.score,
      speed: m.speed,
      color: COLORS[m.providerKey] || COLORS.other,
    })),
    scatterPoints: scatterPoints.map((m) => ({
      name: m.name,
      providerKey: m.providerKey,
      providerLabel: m.providerLabel,
      score: m.score,
      speed: m.speed,
      color: COLORS[m.providerKey] || COLORS.other,
      inTop15: top15Names.has(m.name),
    })),
    providerCounts,
    tierCounts,
    cards,
  };
}

async function fetchSnapshot() {
  const res = await fetch(SOURCE_URL, {
    headers: { "user-agent": UA, accept: "text/html" },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const models = parseModels(html);
  if (models.length < 50) throw new Error(`Parsed only ${models.length} models — aborting`);
  return buildData(models);
}

function writeSnapshot(data) {
  const banner =
    "// Auto-generated by scripts/setup.mjs — do not edit manually.\n" +
    `// Source: ${data.source}\n// Fetched: ${data.fetchedAt}\n`;
  const body = `window.AI_MODEL_RANKINGS_DATA = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(DATA_FILE, banner + body);
  console.log(`✔ wrote ${DATA_FILE} (${data.totalEvaluated} models, top score ${data.metrics.topScore})`);
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
