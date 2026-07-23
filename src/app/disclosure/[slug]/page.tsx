import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDisclosure, getDisclosures } from '@/lib/disclosures';
import { TypeBadge, StatusBadge } from '@/components/badges';

// Pre-render every disclosure detail page. Params is a Promise in Next 15.
export function generateStaticParams() {
  return getDisclosures().map((d) => ({ slug: d.slug }));
}

export default async function DisclosureDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const disclosure = getDisclosure(slug);
  if (!disclosure) notFound();

  const d = disclosure;

  return (
    <>
      <header className="site-head">
        <div className="site-head-inner">
          <a className="site-logo" href="/" aria-label="Citizens">Citizens</a>
          <span className="site-app-name">Disclosure Management</span>
        </div>
      </header>

      <main className="page">
        <nav className="crumbs">
          <Link href="/">Disclosure catalog</Link>
          <span aria-hidden="true">/</span>
          <span>{d.title}</span>
        </nav>

        <div className="detail">
          <article className="detail-main">
            <div className="detail-head">
              <TypeBadge type={d.type} />
              <StatusBadge status={d.status} />
            </div>
            <h1>{d.title}</h1>
            <p className="detail-desc">{d.description}</p>

            {d.rate ? (
              <div className="rate-card">
                <span className="rate-label">{d.rate.label}</span>
                <span className="rate-value">{d.rate.value}</span>
                <span className="rate-asof">Resolved from rate &amp; date API, as of {d.rate.asOf}</span>
              </div>
            ) : null}

            <section className="example">
              <h2>Rendered example</h2>
              {/* Disclosure body is authored richtext from the content fragment. */}
              <div
                className="example-body"
                dangerouslySetInnerHTML={{ __html: d.bodyHtml }}
              />
              {d.pdfUrl ? (
                <a className="pdf-link" href={d.pdfUrl}>Open full PDF terms (DAM)</a>
              ) : null}
            </section>

            <section className="usage">
              <h2>Usage requirements — where it can be used</h2>
              <ul className="pill-list">
                {d.usage.map((u) => <li key={u} className="pill pill-usage">{u}</li>)}
              </ul>
            </section>

            <section className="usage">
              <h2>Delivery locations — integration layer</h2>
              <ul className="pill-list">
                {d.locations.map((l) => <li key={l} className="pill">{l}</li>)}
              </ul>
            </section>
          </article>

          <aside className="detail-side">
            <div className="gov-card">
              <h3>Ownership</h3>
              <dl>
                <dt>Enterprise owner</dt>
                <dd>{d.owner}</dd>
                <dt>Business line</dt>
                <dd>{d.businessLine}</dd>
              </dl>
            </div>

            <div className="gov-card">
              <h3>Governance</h3>
              <dl>
                <dt>Status</dt>
                <dd><StatusBadge status={d.status} /></dd>
                <dt>Version</dt>
                <dd>v{d.version}</dd>
                {d.approver ? (
                  <>
                    <dt>Approved by</dt>
                    <dd>{d.approver}</dd>
                  </>
                ) : null}
                <dt>Effective</dt>
                <dd>{d.effectiveDate}</dd>
                {d.expiryDate ? (
                  <>
                    <dt>Expires</dt>
                    <dd>{d.expiryDate}</dd>
                  </>
                ) : null}
                <dt>Last updated</dt>
                <dd>{d.updatedAt}</dd>
              </dl>
            </div>

            <div className="gov-card">
              <h3>Audit trail</h3>
              <ol className="audit">
                <li>
                  <span className="audit-when">{d.updatedAt}</span>
                  <span className="audit-what">Version {d.version} published</span>
                </li>
                <li>
                  <span className="audit-when">{d.effectiveDate}</span>
                  <span className="audit-what">
                    {d.approver ? `Approved by ${d.approver}` : 'Submitted for review'}
                  </span>
                </li>
                <li>
                  <span className="audit-when">{d.effectiveDate}</span>
                  <span className="audit-what">Effective date set</span>
                </li>
              </ol>
            </div>
          </aside>
        </div>
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
