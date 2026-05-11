import json
from pathlib import Path

data = json.loads(Path('v1_business_analysis.json').read_text(encoding='utf-8'))
records = data['store_sales']['records']
filters = {
    'all_records': records,
    'positive_sales': [row for row in records if (row.get('normalized_monthly_sales') or 0) > 0],
    'days_ge_90': [row for row in records if (row.get('operating_days_2025') or 0) >= 90],
    'days_ge_90_positive': [row for row in records if (row.get('operating_days_2025') or 0) >= 90 and (row.get('normalized_monthly_sales') or 0) > 0],
}
for name, rows in filters.items():
    print(name, len(rows))
    if rows:
        sorted_rows = sorted(rows, key=lambda row: row.get('normalized_monthly_sales') or 0, reverse=True)
        print('  first:', sorted_rows[0]['name'], sorted_rows[0].get('normalized_monthly_sales'), sorted_rows[0].get('operating_days_2025'))
        print('  last:', sorted_rows[-1]['name'], sorted_rows[-1].get('normalized_monthly_sales'), sorted_rows[-1].get('operating_days_2025'))
