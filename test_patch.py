import json
import subprocess

API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYjYxOWE3MC1jMzQ2LTQ0NDQtODlkZi0zZTUxODE1MjhhMzQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU2OTQ5NjYwfQ.GaodXlSEJJuKirhnni4hq8XjgTbrZ8Px6DC1znpUn7A"
BASE_URL = "https://n8ncloud.tech"

# Fetch workflow
result = subprocess.run(f'curl -s "{BASE_URL}/api/v1/workflows/m8bRs9lBNFvpygty" -H "X-N8N-API-KEY: {API_KEY}"', shell=True, capture_output=True, text=True)
workflow = json.loads(result.stdout)

# Update a node
for node in workflow['nodes']:
    if node['name'] == 'Add Sustainability Metric':
        node['parameters']['query'] = "INSERT INTO sustainability_metrics (tenant_id, metric_type, measurement_date, value, unit, source) VALUES ('{{ $json.tenantId }}', '{{ $json.metricType }}', '{{ $json.measurementDate }}'::timestamptz, {{ $json.value }}::numeric, '{{ $json.unit }}', '{{ $json.source }}') RETURNING *;"
        break

# Try PATCH with verbose output
update_json = {"nodes": workflow["nodes"]}
result = subprocess.run(
    f'curl -X PATCH "{BASE_URL}/api/v1/workflows/m8bRs9lBNFvpygty" -H "X-N8N-API-KEY: {API_KEY}" -H "Content-Type: application/json" -d \'{json.dumps(update_json)}\' -w "\nSTATUS:%{http_code}\n"',
    shell=True,
    capture_output=True,
    text=True
)

print("Response:")
print(result.stdout)
