import json
import subprocess

API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYjYxOWE3MC1jMzQ2LTQ0NDQtODlkZi0zZTUxODE1MjhhMzQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU2OTQ5NjYwfQ.GaodXlSEJJuKirhnni4hq8XjgTbrZ8Px6DC1znpUn7A"
BASE_URL = "https://n8ncloud.tech"

def update_node_query(workflow_id, node_name, new_query):
    # Fetch workflow
    cmd = f'curl -s "{BASE_URL}/api/v1/workflows/{workflow_id}" -H "X-N8N-API-KEY: {API_KEY}"'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    workflow = json.loads(result.stdout)
    
    # Find and update node
    updated = False
    for node in workflow['nodes']:
        if node['name'] == node_name:
            node['parameters']['query'] = new_query
            updated = True
            print(f"  Updated {node_name}: {new_query[:60]}...")
    
    if not updated:
        print(f"  Node {node_name} not found!")
        return False
    
    # Update workflow
    cmd = f'curl -X PATCH "{BASE_URL}/api/v1/workflows/{workflow_id}" -H "X-N8N-API-KEY: {API_KEY}" -H "Content-Type: application/json" -d \'{json.dumps({"nodes": workflow["nodes"]})}\''
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    return result.returncode == 0

# Fix all workflows
fixes = [
    ("m8bRs9lBNFvpygty", "Add Sustainability Metric", 
     "INSERT INTO sustainability_metrics (tenant_id, metric_type, measurement_date, value, unit, source) VALUES ('{{ $json.tenantId }}', '{{ $json.metricType }}', '{{ $json.measurementDate }}'::timestamptz, {{ $json.value }}::numeric, '{{ $json.unit }}', '{{ $json.source }}') RETURNING *;"),
    ("m8bRs9lBNFvpygty", "Get Sustainability Metrics",
     "SELECT * FROM get_sustainability_dashboard('{{ $json.tenantId }}', 30);"),
]

for workflow_id, node_name, new_query in fixes:
    print(f"\nFixing {node_name} in {workflow_id}...")
    success = update_node_query(workflow_id, node_name, new_query)
    print(f"  Result: {'SUCCESS' if success else 'FAILED'}")

print("\nAll fixes applied!")
