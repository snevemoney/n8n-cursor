#!/usr/bin/env node
/**
 * Minimal stand-in when the real CE builder (:3001) tree is missing.
 * Keeps /builder/ from returning opaque 502s.
 */
const http = require('http');
const port = Number(process.env.PORT || 3001);

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Builder unavailable</title>
<style>
body{margin:0;font-family:ui-sans-serif,system-ui,sans-serif;background:#0a0d10;color:#e4e8ee}
main{max-width:36rem;margin:4rem auto;padding:0 1.25rem}
h1{color:#13c6a8;font-size:1.75rem}
p{line-height:1.55;color:rgba(228,232,238,.8)}
code{color:#13c6a8}a{color:#13c6a8}
</style></head><body><main>
<h1>Builder is not deployed</h1>
<p>Nothing is listening with the real Client Engine builder app on <code>:3001</code>. The builder source is out-of-repo and was not on disk when this stub was started.</p>
<p>Restore the builder tree under the Client Engine deploy (or an image that serves it), then replace this stub.</p>
<p><a href="/dashboard">CE dashboard</a> · <a href="/">home</a> · <a href="/scorpion/">scorpion</a></p>
</main></body></html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/healthz' || req.url === '/builder/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'builder', mode: 'stub' }));
    return;
  }
  // 200 so the route is reachable; body explains the real builder is missing.
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`builder-stub listening on ${port}`);
});
