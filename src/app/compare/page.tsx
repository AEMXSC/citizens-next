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
          The identical <strong>Offer</strong> model, authored and delivered two ways. Same card,
          same fields, different authoring experience and governance.
        </p>
      </header>

      <div className="cmp-grid">
        <section className="cmp-col">
          <div className="cmp-col-head">
            <h2>AEM Content Fragment</h2>
            <p>GraphQL persisted query · authored in Universal Editor · versioning &amp; workflow</p>
          </div>
          {aem.length ? aem.map((o) => <OfferCompareCard key={o.headline} o={o} />) : (
            <p className="cmp-empty">No AEM offers returned.</p>
          )}
        </section>

        <section className="cmp-col">
          <div className="cmp-col-head">
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

      <p className="cmp-note">
        Publish source: AEM publish <code>{config.publish.replace('https://', '')}</code> ·
        DA worker <code>da-sc.adobeaem.workers.dev/live/aemxsc/citizens/sc/*</code>
      </p>
    </main>
  );
}
