# citizens-next

Citizens Bank instance of the [`aem-ue-headless-next`](https://github.com/AEMXSC/aem-ue-headless-next) starter. This **Next.js App Router** app supports both delivery paths.

- reads AEM Content Fragments by default, with optional EDS delivery for the homepage banner, cards, and insights.
- supports Universal Editor for AEM-backed content.

It also includes `src/lib/da-sc.ts`, a second content path reading **DA Structured Content** for the `/compare` page — a side-by-side of the two Adobe-native authoring/delivery models on the identical `Offer` content shape. See that page's "When to pick which" section for the recommendation and reasoning.

It is the app surface of a cross-surface demo. The AEM and EDS delivery paths are separate.

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

Configure server-side values in the ignored `.env.local` or your deployment environment. `src/lib/aem-config.ts` reads them.

| Variable | Required | Purpose |
|---|---|---|
| `AEM_PUBLISH` | for a different AEM instance | Publish origin for public reads. The demo instance is the default. |
| `AEM_CF_PREFIX` | for a different AEM instance | Persisted-query namespace (segment after `/graphql/execute.json/`). The demo prefix is the default. |
| `AEM_AUTHOR` | for UE | Author origin, used for the Universal Editor connection |
| `AEM_TOKEN` | if gated | Bearer token for non-public persisted queries |
| `UE_ENABLED` | no | `true` only when serving inside Universal Editor |
| `EDS_CONTENT_ENABLED` | no | Switch homepage banner, cards, and insights to EDS when `true`. Defaults to `false`. |
| `EDS_WORKER_BASE` | for EDS lists and `/compare` | Structured-content worker origin. Use `http://127.0.0.1:8787` for a local worker. |
| `EDS_GRAPHQL_ENDPOINT` | for EDS mode | Complete external HTTPS banner GraphQL URL, configured outside source control. |
| `EDS_GRAPHQL_TOKEN` | if gated | Optional server-side bearer token. Do not expose it with a `NEXT_PUBLIC_` prefix. |
| `NEXT_PUBLIC_FONT_KIT` | no | Adobe Fonts kit id for the brand font |
| `NEXT_PUBLIC_BRAND_NAME` | no | Masthead label |

The `/compare` DA offer feed uses `EDS_WORKER_BASE`. Its org/site identifiers (`aemxsc`/`citizens`) remain in `src/lib/da-sc.ts`. Without a configured worker origin, the DA comparison column stays empty and reports the configuration error in server logs.

## EDS content opt-in

| Homepage section | Default | EDS mode |
|---|---|---|
| Rotating banner | AEM `OfferByPath` | One server-side `citizensDemoBanners` GraphQL request |
| Credit cards | AEM Content Fragment Delivery API | EDS list API under `/forms/citizens/cards/` |
| Insights | AEM `ArticleList` | EDS list API under `/forms/citizens/insights/` |

Set `EDS_CONTENT_ENABLED=true` and provide the full external HTTPS `EDS_GRAPHQL_ENDPOINT` to enable EDS mode. Keep the URL in `.env.local` or deployment configuration, not source control. Set `EDS_GRAPHQL_TOKEN` only if required by the service. The EDS list worker must support path filtering. For local worker testing, set `EDS_WORKER_BASE=http://127.0.0.1:8787` and start the app with `npm run dev`. If the GraphQL endpoint is missing, EDS mode fails clearly instead of showing mock data.

EDS documents must be published before their live image URLs resolve. The app validates required fields and sorts each collection by `displayOrder`. Disclosures still use AEM, and `/compare` keeps its AEM and DA offer feeds. EDS content does not receive AEM Universal Editor bindings.

## Structure

```
src/
  app/
    layout.tsx                  UE connection meta + cors.js (when UE_ENABLED)
    page.tsx                    Homepage data selection and rendering
    api/graphql/[...q]/route.ts Server proxy for AEM persisted queries
  lib/
    aem-config.ts               Server-side configuration
    aem-client.ts               AEM persisted-query reads and types
    cf-delivery.ts              AEM Content Fragment Delivery API
    da-worker.ts                Configured structured-content worker origin
    eds-content.ts              EDS list API for cards and insights
    eds-graphql.ts              EDS GraphQL banner query
    da-sc.ts                    DA offer feed for /compare
  components/                   OfferHero, CardsSection, InsightsGrid
  styles/tokens.css             Brand tokens
```

## How editing works

When `UE_ENABLED=true`, `layout.tsx` adds the AEM connection and Universal Editor script. AEM-backed components have `data-aue-*` bindings to Content Fragment fields. EDS-backed banner, card, and insight content is authored separately and has no AEM bindings.

## Notes

- Images use plain `<img>` elements so AEM Dynamic Media URLs retain their query parameters.
- The default offer carousel fetches one AEM `OfferByPath` result per configured path. EDS mode fetches the banner list in one GraphQL request.
- The dashboard uses a placeholder profile and account figures rather than data from a customer API.
