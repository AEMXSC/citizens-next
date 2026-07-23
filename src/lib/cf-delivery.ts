// AEM Content Fragment Delivery API client. Used for CF types that have no
// persisted GraphQL query on this instance (cards, disclosures). Lists a DAM
// folder and flattens each fragment's fields to a simple name -> values map.
// Public on publish, so read server-side (no CORS, no token unless gated).

import type { AemConfig } from './aem-config';

interface DeliveryField {
  name: string;
  type: string;
  values?: string[];
}

interface DeliveryItem {
  path?: string;
  fields?: DeliveryField[];
}

export interface Fragment {
  readonly slug: string;
  readonly path: string;
  readonly fields: Readonly<Record<string, readonly string[]>>;
}

function flatten(item: DeliveryItem): Fragment {
  const fields: Record<string, string[]> = {};
  for (const f of item.fields ?? []) fields[f.name] = f.values ?? [];
  const path = item.path ?? '';
  return { slug: path.split('/').pop() ?? '', path, fields };
}

/** List the content fragments directly under a DAM folder. */
export async function listFragments(config: AemConfig, folder: string): Promise<Fragment[]> {
  if (!config.publish) throw new Error('[cf-delivery] AEM publish origin not configured');
  const url = `${config.publish}/adobe/sites/cf/fragments?path=${folder}`;
  const headers: Record<string, string> = { accept: 'application/json' };
  if (config.token) headers.authorization = `Bearer ${config.token}`;

  const res = await fetch(url, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`[cf-delivery] "${folder}" returned HTTP ${res.status}`);
  const json = (await res.json()) as { items?: DeliveryItem[] };
  const items = Array.isArray(json.items) ? json.items : [];
  return items
    .filter((it) => typeof it.path === 'string' && it.path.startsWith(`${folder}/`))
    .map(flatten);
}

function first(fragment: Fragment, name: string): string {
  return fragment.fields[name]?.[0] ?? '';
}

export interface CardCF {
  readonly slug: string;
  readonly path: string;
  readonly name: string;
  readonly summary: string;
  readonly benefitsHtml: string;
  readonly image: string;
}

/** Credit-card Content Fragments (citizens/en/cards). */
export async function getCards(config: AemConfig): Promise<CardCF[]> {
  const frs = await listFragments(config, '/content/dam/citizens/en/cards');
  return frs.map((fr) => {
    const ref = first(fr, 'creditCardImage');
    const image = ref.startsWith('/') ? `${config.publish}${ref}` : ref;
    return {
      slug: fr.slug,
      path: fr.path,
      name: first(fr, 'creditCardName'),
      summary: first(fr, 'shortSummary'),
      benefitsHtml: first(fr, 'benefitsSummaryRich'),
      image,
    };
  });
}

export interface DisclosureCF {
  readonly slug: string;
  readonly path: string;
  readonly title: string;
  readonly bodyHtml: string;
}

/** Term & Condition (disclosure) Content Fragments (citizens/en/disclosures). */
export async function getDisclosureCFs(config: AemConfig): Promise<DisclosureCF[]> {
  const frs = await listFragments(config, '/content/dam/citizens/en/disclosures');
  return frs.map((fr) => ({
    slug: fr.slug,
    path: fr.path,
    title: first(fr, 'termsReference'),
    bodyHtml: first(fr, 'termDetails'),
  }));
}

/** Build the Universal Editor resource URN for a Content Fragment path. */
export function aueResource(path: string): string {
  return `urn:aemconnection:${path}/jcr:content/data/master`;
}
