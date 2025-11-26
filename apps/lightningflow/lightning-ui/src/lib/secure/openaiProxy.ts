import { incrementUsage } from './checkQuota'

export async function proxyOpenAI(workspaceId: string, body: any) {
  // Get workspace-specific or default OpenAI key
  const key = process.env[`OPENAI_KEY_${workspaceId}`] || process.env.OPENAI_KEY_DEFAULT

  if (!key) {
    throw new Error('OpenAI API key not configured for this workspace')
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await res.json()

  // Track usage
  if (data.usage) {
    await incrementUsage(workspaceId, data.usage.total_tokens)
  }

  return data
}

export async function proxyOpenAIAssistant(workspaceId: string, assistantId: string, message: string) {
  const key = process.env[`OPENAI_KEY_${workspaceId}`] || process.env.OPENAI_KEY_DEFAULT

  if (!key) {
    throw new Error('OpenAI API key not configured for this workspace')
  }

  // Create a thread
  const threadRes = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
    },
  })

  const thread = await threadRes.json()

  // Add message to thread
  await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
    },
    body: JSON.stringify({
      role: 'user',
      content: message,
    }),
  })

  // Run the assistant
  const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
    },
    body: JSON.stringify({
      assistant_id: assistantId,
    }),
  })

  const run = await runRes.json()

  // Poll for completion
  let runStatus = run
  while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const statusRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
      headers: {
        Authorization: `Bearer ${key}`,
        'OpenAI-Beta': 'assistants=v2',
      },
    })
    runStatus = await statusRes.json()
  }

  // Get messages
  const messagesRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
    headers: {
      Authorization: `Bearer ${key}`,
      'OpenAI-Beta': 'assistants=v2',
    },
  })

  const messages = await messagesRes.json()

  // Track usage (estimate)
  await incrementUsage(workspaceId, 1000) // Rough estimate for assistant usage

  return {
    threadId: thread.id,
    runId: run.id,
    messages: messages.data,
    status: runStatus.status,
  }
} 