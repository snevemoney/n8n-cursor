const { defineConfig } = require("@playwright/test");
const path = require("node:path");

const PORT = process.env.AGENT_STACK_FACE_PORT || "4019";

module.exports = defineConfig({
  testDir: __dirname,
  testMatch: "*.spec.cjs",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [["list"]],
  outputDir: path.join(__dirname, "test-artifacts", "playwright-output"),
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    screenshot: "off",
    video: "off",
    trace: "off",
    // Face e2e only. Product browser stays Safari via see.py.
    channel: "chrome",
  },
  webServer: {
    command:
      "AGENT_STACK_DRY_TTS=1 AGENT_STACK_FACE_PORT=4019 AGENT_STACK_E2E=1 python3 serve_e2e.py",
    url: `http://127.0.0.1:${PORT}/healthz`,
    reuseExistingServer: false,
    timeout: 30_000,
    stdout: "pipe",
    stderr: "pipe",
  },
  projects: [{ name: "chrome", use: { browserName: "chromium", channel: "chrome" } }],
});
