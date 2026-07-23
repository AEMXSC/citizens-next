// AEM GraphQL persisted-query client. Reads run against AEM publish (public),
// which is what reliably worked on the NYL build; Universal Editor handles the
// edit round-trip separately through its own author connection (see layout.tsx
// and ue.ts). A single list query per collection avoids the N+1 the NYL worker
// had (one fetch per offer slug).
//
// Two entry points share persistedPath():
//  - fetchPersisted(): server-side reads for React Server Components.
//  - the route handler at app/api/graphql/[...q] forwards client-side reads.

import type { AemConfig } from './aem-config';
import { QUERIES } from './queries';

export interface PersistedParams {
  readonly [key: string]: string | number;
}

export interface CFImageRef {
  readonly _dmS7Url?: string;
  readonly _publishUrl?: string;
  readonly _dynamicUrl?: string;
}

export interface Article {
  readonly _path?: string;
  readonly headline?: string;
  readonly main?: { readonly plaintext?: string; readonly html?: string };
  readonly heroImage?: CFImageRef;
}

export interface Offer {
  readonly _path?: string;
  readonly pretitle?: string;
  readonly headline?: string;
  readonly detail?: { readonly plaintext?: string; readonly html?: string };
  readonly heroImage?: CFImageRef;
}

// The showcase instance exposes Offer fragments via OfferByPath (there is no
// OfferList query). These are the same four Offer CFs the NYL app and the
// Citizens EDS "offer" block consume.
const OFFER_PATHS = [
  '/content/dam/nyl/en/offers/nyl-life',
  '/content/dam/nyl/en/offers/nyl-retirement',
  '/content/dam/nyl/en/offers/nyl-investments',
  '/content/dam/nyl/en/offers/nyl-whole-life',
];

/**
 * Build a persisted-query path with matrix parameters, e.g.
 * /graphql/execute.json/<prefix>/OfferByPath;path=/content/dam/x;variation=main
 * Values are left raw (not percent-encoded): AEM's matrix-param parser expects
 * literal slashes in path values, and encoding them returns the wrong fragment.
 */
export function persistedPath(
  prefix: string,
  name: string,
  params: PersistedParams = {},
): string {
  const matrix = Object.entries(params)
    .map(([key, value]) => `;${key}=${value}`)
    .join('');
  return `/graphql/execute.json/${prefix}/${name}${matrix}`;
}

export interface FetchOptions {
  /** Override the base origin; defaults to publish. */
  readonly base?: string;
}

/**
 * Server-side read of a persisted query. Attaches the bearer token when the
 * tenant's queries are gated (config.token set); otherwise anonymous.
 */
export async function fetchPersisted<T = unknown>(
  config: AemConfig,
  name: string,
  params: PersistedParams = {},
  options: FetchOptions = {},
): Promise<T> {
  const base = options.base ?? config.publish;
  if (!base) {
    throw new Error('[aem-client] AEM publish origin is not configured (AEM_PUBLISH)');
  }
  const path = persistedPath(config.cfPrefix, name, params);
  const url = `${base}${path}?ts=${Date.now()}`;

  const headers: Record<string, string> = { accept: 'application/json' };
  if (config.token) {
    headers.authorization = `Bearer ${config.token}`;
  }

  const res = await fetch(url, { headers, cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`[aem-client] persisted query "${name}" returned HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

interface ListResponse<K extends string, T> {
  data?: Record<K, { items?: readonly T[] } | undefined>;
}

/** Fetch the Article list for the card grid. Returns [] on empty/missing data. */
export async function getArticles(config: AemConfig): Promise<readonly Article[]> {
  const json = await fetchPersisted<ListResponse<'articleList', Article>>(
    config,
    QUERIES.articleList,
  );
  return json.data?.articleList?.items ?? [];
}

interface OfferByPathResponse {
  data?: { offerByPath?: { item?: Offer } };
}

/**
 * Fetch the Offer fragments for the hero carousel via OfferByPath, one per
 * path, in parallel. Missing/failed offers are dropped so a single bad path
 * never blanks the carousel.
 */
export async function getOffers(config: AemConfig): Promise<readonly Offer[]> {
  const results = await Promise.all(
    OFFER_PATHS.map(async (path): Promise<Offer | null> => {
      try {
        const json = await fetchPersisted<OfferByPathResponse>(config, QUERIES.offerByPath, {
          path,
          variation: 'main',
        });
        const item = json.data?.offerByPath?.item;
        return item ? { ...item, _path: path } : null;
      } catch {
        return null;
      }
    }),
  );
  const offers: Offer[] = [];
  for (const offer of results) {
    if (offer) offers.push(offer);
  }
  return offers;
}

/** Best available delivery URL for a CF image reference. */
export function imageUrl(ref: CFImageRef | undefined): string {
  if (!ref) return '';
  return ref._dmS7Url || ref._publishUrl || ref._dynamicUrl || '';
}
