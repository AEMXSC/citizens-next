import { getAemConfig } from '@/lib/aem-config';
import {
  getArticles,
  getOffers,
  persistedPath,
  type Article,
  type Offer,
} from '@/lib/aem-client';
import { QUERIES } from '@/lib/queries';
import ArticleGrid from '@/components/ArticleGrid';
import OfferCarousel from '@/components/OfferCarousel';

export const dynamic = 'force-dynamic';

// Read both collections server-side for SSR/SEO. Each read is isolated so one
// empty or failing query never blanks the whole page.
async function safeArticles(): Promise<readonly Article[]> {
  try {
    return await getArticles(getAemConfig());
  } catch (err) {
    console.error('[page] getArticles failed:', err);
    return [];
  }
}

async function safeOffers(): Promise<readonly Offer[]> {
  try {
    return await getOffers(getAemConfig());
  } catch (err) {
    console.error('[page] getOffers failed:', err);
    return [];
  }
}

export default async function Home() {
  const config = getAemConfig();
  const [articles, offers] = await Promise.all([safeArticles(), safeOffers()]);

  // Relative proxy path the client carousel re-fetches through. Built from the
  // server-only prefix so the client never needs to know it.
  const offerRefreshPath = `/api${persistedPath(config.cfPrefix, QUERIES.offerList)}`;

  return (
    <main className="page">
      <header className="masthead">
        <span className="brand">{config.brandName}</span>
      </header>

      <OfferCarousel
        initialOffers={offers}
        refreshPath={offerRefreshPath}
        editable={config.ueEnabled}
      />

      <section className="section">
        <h2 className="section-title">Latest articles</h2>
        <ArticleGrid articles={articles} editable={config.ueEnabled} />
      </section>
    </main>
  );
}
