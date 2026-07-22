# Playbook: stand up a headless UE app for a new customer

This is the repeatable runbook the starter exists to serve. It captures the
sequence and the gotchas learned building the New York Life cross-surface demo,
so the next one (Citizens, and beyond) is a configuration exercise, not a
rebuild. Target: a working, brand-faithful, UE-editable app in well under a day.

Two surfaces share one content source:

- **Website** (AEM EDS/DA): scraped, brand-faithful, authorable. Built with the
  `snowflake` skill from a scrape of the customer site.
- **App** (this starter): the headless surface, live-editable in Universal
  Editor, reskinned with the customer's extracted brand tokens.

The wow moment: edit one Content Fragment in Universal Editor, both update.

---

## Phase 0 — AEM (once per customer)

1. Record the customer's `author` and `publish` origins and program/env.
2. Confirm or create the Content Fragment **models** (e.g. Article, Offer).
3. Author a handful of sample Content Fragments.
4. Create and **publish** the persisted queries the app reads:
   - `ArticleList` (list) for the card grid.
   - `OfferList` (list) for the carousel. `OfferByPath` is the single-item fallback.
5. Note the persisted-query **namespace/prefix** (the segment after
   `/graphql/execute.json/`). This is `AEM_CF_PREFIX`.
6. If the queries are **not** published public, obtain the technical-account /
   service token for `AEM_TOKEN`. (This is the same class of credential still
   pending to make the NYL `.aem.page` public URL render.)

## Phase 1 — Design (brand-faithful)

1. `scrape-webpage` the customer homepage and 1-2 product pages.
2. `design-system-extractor` / `design-tokens` to pull real colors, fonts,
   logo, spacing.
3. Fill `src/styles/tokens.css` with those tokens. If the brand font is on
   Adobe Fonts, set `NEXT_PUBLIC_FONT_KIT` and update the `--font-*` family
   names to match. Do NOT hardcode `@font-face` blocks in multiple files (the
   NYL mistake); the kit plus `tokens.css` is the single source.
4. Do NOT use `stardust` for a brand-faithful demo; it redesigns the look.

## Phase 2 — Website surface

1. `snowflake` the scraped page(s) into the customer EDS repo, preserving the
   look and making content DA-authorable.
2. Wire the `content-fragment` / `offer` blocks to the shared persisted queries.

## Phase 3 — App surface (this starter)

1. `git clone` this starter into the customer app repo.
2. `cp .env.example .env.local` and fill the six values from Phase 0/1.
3. `npm install && npm run dev`.
4. Load `http://localhost:3000`. Confirm the offer carousel and article grid
   render from AEM. In the network tab, confirm ONE list request per collection
   (not one per item).

## Phase 4 — Universal Editor

1. Set `UE_ENABLED=true` (and `AEM_AUTHOR`) in `.env.local`, restart dev.
2. Register the app URL in Universal Editor pointed at the AEM author.
3. Confirm the `data-aue` overlays appear on the offer and article fields.
4. Edit a headline, save/publish, confirm it round-trips into AEM and the app
   re-renders. Confirm the same edit also updates the EDS website (cross-surface
   proof).

## Phase 5 — Deploy + final brand pass

1. Deploy (Vercel or Cloudflare Pages). Set the env vars in the host.
2. Final brand pass on `tokens.css`; set `NEXT_PUBLIC_BRAND_NAME`.
3. Public deploy stays `UE_ENABLED=false` so the DOM ships clean.

---

## Appendix — AEM-side gotchas carried forward from NYL

- **Do not hand-edit the compiled model roots.** On the EDS/website side, keep
  every block's model source in `ue/models/blocks/*.json`. `npm run build:json`
  regenerates `component-models.json` / `component-definition.json` /
  `component-filters.json` from those sources, and will silently drop any
  component (such as `offer` / `content-fragment`) whose model was hand-edited
  straight into the compiled root.
- **Reads come from publish; edits go through UE.** This app renders from
  `AEM_PUBLISH`. Universal Editor writes to the author over its own connection.
  To see an edit on the public surfaces, publish the fragment; both surfaces
  re-fetch and update.
- **Keep config in one place.** Every host, program/env, and query prefix lives
  in `.env.local` and is read only by `src/lib/aem-config.ts`. If you find a
  literal AEM host or prefix anywhere else, move it here.
