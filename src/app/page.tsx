import { getAemConfig } from '@/lib/aem-config';
import { getArticles, getOffers, type Article, type Offer } from '@/lib/aem-client';
import Masthead from '@/components/Masthead';
import OfferHero from '@/components/OfferHero';
import Dashboard from '@/components/Dashboard';
import InsightsGrid from '@/components/InsightsGrid';
import SiteFooter from '@/components/SiteFooter';

// Citizens online-banking dashboard, mirroring the NYL headless app: masthead,
// a rotating offer hero, the member dashboard, and Insights & guidance. Offers
// and articles are live AEM Content Fragments read over GraphQL server-side;
// the account data is the app shell.
export const dynamic = 'force-dynamic';

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
  const [articles, offers] = await Promise.all([safeArticles(), safeOffers()]);

  return (
    <>
      <Masthead />
      <OfferHero offers={offers} />
      <Dashboard />
      <main className="wrap">
        <h2 className="wrap-title">Insights &amp; guidance</h2>
        <InsightsGrid articles={articles} />
      </main>
      <SiteFooter />
    </>
  );
}
