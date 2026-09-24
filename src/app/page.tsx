import { getAemConfig } from '@/lib/aem-config';
import { getArticles, getOffers, type Article, type Offer } from '@/lib/aem-client';
import { getCards, getDisclosureCFs, type Card, type DisclosureCF } from '@/lib/cf-delivery';
import { getEdsCards, getEdsInsights } from '@/lib/eds-content';
import Masthead from '@/components/Masthead';
import OfferHero from '@/components/OfferHero';
import Dashboard from '@/components/Dashboard';
import CardsSection from '@/components/CardsSection';
import InsightsGrid from '@/components/InsightsGrid';
import Disclosures from '@/components/Disclosures';
import SiteFooter from '@/components/SiteFooter';
import LiveRefresh from '@/components/LiveRefresh';

// Citizens online-banking dashboard. Offers and disclosures stay on AEM;
// cards and articles each request their own EDS path when opted in.
// The account figures are the app shell.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const CARD_PREFIX = '/forms/citizens/cards/';
const INSIGHT_PREFIX = '/forms/citizens/insights/';

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
  const [cards, articles, offers, disclosures] = await Promise.all([
    safe<readonly Card[]>(
      'getCards',
      () => config.edsContentEnabled ? getEdsCards(config, CARD_PREFIX) : getCards(config),
      [],
    ),
    safe<readonly Article[]>(
      'getArticles',
      () => config.edsContentEnabled ? getEdsInsights(config, INSIGHT_PREFIX) : getArticles(config),
      [],
    ),
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
