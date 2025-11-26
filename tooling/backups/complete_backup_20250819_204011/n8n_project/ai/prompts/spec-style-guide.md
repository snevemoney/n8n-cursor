# Workflow Spec Style Guide

## Naming Conventions

- **IDs**: Use alphanumeric characters and underscores only (`get_user`, `send_email`)
- **Names**: Use human-readable descriptions (`Get User Profile`, `Send Welcome Email`)
- **Workflow names**: Be descriptive and concise (`User Onboarding Flow`, `Daily Report Generator`)

## Best Practices

- **Minimize magic**: Use explicit field names and clear variable references
- **Single responsibility**: Each step should do one thing well
- **Error handling**: Use `if` conditions to check for required data before proceeding
- **Secrets**: Reference sensitive data with `{{secrets.KEY_NAME}}` format
- **Data flow**: Make connections explicit rather than relying on linear chaining

## Common Patterns

### API Request + Validation
```yaml
- id: fetch_data
  type: httpRequest
  name: Fetch User Data
  request:
    method: GET
    url: "https://api.example.com/users/{{$json.userId}}"
    headers:
      Authorization: "Bearer {{secrets.API_TOKEN}}"

- id: validate_response
  type: if
  name: Check If User Exists
  condition: "{{$json.id && $json.email}}"
```

### Data Transformation
```yaml
- id: transform
  type: function
  name: Format User Data
  code: |
    return {
      fullName: `${$json.firstName} ${$json.lastName}`,
      email: $json.email.toLowerCase(),
      joinedAt: new Date().toISOString()
    };
```

### Conditional Branching
```yaml
- id: route_by_type
  type: if
  name: Route by User Type
  condition: "{{$json.userType === 'premium'}}"

connections:
  - from: route_by_type.true
    to: premium_flow
  - from: route_by_type.false
    to: standard_flow
```
