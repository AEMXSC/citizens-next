// DA Structured Content client. Reads Offer documents authored in Document
// Authoring against the `offer` schema and delivered as JSON by the DA
// Structured Content worker. Server-side fetch (no CORS). This is the DA-native
// counterpart to the AEM Content Fragment path in aem-client.ts — same content
// model, different authoring + delivery stack.

import { getAemConfig } from './aem-config';

const DA_SC_BASE = 'https://da-sc.adobeaem.workers.dev';
const ORG = 'aemxsc';
const SITE = 'citizens';

// The Offer documents authored under the DA `sc/` folder.
const SC_OFFER_SLUGS = ['citizens-checking', 'citizens-savings'];

export interface StructuredOffer {
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

export async function getStructuredOffers(): Promise<StructuredOffer[]> {
  const results = await Promise.all(SC_OFFER_SLUGS.map((s) => fetchOffer(s)));
  const out: StructuredOffer[] = [];
  for (const o of results) {
    if (o) out.push(o);
  }
  return out;
}
