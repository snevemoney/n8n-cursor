import { readGatewaySecret } from './auth.js';
import { listenGateway } from './server.js';

const { host, port } = await listenGateway();
console.log(`bigboss-gateway slice 1 listening on http://${host}:${port}`);
if (!readGatewaySecret()) {
  console.warn('BIGBOSS_GATEWAY_SECRET unset — all /v1 routes fail closed (401)');
}
