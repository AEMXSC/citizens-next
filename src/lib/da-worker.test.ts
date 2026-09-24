import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getAemConfig, type AemConfig } from './aem-config';
import { getStructuredOffers } from './da-sc';
import { workerOrigin } from './da-worker';
import { getEdsCards } from './eds-content';

function config(edsWorkerBase: string | null): AemConfig {
  return { ...getAemConfig(), edsWorkerBase };
}

test('requires a configured worker origin and rejects insecure remote URLs', () => {
  assert.throws(() => workerOrigin(config(null)), /EDS_WORKER_BASE is required/);
  assert.throws(() => workerOrigin(config('http://example.com')), /HTTPS origin or a local HTTP origin/);
  assert.throws(() => workerOrigin(config('https://example.com/path')), /HTTPS origin or a local HTTP origin/);
  assert.equal(workerOrigin(config('https://example.com')).href, 'https://example.com/');
  assert.equal(workerOrigin(config('http://127.0.0.1:8787')).href, 'http://127.0.0.1:8787/');
});

test('both DA offers use the configured worker and resolve AEM image paths', async (t) => {
  const requests: string[] = [];
  t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    requests.push(url.href);
    return Response.json({ data: {
      pretitle: 'Demo', headline: url.pathname.split('/').pop(),
      heroImage: '/content/dam/example.png',
    } });
  });

  const result = await getStructuredOffers(config('https://worker.example.com'));

  assert.deepEqual(result.map(({ slug }) => slug), ['citizens-checking', 'citizens-savings']);
  assert.ok(result.every(({ heroImage }) =>
    heroImage === `${getAemConfig().publish}/content/dam/example.png`));
  assert.equal(requests.length, 2);
  assert.ok(requests.every((url) =>
    url.startsWith('https://worker.example.com/live/aemxsc/citizens/sc/')));
});

test('EDS list requests use the same configured origin and fail without it', async (t) => {
  const requests: string[] = [];
  t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) => {
    requests.push(String(input));
    return Response.json({ count: 0, total: 0, items: [] });
  });
  const prefix = '/forms/citizens/cards/';

  assert.deepEqual(await getEdsCards(config('https://worker.example.com'), prefix), []);
  assert.equal(new URL(requests[0]).origin, 'https://worker.example.com');
  assert.equal(new URL(requests[0]).searchParams.get('path'), prefix);
  assert.throws(() => getEdsCards(config(null), prefix), /EDS_WORKER_BASE is required/);
  assert.equal(requests.length, 1);
});
