import { getAemConfig } from '@/lib/aem-config';
import { getArticles, getOffers, type Article, type Offer } from '@/lib/aem-client';
import { getCards, getDisclosureCFs, type CardCF, type DisclosureCF } from '@/lib/cf-delivery';
import Masthead from '@/components/Masthead';
import OfferHero from '@/components/OfferHero';
import Dashboard from '@/components/Dashboard';
import CardsSection from '@/components/CardsSection';
import InsightsGrid from '@/components/InsightsGrid';
import SiteFooter from '@/components/SiteFooter';

// Citizens online-banking dashboard, mirroring the NYL headless app. Every
// content surface is a live Citizens Content Fragment read server-side:
//   offers      -> securbank/OfferByPath  (citizens/en/offers)
//   articles    -> securbank/ArticleList  (citizens/en/articles)
//   cards       -> CF Delivery API        (citizens/en/cards)
//   disclosures -> CF Delivery API        (citizens/en/disclosures)
// The account figures are the app shell.
export const dynamic = 'force-dynamic';

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
  const [articles, offers, cards, disclosures] = await Promise.all([
    safe<readonly Article[]>('getArticles', () => getArticles(config), []),
    safe<readonly Offer[]>('getOffers', () => getOffers(config), []),
    safe<readonly CardCF[]>('getCards', () => getCards(config), []),
    safe<readonly DisclosureCF[]>('getDisclosureCFs', () => getDisclosureCFs(config), []),
  ]);

  return (
    <>
      <Masthead />
      <OfferHero offers={offers} />
      <Dashboard disclosures={disclosures} />
      <CardsSection cards={cards} />
      <main className="wrap">
        <h2 className="wrap-title">Insights &amp; guidance</h2>
        <InsightsGrid articles={articles} />
      </main>
      <SiteFooter />
    </>
  );
}
