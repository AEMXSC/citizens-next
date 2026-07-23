import { getAemConfig } from '@/lib/aem-config';
import { getOffers, imageUrl, type Offer } from '@/lib/aem-client';
import { getStructuredOffers, type StructuredOffer } from '@/lib/da-sc';
import OfferCompareCard, { type CompareCardData } from '@/components/OfferCompareCard';

// Side-by-side: the SAME Offer content model delivered from two Adobe-native
// stacks. Left = AEM Content Fragment over GraphQL. Right = DA Structured
// Content over the da-sc worker JSON. Both authored differently, both render the
// identical card — the point of the demo.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SC_SLUGS = ['citizens-checking', 'citizens-savings'];

// Pros/cons rows: [dimension, AEM CF, DA Structured Content]
const COMPARE_ROWS: [string, string, string][] = [
  ['Authoring persona', 'Marketer — CF Editor, Universal Editor, in-context', 'Developer — defines JSON schema; marketer fills a form'],
  ['Governance', 'Versioning, approval workflow, audit', 'None today (early version)'],
  ['Delivery', 'GraphQL persisted queries', 'JSON worker + query-index'],
  ['Web + headless', 'Marketing site AND every channel from one fragment', 'Headless / JSON only'],
  ['Localization', 'MSM + translation framework', 'No MSM equivalent'],
  ['AI / campaign ops', 'GenStudio, Journey Optimizer', 'Not integrated'],
  ['Maturity', 'Enterprise-proven', 'Early'],
  ['Stand-up cost & speed', 'Heavier — instance, ops, provisioning', 'Light, cheap, greenfield-fast'],
];

function slugOf(path?: string): string {
  return (path ?? '').split('/').pop() ?? '';
}

function fromAemOffer(o: Offer): CompareCardData {
  return {
    pretitle: o.pretitle ?? '',
    headline: o.headline ?? '',
    detail: o.detail?.plaintext ?? '',
    callToAction: o.callToAction ?? '',
    heroImage: imageUrl(o.heroImage),
  };
}

function fromScOffer(o: StructuredOffer): CompareCardData {
  return {
    pretitle: o.pretitle,
    headline: o.headline,
    detail: o.detail,
    callToAction: o.callToAction,
    ctaUrl: o.ctaUrl,
    heroImage: o.heroImage,
  };
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

export default async function ComparePage() {
  const config = getAemConfig();
  const [aemAll, scAll] = await Promise.all([
    safe<readonly Offer[]>(() => getOffers(config), []),
    safe<StructuredOffer[]>(() => getStructuredOffers(), []),
  ]);

  // Pair by slug so both columns show the same offers in the same order.
  const aem = SC_SLUGS
    .map((s) => aemAll.find((o) => slugOf(o._path) === s))
    .filter((o): o is Offer => Boolean(o))
    .map(fromAemOffer);
  const sc = scAll.map(fromScOffer);

  return (
    <main className="cmp">
      <header className="cmp-head-band">
        <p className="cmp-eyebrow">One content model, two Adobe-native stacks</p>
        <h1>Content Fragments vs. DA Structured Content</h1>
        <p className="cmp-sub">
          The identical <strong>Offer</strong> model rendering in this Next.js web app — authored
          and delivered two ways. Same fields, same card; different authoring experience and
          governance.
        </p>
      </header>

      <div className="cmp-grid">
        <section className="cmp-col">
          <div className="cmp-col-head">
            <span className="cmp-persona cmp-persona-mkt">Marketing persona</span>
            <h2>AEM Content Fragment</h2>
            <p>GraphQL persisted query · authored in Universal Editor · versioning &amp; workflow</p>
          </div>
          {aem.length ? aem.map((o) => <OfferCompareCard key={o.headline} o={o} />) : (
            <p className="cmp-empty">No AEM offers returned.</p>
          )}
        </section>

        <section className="cmp-col">
          <div className="cmp-col-head">
            <span className="cmp-persona cmp-persona-dev">Developer persona</span>
            <h2>DA Structured Content</h2>
            <p>Developer-defined JSON schema · authored in the DA form editor · JSON worker delivery</p>
          </div>
          {sc.length ? sc.map((o) => <OfferCompareCard key={o.headline} o={o} />) : (
            <p className="cmp-empty">
              Awaiting DA Structured Content. Add the <code>editor.path</code> config, author an
              Offer under <code>/sc</code>, and Preview it — this column fills in automatically.
            </p>
          )}
        </section>
      </div>

      <section className="cmp-table-wrap">
        <h2 className="cmp-h2">How they compare</h2>
        <table className="cmp-table">
          <thead>
            <tr>
              <th aria-hidden="true" />
              <th><span className="cmp-persona cmp-persona-mkt">Marketing</span> AEM Content Fragment</th>
              <th><span className="cmp-persona cmp-persona-dev">Developer</span> DA Structured Content</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map(([dim, cf, sc2]) => (
              <tr key={dim}>
                <th scope="row">{dim}</th>
                <td>{cf}</td>
                <td>{sc2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="cmp-pick">
        <h2 className="cmp-h2">When to pick which</h2>
        <div className="cmp-pick-grid">
          <div className="cmp-pick-card cmp-pick-aem">
            <h3>Choose AEM Content Fragments</h3>
            <p>Regulated, marketer-authored, localized, campaign-orchestrated content — the compliance spine (E4) and the marketer/legal personas (E5).</p>
          </div>
          <div className="cmp-pick-card cmp-pick-sc">
            <h3>Choose DA Structured Content</h3>
            <p>Developer-owned reference data, high-velocity simple content, and cost-sensitive greenfield MVPs where speed beats governance.</p>
          </div>
          <div className="cmp-pick-card cmp-pick-both">
            <h3>Best for this PRD</h3>
            <p>Split by content class — regulated on AEM CF, high-velocity marketing on DA SC — both feeding the same JSON delivery contract.</p>
          </div>
        </div>
      </section>

      <p className="cmp-note">
        Publish source: AEM publish <code>{config.publish.replace('https://', '')}</code> ·
        DA worker <code>da-sc.adobeaem.workers.dev/live/aemxsc/citizens/sc/*</code>
      </p>
    </main>
  );
}
