// DA Structured Content client. Reads Offer documents authored in Document
// Authoring against the `offer` schema. Two delivery paths, same documents:
//  - Content AI GraphQL (POC, VPN-only) when CONTENT_AI_GQL_URL is set;
//  - the DA Structured Content worker JSON otherwise, or if GraphQL fails.
// Server-side fetch (no CORS). This is the DA-native counterpart to the AEM
// Content Fragment path in aem-client.ts — same content model, different
// authoring + delivery stack.

import { getAemConfig } from './aem-config';

const DA_SC_BASE = 'https://da-sc.adobeaem.workers.dev';
const ORG = 'aemxsc';
const SITE = 'citizens';

// The Offer documents authored under the DA `sc/` folder.
const SC_OFFER_SLUGS = ['citizens-checking', 'citizens-savings'];

// The POC is VPN-only and can take ~4s to answer; give up after 10s and fall back.
const GQL_TIMEOUT_MS = 10000;

const OFFER_LIST_QUERY = `{
  offerList(filter: { condition: { selector: "path", operator: PREFIX, value: "sc/" } }) {
    items { path data { pretitle headline detail callToAction ctaUrl heroImage } }
  }
}`;

export type StructuredSource = 'content-ai-graphql' | 'da-sc-worker';

export interface StructuredOffer {
  readonly source: StructuredSource;
  readonly slug: string;
  readonly pretitle: string;
  readonly headline: string;
  readonly detail: string;
  readonly callToAction: string;
  readonly ctaUrl: string;
  readonly heroImage: string;
}

interface DeliveryDoc {
  metadata?: { schemaName?: string };
  data?: Record<string, string>;
}

function resolveImage(ref: string): string {
  if (!ref) return '';
  return ref.startsWith('/') ? `${getAemConfig().publish}${ref}` : ref;
}

// Try live (published) first, then preview, so the page works as soon as the
// doc is previewed and upgrades to the published copy once it is live.
async function fetchOffer(slug: string): Promise<StructuredOffer | null> {
  for (const env of ['live', 'preview']) {
    const url = `${DA_SC_BASE}/${env}/${ORG}/${SITE}/sc/${slug}?ts=${Date.now()}`;
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) continue;
      const json = (await res.json()) as DeliveryDoc;
      const d = json.data;
      if (!d) continue;
      return {
        source: 'da-sc-worker',
        slug,
        pretitle: d.pretitle ?? '',
        headline: d.headline ?? '',
        detail: d.detail ?? '',
        callToAction: d.callToAction ?? '',
        ctaUrl: d.ctaUrl ?? '',
        heroImage: resolveImage(d.heroImage ?? ''),
      };
    } catch {
      // try next env
    }
  }
  return null;
}

interface GqlOfferItem {
  path?: string;
  data?: Record<string, string | null>;
}

interface GqlResponse {
  data?: { offerList?: { items?: GqlOfferItem[] } };
  errors?: { message?: string }[];
}

// "sc/citizens-checking.html" -> "citizens-checking"
function slugFromPath(path: string): string {
  return (path.split('/').pop() ?? '').replace(/\.html$/, '');
}

async function fetchOffersFromGraphql(url: string): Promise<StructuredOffer[]> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-content-ai-routing': JSON.stringify({ org: ORG, site: SITE }),
    },
    body: JSON.stringify({ query: OFFER_LIST_QUERY }),
    cache: 'no-store',
    signal: AbortSignal.timeout(GQL_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as GqlResponse;
  if (json.errors?.length) throw new Error(json.errors[0].message ?? 'GraphQL error');
  const items = json.data?.offerList?.items ?? [];
  const bySlug = new Map(items.map((it) => [slugFromPath(it.path ?? ''), it.data ?? {}]));
  // Keep the same offers, in the same order, as the worker path.
  return SC_OFFER_SLUGS.flatMap((slug): StructuredOffer[] => {
    const d = bySlug.get(slug);
    if (!d) return [];
    return [{
      source: 'content-ai-graphql',
      slug,
      pretitle: d.pretitle ?? '',
      headline: d.headline ?? '',
      detail: d.detail ?? '',
      callToAction: d.callToAction ?? '',
      ctaUrl: d.ctaUrl ?? '',
      heroImage: resolveImage(d.heroImage ?? ''),
    }];
  });
}

export async function getStructuredOffers(): Promise<StructuredOffer[]> {
  const { contentAiGqlUrl } = getAemConfig();
  if (contentAiGqlUrl) {
    try {
      const offers = await fetchOffersFromGraphql(contentAiGqlUrl);
      if (offers.length > 0) return offers;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`[da-sc] Content AI GraphQL unavailable, using da-sc worker: ${String(err)}`);
    }
  }
  const results = await Promise.all(SC_OFFER_SLUGS.map((s) => fetchOffer(s)));
  const out: StructuredOffer[] = [];
  for (const o of results) {
    if (o) out.push(o);
  }
  return out;
}
