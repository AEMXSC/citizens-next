import CardsSection from '@/components/CardsSection';
import Dashboard from '@/components/Dashboard';
import Disclosures from '@/components/Disclosures';
import InsightsGrid from '@/components/InsightsGrid';
import LiveRefresh from '@/components/LiveRefresh';
import Masthead from '@/components/Masthead';
import OfferHero from '@/components/OfferHero';
import SiteFooter from '@/components/SiteFooter';
import { getArticles, getOffers, type Article, type Offer } from '@/lib/aem-client';
import { getAemConfig } from '@/lib/aem-config';
import { getCards, getDisclosureCFs, type Card, type DisclosureCF } from '@/lib/cf-delivery';
import { getEdsCards, getEdsInsights } from '@/lib/eds-content';
import { getBanners, type Banner } from '@/lib/eds-graphql';

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
  const [cards, articles, offers, banners, disclosures] = await Promise.all([
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
    config.edsContentEnabled
      ? Promise.resolve([] as readonly Offer[])
      : safe<readonly Offer[]>('getOffers', () => getOffers(config), []),
    config.edsContentEnabled
      ? getBanners(config)
      : Promise.resolve([] as readonly Banner[]),
    safe<readonly DisclosureCF[]>('getDisclosureCFs', () => getDisclosureCFs(config), []),
  ]);

  return (
    <>
      <LiveRefresh />
      <Masthead />
      {config.edsContentEnabled
        ? <OfferHero banners={banners} />
        : <OfferHero offers={offers} />}
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
