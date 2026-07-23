import { getDisclosures } from '@/lib/disclosures';
import DisclosureCatalog from '@/components/DisclosureCatalog';

// Home = the disclosure catalog. The single internal entry point where every
// disclosure is visible regardless of type, owner, or where it is delivered.
export default function Home() {
  const disclosures = getDisclosures();

  return (
    <>
      <header className="site-head">
        <div className="site-head-inner">
          <a className="site-logo" href="/" aria-label="Citizens">Citizens</a>
          <span className="site-app-name">Disclosure Management</span>
        </div>
      </header>

      <main className="page">
        <section className="intro">
          <p className="eyebrow">Enterprise Disclosure Catalog</p>
          <h1>One library for every disclosure, everywhere it is used</h1>
          <p className="intro-text">
            A single entry point to create, review, and govern every disclosure across
            business lines. Each disclosure is a managed content fragment with a named
            owner, a version history, and a record of where it may be delivered.
          </p>
        </section>

        <DisclosureCatalog disclosures={disclosures} />
      </main>

      <footer className="site-foot">
        <div className="site-foot-inner">
          <span className="fdic" aria-label="FDIC" />
          <p>Member FDIC. Banking products are offered through Citizens Bank, N.A.</p>
        </div>
      </footer>
    </>
  );
}
