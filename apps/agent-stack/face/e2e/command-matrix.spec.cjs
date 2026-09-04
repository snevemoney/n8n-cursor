const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

const ARTIFACTS = path.join(__dirname, "test-artifacts");
const ASK_DUMP = /asks\.md|ask-log\.py|709 asks|do not hand-edit|say yes to approve|hand this to the/i;

const CASES = [
  { id: "youtube", phrase: "go to YouTube", youtube: true },
  { id: "marketing", phrase: "what is marketing" },
  { id: "repo", phrase: "check my repo" },
  { id: "can-you", phrase: "can you" },
  { id: "hello", phrase: "hello" },
  { id: "stop", phrase: "stop" },
];

async function typeSend(page, phrase) {
  await page.keyboard.press("/");
  const box = page.locator("#typed");
  await expect(box).toBeVisible();
  await box.fill(phrase);
  await box.press("Enter");
  const spoken = page.locator("#spoken");
  await expect(spoken).not.toHaveText("", { timeout: 20000 });
  await expect(spoken).not.toHaveText(phrase, { timeout: 20000 });
  return (await spoken.textContent()) || "";
}

test.describe("Jarvis command matrix face", () => {
  test.beforeAll(() => {
    fs.mkdirSync(ARTIFACTS, { recursive: true });
  });

  test("pane answers matrix phrases — not an ask-log dump", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#mark")).toContainText("J.A.R.V.I.S");
    await expect(page.locator("#typed")).toHaveCount(1);

    for (const row of CASES) {
      const spoken = await typeSend(page, row.phrase);
      expect(spoken.trim().length, row.id).toBeGreaterThan(2);
      expect(spoken, row.id).not.toMatch(ASK_DUMP);
      expect(spoken, row.id).not.toContain("CONTENT/os/ASKS.md");
      if (row.youtube) {
        expect(spoken.toLowerCase(), "youtube must not be vault").not.toContain("ask log");
        expect(spoken.toLowerCase(), "youtube routes safari").toMatch(/safari|youtube|watch later/);
      }
      if (row.id === "hello") {
        expect(spoken).toMatch(/Hey Evens|working on/i);
      }
      if (row.id === "stop") {
        expect(spoken).toMatch(/Stopped|Standing by/i);
      }
      await page.screenshot({
        path: path.join(ARTIFACTS, `${row.id}.png`),
        fullPage: true,
      });
    }
  });

  test("POST /api/turn SSE is an answer", async ({ request }) => {
    const res = await request.post("/api/turn", {
      data: { utterance: "go to YouTube", stream: true },
      headers: { Accept: "text/event-stream" },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(res.headers()["content-type"] || "").toContain("text/event-stream");
    expect(body).toMatch(/spoken/);
    expect(body).not.toMatch(ASK_DUMP);
    expect(body.toLowerCase()).not.toContain("asks.md");
  });
});
