# aem-ue-headless-next

A reusable **Next.js App Router** starter for a headless frontend that:

- consumes **AEM Content Fragments** over GraphQL persisted queries, and
- is **live-editable in Universal Editor** (the same fragment edited once updates this app and any other surface reading the same CFs).

It is the app-surface half of the cross-surface story: pair it with an AEM EDS/DA website reading the same fragments, and one edit updates both. Point it at a new tenant by editing `.env.local`, nothing else.

## Quick start

```bash
cp .env.example .env.local   # fill in the six values
npm install
npm run dev                  # http://localhost:3000
```

See [PLAYBOOK.md](./PLAYBOOK.md) for the full stand-up-a-new-customer runbook.

## Configuration

All configuration lives in `.env.local`. `src/lib/aem-config.ts` is the only module that reads it.

| Variable | Required | Purpose |
|---|---|---|
| `AEM_PUBLISH` | yes | Publish origin for public reads |
| `AEM_CF_PREFIX` | yes | Persisted-query namespace (segment after `/graphql/execute.json/`) |
| `AEM_AUTHOR` | for UE | Author origin, used for the Universal Editor connection |
| `AEM_TOKEN` | if gated | Bearer token for non-public persisted queries |
| `UE_ENABLED` | no | `true` only when serving inside Universal Editor |
| `NEXT_PUBLIC_FONT_KIT` | no | Adobe Fonts kit id for the brand font |
| `NEXT_PUBLIC_BRAND_NAME` | no | Masthead label |

## Structure

```
src/
  app/
    layout.tsx                  UE connection meta + cors.js (when UE_ENABLED)
    page.tsx                    SSR home: OfferCarousel + ArticleGrid
    api/graphql/[...q]/route.ts server proxy to AEM (CORS + auth)
  lib/
    aem-config.ts               THE one env reader
    aem-client.ts               persisted-query reads + CF types
    queries.ts                  persisted-query names
    ue.ts                       data-aue-* instrumentation helpers
  components/                   ArticleCard, ArticleGrid, OfferCarousel, CFImage
  styles/tokens.css             brand tokens (the one skin file)
```

## How editing works

When `UE_ENABLED=true`, `layout.tsx` injects `<meta name="urn:adobe:aue:system:aemconnection" content="aem:<AEM_AUTHOR>">` and the Universal Editor `cors.js`. Components carry `data-aue-*` attributes (built by `src/lib/ue.ts`) that bind each element to a Content Fragment field. Universal Editor reads those attributes to make the app editable and writes changes back to the AEM author. On the public deploy (`UE_ENABLED=false`) the attributes are omitted and the DOM stays clean.

## Notes

- Content Fragment images use a plain responsive `<picture>` (`CFImage.tsx`) rather than `next/image`, because Dynamic Media / Scene7 URLs carry query parameters `next/image` would strip.
- The offer carousel fetches one `OfferList` query, not one request per offer.
- No customer data is hardcoded; all content comes from Content Fragments.
