---
name: qs-ranking-scraper
description: Scrape QS World University Rankings from topuniversities.com. Use when user needs QS ranking data, university rankings, or wants to update university ranking information. Supports Chinese translation for university names and countries.
---

# QS Ranking Scraper

Scrape QS World University Rankings data from the official QS website.

## Quick Start

Run the scraper script:

```bash
python scripts/scrape_qs.py [pages] [output_file]
```

- `pages`: Number of pages to scrape (default: 4, ~30 universities per page)
- `output_file`: Output JSON file path (default: `qs_rankings.json`)

Examples:

```bash
# Scrape all 4 pages (100 universities)
python scripts/scrape_qs.py

# Scrape 2 pages only
python scripts/scrape_qs.py 2

# Custom output file
python scripts/scrape_qs.py 4 my_rankings.json
```

## Output Format

JSON array with university objects:

```json
[
  {
    "rank": 1,
    "name_en": "Massachusetts Institute of Technology (MIT)",
    "name_zh": "麻省理工学院",
    "country_en": "United States",
    "country_zh": "美国",
    "score": 100.0
  }
]
```

## Dependencies

- Python 3.8+
- playwright (`pip install playwright`)
- Chromium browser (`playwright install chromium`)

## Features

- Scrapes from official QS website (topuniversities.com)
- Automatic pagination handling
- Chinese translation for university names and countries
- Deduplication and sorting by rank
- JSON output format

## Data Source

Data is scraped from: https://www.topuniversities.com/world-university-rankings

The scraper accesses the QS rankings pages and extracts:
- University rank
- University name (English)
- Country/Region
- Overall score

## Notes

- QS website may change its structure, requiring scraper updates
- Rate limiting may apply; add delays if scraping fails
- Some universities may not have Chinese translations in the built-in map
