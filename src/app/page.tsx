import { getAemConfig } from '@/lib/aem-config';
import { getArticles, getOffers, type Article, type Offer } from '@/lib/aem-client';
import { getCards, getDisclosureCFs, type Card, type DisclosureCF } from '@/lib/cf-delivery';
import { getEdsContent } from '@/lib/eds-content';
import Masthead from '@/components/Masthead';
import OfferHero from '@/components/OfferHero';
import Dashboard from '@/components/Dashboard';
import CardsSection from '@/components/CardsSection';
import InsightsGrid from '@/components/InsightsGrid';
import Disclosures from '@/components/Disclosures';
import SiteFooter from '@/components/SiteFooter';
import LiveRefresh from '@/components/LiveRefresh';

// Citizens online-banking dashboard. Offers and disclosures stay on AEM;
// cards and articles switch together to the EDS list when opted in.
// The account figures are the app shell.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function safe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[page] ${label} failed:`, err);
    return fallback;
  }
}

export default async function Home() {
  const config = getAemConfig();
  const content = config.edsContentEnabled
    ? safe('getEdsContent', () => getEdsContent(config), { cards: [], articles: [] })
    : Promise.all([
      safe<readonly Card[]>('getCards', () => getCards(config), []),
      safe<readonly Article[]>('getArticles', () => getArticles(config), []),
    ]).then(([cards, articles]) => ({ cards, articles }));
  const [{ articles, cards }, offers, disclosures] = await Promise.all([
    content,
    safe<readonly Offer[]>('getOffers', () => getOffers(config), []),
    safe<readonly DisclosureCF[]>('getDisclosureCFs', () => getDisclosureCFs(config), []),
  ]);

  return (
    <>
      <LiveRefresh />
      <Masthead />
      <OfferHero offers={offers} />
      <Dashboard />
      <CardsSection cards={cards} editable={!config.edsContentEnabled} />
      <main className="wrap">
        <h2 className="wrap-title">Insights &amp; guidance</h2>
        {config.edsContentEnabled ? <p className="demo-note">Demo content. Fictional examples only.</p> : null}
        <InsightsGrid articles={articles} editable={!config.edsContentEnabled} />
      </main>
      <Disclosures disclosures={disclosures} />
      <SiteFooter />
    </>
  );
}
