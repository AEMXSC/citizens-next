# citizens-next

Citizens Bank instance of the [`aem-ue-headless-next`](https://github.com/AEMXSC/aem-ue-headless-next) starter — a **Next.js App Router** app that:

- consumes **AEM Content Fragments** over GraphQL persisted queries, and
- is **live-editable in Universal Editor** (the same fragment edited once updates this app and any other surface reading the same CFs).

It also includes `src/lib/da-sc.ts`, a second content path reading **DA Structured Content** for the `/compare` page — a side-by-side of the two Adobe-native authoring/delivery models on the identical `Offer` content shape. See that page's "When to pick which" section for the recommendation and reasoning.

It is the app-surface half of the cross-surface story: pair it with an AEM EDS/DA website reading the same fragments, and one edit updates both.

## Quick start (local dev)

```bash
git clone https://github.com/AEMXSC/citizens-next.git
cd citizens-next
cp .env.example .env.local   # configure the AEM values, then see Configuration below
npm install
npm run dev                  # http://localhost:3000
```

See [PLAYBOOK.md](./PLAYBOOK.md) for the full stand-up-a-new-customer runbook this repo was built from.

## Deploy (Vercel)

Live at **https://citizens-next.vercel.app**. Vercel project `citizens-next` lives under the `remekies-projects` team.

**This repo is intentionally public.** Vercel's free/individual GitHub integration can only auto-import a *private* repo if the Vercel GitHub App has org-level access granted on `AEMXSC` (which it doesn't, by design — it's Adobe org-owned). Public avoids that permission dance entirely: anyone can import it into their own Vercel account with zero org admin involvement. No secrets are committed (`.env*`, `.vercel` are gitignored) — always confirm that stays true before pushing.

**First-time setup for a new team member / new Vercel account:**

1. [vercel.com/new](https://vercel.com/new) → Import Git Repository → `AEMXSC/citizens-next`.
2. In the import screen, add the env vars from the table below (same values as your `.env.local`; leave `UE_ENABLED=false` for the public deploy).
3. Click Deploy. From then on, every push to `main` auto-deploys to production — no further action needed.

**If you already have access to the existing Vercel project** (ask to be added to the `remekies-projects` team) instead of importing your own copy:

```bash
npm i -g vercel
vercel login                 # or: vercel --token <token from vercel.com/account/tokens>
cd citizens-next
vercel link                  # links to the existing citizens-next project
vercel --prod                # manual deploy; not needed once Git auto-deploy is confirmed working
```

A personal token (`vercel.com/account/tokens`) is the easiest non-interactive path — e.g. for CI or an agent — set it as `VERCEL_TOKEN` in your shell rather than passing `--token` inline.

## Configuration

All configuration lives in `.env.local`. `src/lib/aem-config.ts` is the only module that reads it.

| Variable | Required | Purpose |
|---|---|---|
| `AEM_PUBLISH` | yes | Publish origin for public reads |
| `AEM_CF_PREFIX` | yes | Persisted-query namespace (segment after `/graphql/execute.json/`) |
| `AEM_AUTHOR` | for UE | Author origin, used for the Universal Editor connection |
| `AEM_TOKEN` | if gated | Bearer token for non-public persisted queries |
| `UE_ENABLED` | no | `true` only when serving inside Universal Editor |
| `EDS_CONTENT_ENABLED` | no | Set to `true` to read cards and insights from the EDS list API. Defaults to `false`. |
| `EDS_WORKER_BASE` | no | Worker origin for EDS list reads. Defaults to `https://da-sc.adobeaem.workers.dev`. Use `http://127.0.0.1:8787` for a local worker. |
| `NEXT_PUBLIC_FONT_KIT` | no | Adobe Fonts kit id for the brand font |
| `NEXT_PUBLIC_BRAND_NAME` | no | Masthead label |

`src/lib/da-sc.ts` (the DA Structured Content path used by `/compare`) is **not** env-configured — the org/site (`aemxsc`/`citizens`) are hardcoded constants at the top of the file. Edit them directly if reusing this repo for another tenant.

## EDS content opt-in

By default, cards use AEM's Content Fragment Delivery API and insights use the AEM `ArticleList` persisted query. With `EDS_CONTENT_ENABLED=true`, the app fetches both collections from `GET https://da-sc.adobeaem.workers.dev/live/exp-workspace/frescopa?limit=50` and follows the opaque `cursor` returned on each non-final page. It selects indexed documents under `/forms/citizens/cards/<slug>` and `/forms/citizens/insights/<slug>` in the Frescopa EDS index. The list endpoint has no server-side path filter. Offers and disclosures continue to use AEM. The separate `/compare` page still reads DA offers from `aemxsc/citizens`.

Each card document needs string fields `creditCardName`, `shortSummary`, `benefitsSummaryRich`, `creditCardImage`, and `imageAlt`. Each insight needs string fields `headline`, `main`, `heroImage`, and `imageAlt`. Both types need a numeric `displayOrder`, which controls their order on the homepage even when the index returns a different order. Use HTTPS image URLs, `/content/dam/...` paths, or root-relative EDS media paths. The source page and image assets must be published before enabling the switch. Missing fields or failed indexed documents are reported as errors rather than silently substituted with AEM content. EDS cards and insights do not receive AEM Universal Editor bindings.

To test before the worker route is deployed publicly, run `npm run dev -- --port 8787` in the `da-sc` checkout (install dependencies with `npm ci` only if missing). Keep the worker running, then run `EDS_CONTENT_ENABLED=true EDS_WORKER_BASE=http://127.0.0.1:8787 npm run dev` in this checkout. Visit `http://localhost:3000` and look for four fictional cards, three fictional insights, and their images. The worker should return seven entries at `http://127.0.0.1:8787/live/exp-workspace/frescopa?limit=50`. For a cursor response, request the same endpoint with `limit=2`, then pass its `cursor` back unchanged as the next request's `cursor` parameter. Remove `EDS_WORKER_BASE` after the public worker is deployed. This setting affects cards and insights only.

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
- The offer carousel fetches `OfferByPath` queries, one per configured offer path.
- No customer data is hardcoded; all content comes from Content Fragments.
