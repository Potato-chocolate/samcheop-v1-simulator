import json
from pathlib import Path

data = json.loads(Path('v1_business_analysis.json').read_text(encoding='utf-8'))
records = sorted(
    [
        row
        for row in data['store_sales']['records']
        if (row.get('operating_days_2025') or 0) >= 90
        and (row.get('normalized_monthly_sales') or 0) > 0
    ],
    key=lambda row: row.get('normalized_monthly_sales') or 0,
    reverse=True,
)
lines = ['const BENCHMARK_STORES = [']
for index, row in enumerate(records, start=1):
    region = json.dumps(row['region'], ensure_ascii=False)
    name = json.dumps(row['name'], ensure_ascii=False)
    sales = int(round(row['normalized_monthly_sales']))
    hall = 'true' if row.get('is_hall') else 'false'
    lines.append(f'  {{ rank: {index}, region: {region}, name: {name}, sales: {sales}, hall: {hall} }},')
lines.append('];')
print('\n'.join(lines))
print(f'// count: {len(records)}')
