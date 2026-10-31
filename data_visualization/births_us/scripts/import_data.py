#!/usr/bin/env python3
"""Import the reviewed state birth counts from ~/api into data/births.json (npm run data:update).

Usage: python3 scripts/import_data.py [dataset_dir]
Default dataset: ~/api/scripts/census/datasets/state-births (births_wide.csv + quality.json).
"""
import csv
import json
import sys
from pathlib import Path

P = Path(__file__).resolve().parent.parent
src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / "api/scripts/census/datasets/state-births"
rows = list(csv.DictReader((src / "births_wide.csv").open(encoding="utf-8-sig")))
years = [k for k in rows[0] if k.isdigit()]
quality = json.loads((src / "quality.json").read_text())
if len(rows) != 51 or quality["national_reconciliation_failures"]:
    raise SystemExit("Expected 51 reconciled areas (50 states + DC)")
out = {
    "source": "U.S. Census Bureau, Population Estimates Program (Vintage 2020, Vintage 2025)",
    "retrieved_date": quality["retrieved_date"],
    "year_definition": "Year Y = July 1 of Y-1 through June 30 of Y",
    "years": [int(y) for y in years],
    "states": {r["state_code"]: {"name": r["state"], "births": [int(r[y]) for y in years]} for r in rows},
}
(P / "data" / "births.json").write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(f"Imported {len(rows)} areas, {years[0]}–{years[-1]}")
