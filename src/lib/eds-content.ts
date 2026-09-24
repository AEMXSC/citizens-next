import type { AemConfig } from './aem-config';
import type { Article } from './aem-client';
import type { Card } from './cf-delivery';
import { DA_SC_BASE } from './da-sc';

const EDS_ORG = 'exp-workspace';
const EDS_SITE = 'frescopa';
const EDS_ORIGIN = `https://main--${EDS_SITE}--${EDS_ORG}.aem.live`;
const PAGE_SIZE = 50;

interface ListedDocument {
  path: string;
  json: unknown;
}

interface ListPage {
  items: unknown[];
  cursor?: string;
}

interface Ordered<T> {
  order: number;
  value: T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readPage(value: unknown): ListPage {
  if (!isRecord(value) || !Array.isArray(value.items)
    || typeof value.total !== 'number' || !Number.isSafeInteger(value.total) || value.total < 0
    || value.count !== value.items.length
    || (value.cursor !== undefined && (typeof value.cursor !== 'string' || !value.cursor))) {
    throw new Error('[eds-content] Invalid structured-content list response');
  }
  return { items: value.items, cursor: value.cursor };
}

function listEndpoint(config: AemConfig): URL {
  let base: URL;
  try {
    base = new URL(config.edsWorkerBase ?? DA_SC_BASE);
  } catch {
    throw new Error('[eds-content] EDS_WORKER_BASE must be a valid origin');
  }
  const isLocal = base.hostname === 'localhost' || base.hostname === '127.0.0.1';
  if ((base.protocol !== 'https:' && !(base.protocol === 'http:' && isLocal))
    || base.pathname !== '/' || base.search || base.hash || base.username || base.password) {
    throw new Error('[eds-content] EDS_WORKER_BASE must be an HTTPS origin or a local HTTP origin');
  }
  return new URL(`/live/${EDS_ORG}/${EDS_SITE}`, base);
}

function readString(data: Record<string, unknown>, field: string, path: string): string {
  const value = data[field];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`[eds-content] "${path}" is missing the string field "${field}"`);
  }
  return value;
}

function readOrder(data: Record<string, unknown>, path: string): number {
  const order = data.displayOrder;
  if (typeof order !== 'number' || !Number.isSafeInteger(order) || order < 0) {
    throw new Error(`[eds-content] "${path}" is missing a valid displayOrder`);
  }
  return order;
}

function imageUrl(ref: string, publish: string): string {
  if (ref.startsWith('https://')) return ref;
  if (ref.startsWith('/content/dam/')) return `${publish}${ref}`;
  if (ref.startsWith('/') && !ref.startsWith('//')) return `${EDS_ORIGIN}${ref}`;
  throw new Error(`[eds-content] Unsupported image URL "${ref}"`);
}

function documentData(item: ListedDocument): Record<string, unknown> {
  if (!isRecord(item.json) || !isRecord(item.json.data)) {
    throw new Error(`[eds-content] "${item.path}" has no structured-content data`);
  }
  return item.json.data;
}

function asCard(item: ListedDocument, config: AemConfig): Ordered<Card> {
  const data = documentData(item);
  return {
    order: readOrder(data, item.path),
    value: {
      slug: item.path.slice(item.path.lastIndexOf('/') + 1),
      path: item.path,
      name: readString(data, 'creditCardName', item.path),
      summary: readString(data, 'shortSummary', item.path),
      benefitsHtml: readString(data, 'benefitsSummaryRich', item.path),
      image: imageUrl(readString(data, 'creditCardImage', item.path), config.publish),
      imageAlt: readString(data, 'imageAlt', item.path),
    },
  };
}

function asArticle(item: ListedDocument, config: AemConfig): Ordered<Article> {
  const data = documentData(item);
  return {
    order: readOrder(data, item.path),
    value: {
      _path: item.path,
      headline: readString(data, 'headline', item.path),
      main: { plaintext: readString(data, 'main', item.path) },
      heroImage: { _publishUrl: imageUrl(readString(data, 'heroImage', item.path), config.publish) },
      heroImageAlt: readString(data, 'imageAlt', item.path),
    },
  };
}

async function listCollection<T>(
  endpoint: URL,
  prefix: string,
  convert: (item: ListedDocument) => Ordered<T>,
): Promise<T[]> {
  const documents: Ordered<T>[] = [];
  const seenCursors = new Set<string>();
  let cursor: string | undefined;

  while (true) {
    const url = new URL(endpoint);
    url.searchParams.set('path', prefix);
    if (cursor !== undefined) url.searchParams.set('cursor', cursor);
    url.searchParams.set('limit', String(PAGE_SIZE));
    const response = await fetch(url, { headers: { accept: 'application/json' }, cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`[eds-content] List API for "${prefix}" returned HTTP ${response.status}`);
    }
    const page = readPage(await response.json());
    for (const item of page.items) {
      if (!isRecord(item) || typeof item.path !== 'string') {
        throw new Error('[eds-content] Invalid list item');
      }
      const path = `/${item.path.replace(/^\/+/, '')}`;
      if (!path.startsWith(prefix)) {
        throw new Error(`[eds-content] "${path}" is outside requested path "${prefix}"`);
      }
      if (!path.slice(path.lastIndexOf('/') + 1)) {
        throw new Error(`[eds-content] Invalid document path "${path}"`);
      }
      if ('error' in item) {
        throw new Error(`[eds-content] "${path}" returned HTTP ${item.status}: ${item.error}`);
      }
      if (!('json' in item)) {
        throw new Error(`[eds-content] "${path}" has no document or error`);
      }
      documents.push(convert({ path, json: item.json }));
    }
    if (page.cursor === undefined) {
      return documents.sort((a, b) => a.order - b.order).map(({ value }) => value);
    }
    if (!page.items.length || seenCursors.has(page.cursor)) {
      throw new Error('[eds-content] List API returned an empty page or repeated cursor');
    }
    seenCursors.add(page.cursor);
    cursor = page.cursor;
  }
}

export function getEdsCards(config: AemConfig, prefix: string): Promise<Card[]> {
  return listCollection(listEndpoint(config), prefix, (item) => asCard(item, config));
}

export function getEdsInsights(config: AemConfig, prefix: string): Promise<Article[]> {
  return listCollection(listEndpoint(config), prefix, (item) => asArticle(item, config));
}
