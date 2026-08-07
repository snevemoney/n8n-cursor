FROM node:20-alpine
WORKDIR /app
COPY server.js .
ENV PORT=3001
EXPOSE 3001
HEALTHCHECK --interval=20s --timeout=5s --retries=5 CMD wget -qO- http://127.0.0.1:3001/healthz || exit 1
CMD ["node", "server.js"]
