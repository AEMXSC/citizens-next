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
cp .env.example .env.local   # fill in the six values — see Configuration below
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
| `NEXT_PUBLIC_FONT_KIT` | no | Adobe Fonts kit id for the brand font |
| `NEXT_PUBLIC_BRAND_NAME` | no | Masthead label |

`src/lib/da-sc.ts` (the DA Structured Content path used by `/compare`) is **not** env-configured — the org/site (`aemxsc`/`citizens`) are hardcoded constants at the top of the file. Edit them directly if reusing this repo for another tenant.

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
