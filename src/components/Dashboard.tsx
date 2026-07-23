import { money } from '@/lib/banking';
import type { DisclosureCF } from '@/lib/cf-delivery';
import DisclosureNote from './DisclosureNote';

const QUICK = ['Pay & Transfer', 'Deposit', 'Statements', 'Manage cards'];

// The "Good Morning" member dashboard: greeting band, e-docs enroll notice,
// "Your Products" cards, quick tiles, and the disclosure Content Fragments
// (citizens/en/disclosures) surfaced inline.
export default function Dashboard({ disclosures }: { disclosures: readonly DisclosureCF[] }) {
  return (
    <section className="dashboard">
      <div className="greeting">
        <div className="greeting-inner">
          <div>
            <p className="gm">Good Morning</p>
            <h2 className="gname">Jane S. Smith</h2>
          </div>
          <button type="button" className="help" aria-label="Help">?</button>
        </div>
      </div>

      <div className="dash-inner">
        <div className="enroll">
          <p>Sign up to receive your documents electronically.</p>
          <a href="#enroll">Enroll Now &rsaquo;</a>
        </div>

        <h3 className="dash-h">Your Products</h3>
        <div className="dash-grid">
          <article className="wcard whole">
            <div className="wc-top">
              <div className="wc-row">
                <span className="wc-name">CREDIT CARD</span>
                <button type="button" className="paybtn">Pay Now</button>
              </div>
              <p className="wc-meta">Citizens Cash Back Plus&reg; Mastercard&reg; &nbsp;•••&nbsp;2535 &nbsp;|&nbsp; Payment due Dec 13</p>
              <div className="wc-amt"><span>Current balance</span><strong>{money(1240.72)}</strong></div>
            </div>
          </article>

          <article className="wcard annuity">
            <div className="wc-top">
              <div className="wc-row"><span className="wc-name">ONE DEPOSIT CHECKING</span></div>
              <p className="wc-meta">•••&nbsp;4592</p>
              <div className="wc-amt"><span>Available balance</span><strong>{money(5270.58)}</strong></div>
            </div>
          </article>

          <article className="wcard detail">
            <p className="wc-dh">Account Details</p>
            <div className="wc-foot">
              <div className="pf-row"><span className="pf-k">Primary owner</span><span className="pf-v">Jane S. Smith</span></div>
              <div className="pf-row"><span className="pf-k">One Deposit Savings •••&nbsp;2535</span><span className="pf-v">{money(1240.72)}</span></div>
              <div className="pf-row"><span className="pf-k" style={{ fontSize: '13px' }}>Member since 2019</span><a className="pf-link" href="#details">View details &rsaquo;</a></div>
            </div>
          </article>
        </div>

        <div className="quick">
          {QUICK.map((q) => (
            <a key={q} className="qtile" href="#">
              <span className="qic" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="13" rx="2" /><path d="M2 10.5h20" /></svg>
              </span>
              {q}
            </a>
          ))}
        </div>

        {disclosures.length ? (
          <div className="disc-strip">
            {disclosures.map((d) => (
              <DisclosureNote key={d.slug} title={d.title} bodyHtml={d.bodyHtml} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
