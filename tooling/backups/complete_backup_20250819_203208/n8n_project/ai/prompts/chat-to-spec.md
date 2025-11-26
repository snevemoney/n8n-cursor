# Chat ➜ Workflow (YAML Spec Prompt)

You will convert the user's request into a YAML workflow spec that follows `ai/schema/workflow-spec.schema.yaml`. Keep it concise and implementable.

## Rules

- Use only supported node types: `webhook`, `cron`, `httpRequest`, `set`, `function`, `if`, `merge`.
- Inputs/outputs must be explicitly named.
- For HTTP calls, include `method`, `url`, and any `headers`, `query`, `json`.
- For conditions, use simple JS expressions referencing prior outputs, e.g. `{{nodes.http_1.data.statusCode}}`.
- For schedules, allow: `every {minutes|hours|days}`, `cron: "* * * * *"`.

## Output

Only the YAML spec. No prose.

## Example

```yaml
name: YouTube New Upload Notifier
active: false
trigger:
  type: webhook
  path: /youtube-new
  method: POST
steps:
  - id: get_channel
    type: httpRequest
    name: Get Channel Uploads
    request:
      method: GET
      url: https://www.googleapis.com/youtube/v3/activities
      query:
        part: snippet,contentDetails
        channelId: "{{secrets.YT_CHANNEL_ID}}"
        maxResults: 5
        key: "{{secrets.YT_API_KEY}}"
  - id: latest
    type: function
    name: Pluck Latest Video
    code: |
      const items = $json.items || [];
      const first = items.find(i => i.contentDetails?.upload?.videoId);
      return { videoId: first?.contentDetails?.upload?.videoId || null };
  - id: check
    type: if
    name: Has Video?
    condition: "{{ $json.videoId !== null }}"
  - id: notify
    type: httpRequest
    name: Notify Webhook
    request:
      method: POST
      url: "https://hooks.slack.com/services/{{secrets.SLACK_HOOK}}"
      json:
        text: "New video: https://youtu.be/{{nodes.latest.data.videoId}}"
connections:
  - from: get_channel
    to: latest
  - from: latest
    to: check
  - from: check.true
    to: notify
```
