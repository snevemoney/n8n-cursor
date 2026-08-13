FROM node:20-alpine
WORKDIR /app
COPY server.js ./
ENV PORT=3003
EXPOSE 3003
HEALTHCHECK --interval=20s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3003/scorpion/healthz || exit 1
RUN apk add --no-cache wget
CMD ["node", "server.js"]
