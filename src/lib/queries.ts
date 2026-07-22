// Persisted-query names, in one place. These are the query names created and
// PUBLISHED in AEM under the AEM_CF_PREFIX namespace. Change them here if the
// customer's queries are named differently; nothing else hardcodes a name.
//
// The NYL build reused a borrowed "securbank/" prefix inline in several files
// and even shipped a wrangler default (AccountDashboard) that did not match the
// queries actually called. Keeping names here, and the prefix in aem-config,
// removes that class of mistake.

export const QUERIES = {
  /** Returns a list of Article content fragments for the card grid. */
  articleList: 'ArticleList',
  /** Returns a list of Offer content fragments for the carousel. */
  offerList: 'OfferList',
  /** Returns a single Offer by DAM path (fallback when no list query exists). */
  offerByPath: 'OfferByPath',
} as const;

export type QueryName = (typeof QUERIES)[keyof typeof QUERIES];
