# .cursor/Dockerfile (dev-friendly, fast)
FROM node:20-bullseye

# System libs required for headless Chromium (kept minimal)
RUN apt-get update && apt-get install -y --no-install-recommends \
  libnss3=2:3.61-1+deb11u7 \
  libxss1=1:1.2.3-1 \
  libxcomposite1=1:0.4.5-1 \
  libxrandr2=2:1.5.1-1 \
  libxdamage1=1:1.1.5-2 \
  libasound2=1.2.4-1.1+deb11u1 \
  libgbm1=20.3.5-1+deb11u1 \
  ca-certificates=20250419~deb12u1~deb11u1 \
  fonts-liberation=1:1.07.4-11 \
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
