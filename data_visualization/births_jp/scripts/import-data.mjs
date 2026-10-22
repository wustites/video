#!/usr/bin/env node
/**
 * import-data.mjs — copy the e-Stat prefecture birth counts collected in ~/api into src/data.json.
 *
 *   npm run data:update                 # default source: ~/api/scripts/e-stat/datasets/prefecture-births
 *   npm run data:update -- <dataset dir>
 *
 * Source: MHLW Vital Statistics (final figures), table 4-3, via e-Stat. Births of Japanese
 * nationals in Japan, by the child's prefecture of residence. See the dataset README.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = process.argv[2] ?? path.join(os.homedir(), 'api/scripts/e-stat/datasets/prefecture-births');

const readCsv = (file) => {
  const [header, ...lines] = fs.readFileSync(path.join(SRC, file), 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/);
  const keys = header.split(',');
  return lines.map((line) => Object.fromEntries(line.split(',').map((v, i) => [keys[i], v])));
};
const int = (v) => {
  if (!/^\d+$/.test(v)) throw new Error(`not a count: ${v}`);
  return Number(v);
};

const wide = readCsv('births_wide.csv');
const years = Object.keys(wide[0]).filter((k) => /^\d{4}$/.test(k)).map(Number);
if (wide.length !== 47) throw new Error(`expected 47 prefectures, got ${wide.length}`);

const prefectures = wide.map((r) => ({
  code: r.prefecture_code,
  name: r.prefecture,
  births: years.map((y) => int(r[y])),
}));
const national = readCsv('national_reconciliation.csv').map((r) => {
  if (int(r.difference) !== 0) throw new Error(`national reconciliation failed for ${r.year}`);
  return {year: int(r.year), births: int(r.national_births)};
});
if (national.map((r) => r.year).join() !== years.join()) throw new Error('national years do not match prefecture years');
const quality = JSON.parse(fs.readFileSync(path.join(SRC, 'quality.json'), 'utf8'));

const out = {retrieved: quality.retrieved_date, years, national, prefectures};
fs.writeFileSync(path.join(ROOT, 'src', 'data.json'), JSON.stringify(out) + '\n');
console.log(`src/data.json: ${prefectures.length} prefectures, ${years[0]}–${years.at(-1)}`);
