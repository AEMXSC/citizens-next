import type { AemConfig } from './aem-config';

export interface Banner {
  readonly id: string;
  readonly path: string;
  readonly displayOrder: number;
  readonly pretitle: string;
  readonly headline: string;
  readonly detail: string;
  readonly callToAction: string;
  readonly ctaUrl: string;
  readonly heroImage: string;
  readonly imageAlt: string;
  readonly demoDisclaimer: string;
}

const BANNERS_QUERY = `{
  citizensDemoBanners {
    id
    path
    displayOrder
    pretitle
    headline
    detail
    callToAction
    ctaUrl
    heroImage
    imageAlt
    demoDisclaimer
  }
}`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function endpointUrl(value: string | null): URL {
  if (!value) {
    throw new Error('[eds-graphql] EDS_GRAPHQL_ENDPOINT is required for EDS banners');
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('[eds-graphql] EDS_GRAPHQL_ENDPOINT must be an absolute URL');
  }
  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  const isLocal = hostname === 'localhost' || hostname.endsWith('.localhost')
    || /^127(?:\.\d{1,3}){3}$/.test(hostname)
    || hostname === '0.0.0.0' || hostname === '[::1]' || hostname === '[::]';
  if (url.protocol !== 'https:' || isLocal
    || url.username || url.password || url.search || url.hash) {
    throw new Error('[eds-graphql] EDS_GRAPHQL_ENDPOINT must be an external HTTPS URL with no credentials, query, or fragment');
  }
  return url;
}

function requiredString(value: Record<string, unknown>, field: string, index: number): string {
  const result = value[field];
  if (typeof result !== 'string' || !result.trim()) {
    throw new Error(`[eds-graphql] banners[${index}].${field} must be a non-empty string`);
  }
  return result;
}

function parseBanner(value: unknown, index: number): Banner {
  if (!isRecord(value)) {
    throw new Error(`[eds-graphql] banners[${index}] is not an object`);
  }
  const displayOrder = value.displayOrder;
  if (typeof displayOrder !== 'number' || !Number.isSafeInteger(displayOrder) || displayOrder < 1) {
    throw new Error(`[eds-graphql] banners[${index}].displayOrder must be a positive integer`);
  }
  const id = requiredString(value, 'id', index);
  const path = requiredString(value, 'path', index);
  if (path !== `/forms/citizens/banner/${id}`) {
    throw new Error(`[eds-graphql] banners[${index}].path must be a banner document`);
  }
  const heroImage = requiredString(value, 'heroImage', index);
  let imageUrl: URL;
  try {
    imageUrl = new URL(heroImage);
  } catch {
    throw new Error(`[eds-graphql] banners[${index}].heroImage must be an HTTPS URL`);
  }
  if (imageUrl.protocol !== 'https:') {
    throw new Error(`[eds-graphql] banners[${index}].heroImage must be an HTTPS URL`);
  }
  return {
    id,
    path,
    displayOrder,
    pretitle: requiredString(value, 'pretitle', index),
    headline: requiredString(value, 'headline', index),
    detail: requiredString(value, 'detail', index),
    callToAction: requiredString(value, 'callToAction', index),
    ctaUrl: requiredString(value, 'ctaUrl', index),
    heroImage,
    imageAlt: requiredString(value, 'imageAlt', index),
    demoDisclaimer: requiredString(value, 'demoDisclaimer', index),
  };
}

/** Read the ordered EDS banner collection with one GraphQL POST. */
export async function getBanners(config: AemConfig): Promise<readonly Banner[]> {
  const endpoint = endpointUrl(config.edsGraphqlEndpoint);
  if (config.edsGraphqlToken && /[\r\n]/.test(config.edsGraphqlToken)) {
    throw new Error('[eds-graphql] EDS_GRAPHQL_TOKEN contains invalid characters');
  }
  const headers: Record<string, string> = {
    accept: 'application/json',
    'content-type': 'application/json',
  };
  if (config.edsGraphqlToken) {
    headers.authorization = `Bearer ${config.edsGraphqlToken}`;
  }
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: BANNERS_QUERY }),
      cache: 'no-store',
    });
  } catch (error) {
    throw new Error('[eds-graphql] Banner query could not reach the GraphQL endpoint', { cause: error });
  }
  if (!response.ok) {
    throw new Error(`[eds-graphql] Banner query returned HTTP ${response.status}`);
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error('[eds-graphql] Banner query returned invalid JSON', { cause: error });
  }
  if (!isRecord(payload)) {
    throw new Error('[eds-graphql] Banner query returned an invalid response');
  }
  if ('errors' in payload) {
    if (!Array.isArray(payload.errors)) {
      throw new Error('[eds-graphql] Banner query returned malformed GraphQL errors');
    }
    if (payload.errors.length) {
      const messages = payload.errors.map((error) =>
        isRecord(error) && typeof error.message === 'string' ? error.message : 'Unknown GraphQL error');
      throw new Error(`[eds-graphql] Banner query failed: ${messages.join(', ')}`);
    }
  }
  if (!isRecord(payload.data) || !Array.isArray(payload.data.citizensDemoBanners)) {
    throw new Error('[eds-graphql] Banner query response is missing data.citizensDemoBanners');
  }
  return payload.data.citizensDemoBanners.map(parseBanner).sort((a, b) => a.displayOrder - b.displayOrder);
}
