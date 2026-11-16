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
  ['Web + headless', 'AEM Sites, EDS/DA, and every headless channel — one source', 'EDS/DA pages (via a block) and headless JSON'],
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

      <section className="cmp-flow-wrap">
        <h2 className="cmp-h2">Setup &amp; authoring workflow</h2>
        <div className="cmp-flow-grid">
          <div className="cmp-flow-col">
            <span className="cmp-persona cmp-persona-mkt">AEM Content Fragment</span>
            <ol className="cmp-flow">
              <li>Build the content model in the <strong>visual, drag-and-drop Model Editor</strong>.</li>
              <li>Author a fragment by <strong>picking that model</strong> &mdash; anywhere, no per-folder setup.</li>
              <li>Deliver via GraphQL persisted queries; edit in Universal Editor.</li>
            </ol>
            <p className="cmp-flow-take">Turnkey authoring &mdash; <em>assumes an AEM Cloud Service instance already exists.</em></p>
          </div>
          <div className="cmp-flow-col">
            <span className="cmp-persona cmp-persona-dev">DA Structured Content</span>
            <ol className="cmp-flow">
              <li>Hand-write the <strong>schema as JSON</strong> in the Schema Editor.</li>
              <li><strong>Configure the folder</strong> (<code>editor.path</code>) so its docs open in the form editor.</li>
              <li>Author in the generated form; deliver as JSON from the da-sc worker.</li>
            </ol>
            <p className="cmp-flow-take">More upfront dev &mdash; <em>but runs on EDS with no AEM instance needed.</em></p>
          </div>
        </div>
        <p className="cmp-flow-note">
          <strong>It&rsquo;s all AEM.</strong> Content Fragments and DA Structured Content are both
          Adobe AEM / Edge Delivery &mdash; this is not an AEM-vs-alternative decision, it&rsquo;s a
          choice of <strong>content model within AEM</strong>: heavier CF + GraphQL (turnkey,
          marketer-authored, governed) vs. lighter EDS / DA Structured Content (dev-configured schema
          + JSON). Either way, the customer is on AEM.
        </p>
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
            <h3>Best for Citizens PRD/Requirments</h3>
            <p>
              <strong>One governed spine: Content Fragments in Universal Editor, on the DAM Citizens already
              owns</strong> — one GraphQL/JSON contract to any frontend, mobile, and email via Journey Optimizer.
              Frontend framework isn&rsquo;t the axis (AEM is delivery-agnostic); what matters is who authors it and
              which ecosystem it belongs to — DA SC returns a flat web-page JSON blob, not an AJO/GenStudio source.
              A regulated bank shouldn&rsquo;t run two authoring homes, two governance models, and two audit trails
              for one brand&rsquo;s content.
            </p>
          </div>
        </div>
      </section>

      <p className="cmp-note">
        Publish source: AEM publish <code>{config.publish.replace('https://', '')}</code> ·
        {scAll[0]?.source === 'content-ai-graphql'
          ? <>Content AI GraphQL <code>{config.contentAiGqlUrl?.replace('https://', '')}</code></>
          : <>DA worker <code>da-sc.adobeaem.workers.dev/live/aemxsc/citizens/sc/*</code></>}
      </p>
    </main>
  );
}
