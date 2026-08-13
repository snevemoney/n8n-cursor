FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js ./
ENV PORT=3205
EXPOSE 3205
HEALTHCHECK --interval=20s --timeout=5s --retries=5 CMD wget -qO- http://127.0.0.1:3205/healthz || exit 1
CMD ["node", "server.js"]
