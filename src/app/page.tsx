import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';
import AccountCard from '@/components/AccountCard';
import QuickActions from '@/components/QuickActions';
import CreditScore from '@/components/CreditScore';
import OfferCard from '@/components/OfferCard';
import ArticleRail from '@/components/ArticleRail';
import DisclosureNote from '@/components/DisclosureNote';
import {
  PERSONAL_ACCOUNTS,
  CREDIT_ACCOUNTS,
  personalTotal,
  money,
} from '@/lib/banking';
import { getOffers, accountDisclosure } from '@/lib/content';

// The Citizens mobile-banking home screen. App shell (accounts, quick actions,
// credit score) is core-banking data; the content surfaces (offers, articles,
// disclosures) are Content Fragments, editable in Universal Editor and shared
// with the EDS marketing site.
export default function Home() {
  const fdic = accountDisclosure();

  return (
    <div className="app">
      <AppHeader />

      <main className="app-body">
        <section className="app-section">
          <div className="section-head">
            <h2>Personal banking</h2>
            <span className="section-total">Total: {money(personalTotal())}</span>
          </div>
          {PERSONAL_ACCOUNTS.map((a) => <AccountCard key={a.id} account={a} />)}
          {fdic ? <DisclosureNote disclosure={fdic} /> : null}
        </section>

        <QuickActions />

        <section className="app-section">
          <div className="section-head">
            <h2>Credit cards</h2>
          </div>
          {CREDIT_ACCOUNTS.map((a) => <AccountCard key={a.id} account={a} />)}
        </section>

        <section className="app-section">
          <div className="section-head">
            <h2>For you</h2>
          </div>
          {getOffers().map((o) => <OfferCard key={o.id} offer={o} />)}
        </section>

        <section className="app-section">
          <div className="section-head">
            <h2>Financial wellness</h2>
          </div>
          <CreditScore />
        </section>

        <section className="app-section">
          <div className="section-head">
            <h2>Learn</h2>
          </div>
          <ArticleRail />
        </section>

        <footer className="app-foot">
          <span className="fdic" aria-label="FDIC" />
          <p>Member FDIC. Banking products are offered through Citizens Bank, N.A.</p>
        </footer>
      </main>

      <BottomNav />
    </div>
  );
}
