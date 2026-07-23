import type { CardCF } from '@/lib/cf-delivery';

// Credit-card Content Fragments (citizens/en/cards) rendered as a product rail.
export default function CardsSection({ cards }: { cards: readonly CardCF[] }) {
  if (!cards.length) return null;
  return (
    <section className="cards-section">
      <div className="cards-inner">
        <h3 className="dash-h">Credit cards for you</h3>
        <div className="card-grid">
          {cards.map((c) => (
            <article key={c.slug} className="ccard">
              {c.image ? (
                <div className="ccard-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt={c.name} loading="lazy" />
                </div>
              ) : null}
              <div className="ccard-body">
                <h4 className="ccard-name">{c.name}</h4>
                <p className="ccard-sum">{c.summary}</p>
                <a className="ccard-cta" href="#apply">Learn more</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
