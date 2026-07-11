import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';

import { loadConfig } from '../src/config.js';
import { createServer } from '../src/server.js';

const env = {
  BOT_TRIGGER_PHRASES: '/juya review',
  ALLOWED_USERS: 'alice',
  ALLOWED_REPO_OWNERS: 'alice',
  BOT_REPO_ROOT: '/data/repos',
  GITHUB_APP_ID: '12345',
  GITHUB_WEBHOOK_SECRET: 'webhook-secret',
  OCR_LLM_URL: 'https://api.example.com',
  OCR_LLM_TOKEN: 'ocr-token',
  OCR_LLM_MODEL: 'model',
};

test('Juya icon route is public, exact, and returns a bounded JPEG response', async (t) => {
  const server = createServer(loadConfig(env), { adminRuntime: { dashboard: async () => ({}) } });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.shutdown({ timeoutMs: 1000 }));

  const icon = await request(server, 'GET', '/admin/assets/juya.jpg');
  assert.equal(icon.status, 200);
  assert.equal(icon.headers['content-type'], 'image/jpeg');
  assert.equal(icon.headers['x-content-type-options'], 'nosniff');
  assert.equal(icon.headers['cache-control'], 'public, max-age=3600');
  assert.ok(icon.body.length > 0);
  assert.deepEqual([...icon.body.subarray(0, 3)], [0xff, 0xd8, 0xff]);

  for (const pathName of [
    '/admin/assets/package.json',
    '/admin/assets/../package.json',
    '/admin/assets/juya.jpg?download=1',
  ]) {
    const response = await request(server, 'GET', pathName);
    assert.notEqual(response.status, 200, pathName);
  }

  const post = await request(server, 'POST', '/admin/assets/juya.jpg');
  assert.notEqual(post.status, 200);
});

function request(server, method, pathName) {
  const address = server.address();
  assert.equal(typeof address, 'object');
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: address.port,
      method,
      path: pathName,
    }, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks),
      }));
    });
    req.on('error', reject);
    req.end();
  });
}
