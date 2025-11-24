import { test, expect } from '@playwright/test';

// -------- config
const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3003';
const SHORT = 30_000;
const LONG = 180_000;

// Selectors with graceful fallbacks
const sel = {
  chatInput: `[data-testid="chat-input"], textarea, [contenteditable="true"]`,
  sendBtn: `[data-testid="send-button"], button:has-text("Send"), button:has-text("▶")`,
  rightPanelToggle: `[data-testid="open-right-panel"], button:has-text("Show right panel"), [aria-label="Show right panel"]`,
  rightPanel: `[data-testid="right-panel"], [data-panel="right"], [data-testid="chat-panels"]`,
  tab: (name: string) =>
    `[role="tab"]:has-text("${name}"), button[role="tab"]:has-text("${name}"), button:has-text("${name}")`,
  // Tools panel
  toolCard: `[data-testid="tool-call-card"], .tool-call-card`,
  toolRowByName: (name: string) =>
    `${`[data-testid="tool-call-card"]`} :text("${name}"), .tool-call-card :text("${name}")`,
  statusCompleted: `:text("completed"), [data-status="completed"]`,
  // Knowledge panel
  knowledgePanel: `[data-testid="knowledge-panel"], [data-panel="knowledge"]`,
  knowledgeCard: `[data-testid="knowledge-card"], .knowledge-card, [data-testid="knowledge-panel"] a[href^="http"]`,
  // Assistant message links (final answer)
  assistantMsg: `[data-testid="assistant-message"], .assistant, .prose`,
};

async function openRightPanel(page: any) {
  const visible = await page.locator(sel.rightPanel).first().isVisible().catch(() => false);
  if (!visible) {
    const toggle = page.locator(sel.rightPanelToggle).first();
    if (await toggle.isVisible().catch(() => false)) await toggle.click();
  }
}

async function sendChat(page: any, text: string) {
  const input = page.locator(sel.chatInput).first();
  await input.click({ delay: 10 });
  await input.fill(text);
  const btn = page.locator(sel.sendBtn).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
  } else {
    await page.keyboard.press('Enter');
  }
}

test.describe.configure({ timeout: LONG });

test.beforeEach(async ({ page }) => {
  await page.goto(`${BASE}/chat`, { waitUntil: 'domcontentloaded' });
  // Make sure the panel can be opened if auto-open doesn't trigger
  await openRightPanel(page);
});

/**
 * 1) Research flow: "latest bitcoin news"
 *    - Tools panel shows research.run completed
 *    - Knowledge panel receives >= 3 hits
 *    - Final assistant message contains >= 3 links
 */
test('research latest bitcoin news -> tools+knowledge+cited answer', async ({ page }) => {
  await sendChat(page, 'research the latest bitcoin news and summarize with links');

  // Tools panel should auto-select during search/execution
  await page.locator(sel.tab('Tools')).click({ timeout: SHORT }).catch(() => {});

  const researchRow = page.locator(sel.toolRowByName('research.run')).first();
  await expect(researchRow).toBeVisible({ timeout: LONG });
  await expect(researchRow.locator(sel.statusCompleted)).toBeVisible({ timeout: LONG });

  // Knowledge panel receives hits as SSE events fan out
  await page.locator(sel.tab('Knowledge')).click({ timeout: SHORT }).catch(() => {});

  const hits = page.locator(sel.knowledgeCard);
  await expect(hits).toHaveCountGreaterThan(0, { timeout: LONG });

  // Expect at least 3 unique links/cards
  await expect(hits).toHaveCountGreaterThan(2);

  // Final assistant answer should include at least 3 links
  // Grab the last assistant-looking block and count anchors
  const assistantBlocks = page.locator(sel.assistantMsg);
  const lastBlock = assistantBlocks.last();
  await expect(lastBlock).toBeVisible({ timeout: LONG });

  const linkCount = await lastBlock.locator('a[href^="http"]').count();
  expect(linkCount).toBeGreaterThanOrEqual(3);
});

/**
 * 2) Workflow inspection: "Explain my ElevenLabs workflow on n8ncloud.tech"
 *    - Tools panel shows workflows.list + workflows.get completed
 */
test('explain elevenlabs workflow -> workflows tools run', async ({ page }) => {
  await sendChat(page, 'Explain my ElevenLabs workflow on n8ncloud.tech');

  await page.locator(sel.tab('Tools')).click({ timeout: SHORT }).catch(() => {});

  const listRow = page.locator(sel.toolRowByName('workflows.list')).first();
  const getRow = page.locator(sel.toolRowByName('workflows.get')).first();

  await expect(listRow).toBeVisible({ timeout: LONG });
  await expect(getRow).toBeVisible({ timeout: LONG });
  await expect(listRow.locator(sel.statusCompleted)).toBeVisible({ timeout: LONG });
  await expect(getRow.locator(sel.statusCompleted)).toBeVisible({ timeout: LONG });
});

/**
 * 3) RAG ingest: "Pull my last uploaded file and add it to RAG"
 *    - files.recent runs
 *    - Knowledge panel shows at least one new hit (or success toast in answer)
 */
test('pull last uploaded file -> rag ingest visible', async ({ page }) => {
  await sendChat(page, 'Pull my last uploaded file and add it to RAG, then show what changed');

  await page.locator(sel.tab('Tools')).click({ timeout: SHORT }).catch(() => {});

  const filesRow = page.locator(sel.toolRowByName('files.recent')).first();
  await expect(filesRow).toBeVisible({ timeout: LONG });
  await expect(filesRow.locator(sel.statusCompleted)).toBeVisible({ timeout: LONG });

  // Either knowledge hits appear, or the answer confirms ingest
  await page.locator(sel.tab('Knowledge')).click({ timeout: SHORT }).catch(() => {});

  const hits = page.locator(sel.knowledgeCard);
  const count = await hits.count().catch(() => 0);

  if (count < 1) {
    const answer = page.locator(sel.assistantMsg).last();
    await expect(answer).toBeVisible({ timeout: SHORT });
    await expect(answer).toContainText(/ingest|indexed|added to rag/i, { timeout: SHORT });
  }
});

