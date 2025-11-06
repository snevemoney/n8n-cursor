# Simple Slack Notifier — Workflow Explanation

**Status:** 🔴 Inactive  
**Total Nodes:** 4  
**Created:** Unknown  
**Last Updated:** Unknown

## Overview

This workflow is triggered by **Webhook Trigger** (webhook) listening on `POST /slack-notify`.

The workflow performs the following operations:
- 🌐 Makes HTTP requests to external APIs
- 🔀 Makes conditional decisions
- 📊 Transforms and manipulates data

## Node Details

### 1. Webhook Trigger `(webhook)`

- **Endpoint:** `POST /slack-notify`
- **Response Mode:** onReceived

### 2. Extract Message Data `(set)`

- **Sets 3 field(s)**
- **Connects to:** Check Message Exists

### 3. Check Message Exists `(if)`

- **Condition:** `{{$json.message && $json.message.length > 0}}`
- **Connects to:** Send Slack Message

### 4. Send Slack Message `(httpRequest)`

- **Request:** `POST https://hooks.slack.com/services/{{secrets.SLACK_WEBHOOK_URL}}`

## Data Flow

Simple linear flow through all nodes.

## Usage

To trigger this workflow, send a POST request to:

```
POST https://your-n8n-instance.com/webhook/slack-notify
```

Example payload:
```json
{
  "key": "value",
  "data": "your-data-here"
}
```

## Technical Notes

- **Execution Order:** v1
- **Static Data:** None
- **Pinned Data:** None

---

*Generated on 8/18/2025, 2:50:44 PM*
