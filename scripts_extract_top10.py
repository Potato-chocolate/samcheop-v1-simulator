from __future__ import annotations

import re
from pathlib import Path

source = Path('/home/ubuntu/samcheop-v1-simulator/v1_extracted/v1_capital_area_stores.md')
rows = []
for line in source.read_text(encoding='utf-8').splitlines():
    if not line.startswith('|') or '|' not in line:
        continue
    parts = [part.strip() for part in line.strip('|').split('|')]
    if len(parts) < 7 or not parts[0].isdigit():
        continue
    region = parts[1]
    name = parts[2]
    try:
        days = float(parts[5])
        annual_sales = float(parts[6])
    except ValueError:
        continue
    if days <= 0 or annual_sales <= 0:
        continue
    monthly = annual_sales / days * (365 / 12)
    rows.append({
        'region': region,
        'name': name,
        'days': days,
        'annual_sales': annual_sales,
        'monthly': monthly,
        'hall': '_홀' in name,
    })

for idx, item in enumerate(sorted(rows, key=lambda x: x['monthly'], reverse=True)[:10], start=1):
    print(idx, item['region'], item['name'], round(item['monthly']), item['hall'])
