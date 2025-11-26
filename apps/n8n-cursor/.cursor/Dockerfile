# .cursor/Dockerfile (dev-friendly, fast)
FROM node:20-bullseye

# System libs required for headless Chromium (kept minimal)
RUN apt-get update && apt-get install -y --no-install-recommends \
  libnss3 libxss1 libxcomposite1 libxrandr2 libxdamage1 libasound2 \
  libgbm1 ca-certificates fonts-liberation \
  && rm -rf /var/lib/apt/lists/*

# Tooling for diagrams & screenshots
RUN npm i -g @mermaid-js/mermaid-cli puppeteer@22

# Puppeteer in CI/headless
ENV PUPPETEER_DISABLE_DEV_SHM_USAGE=true \
    PUPPETEER_NO_SANDBOX=true

# Workdir matches checked-out repo from GitHub
WORKDIR /workspace

# Default command does nothing; Cursor handles the rest
CMD ["bash", "-lc", "echo Ready"]
