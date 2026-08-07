const http = require('http');

const port = Number(process.env.PORT || 3003);
const base = '/scorpion';

const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Scorpion — Operator</title>
  <style>
    body { margin:0; font-family: ui-sans-serif, system-ui, sans-serif; background:#0a0d10; color:#e4e8ee; }
    main { max-width: 40rem; margin: 4rem auto; padding: 0 1.25rem; }
    h1 { color:#13c6a8; font-size: 2rem; }
    p { line-height: 1.5; color: rgba(228,232,238,.8); }
    code { color:#13c6a8; }
  </style>
</head>
<body>
  <main>
    <h1>Scorpion</h1>
    <p>Operator console entry is live at <code>/scorpion</code> and locked by Caddy basic_auth.</p>
    <p>The full Scorpion Next.js image is path-ready in the repo (<code>NEXT_PUBLIC_BASE_PATH=/scorpion</code>). This stub keeps the route healthy until that image builds cleanly on the VPS.</p>
  </main>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const url = req.url || '/';
  if (url === `${base}/healthz` || url === '/healthz' || url === `${base}/healthz/`) {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'scorpion', mode: 'stub' }));
    return;
  }
  if (url === base || url === `${base}/` || url.startsWith(`${base}/`) || url === '/') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(page);
    return;
  }
  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('Not found');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`scorpion-stub listening on ${port}`);
});
