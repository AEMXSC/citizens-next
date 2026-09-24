import type { AemConfig } from './aem-config';

export function workerOrigin(config: AemConfig): URL {
  if (!config.edsWorkerBase) {
    throw new Error('[da-worker] EDS_WORKER_BASE is required for structured-content reads');
  }

  let origin: URL;
  try {
    origin = new URL(config.edsWorkerBase);
  } catch {
    throw new Error('[da-worker] EDS_WORKER_BASE must be a valid origin');
  }

  const isLocal = origin.hostname === 'localhost' || origin.hostname === '127.0.0.1';
  if ((origin.protocol !== 'https:' && !(origin.protocol === 'http:' && isLocal))
    || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) {
    throw new Error('[da-worker] EDS_WORKER_BASE must be an HTTPS origin or a local HTTP origin');
  }
  return origin;
}
