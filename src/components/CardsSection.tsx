import { aueResource, type CardCF } from '@/lib/cf-delivery';

// Credit-card Content Fragments (citizens/en/cards) rendered as a product rail.
// UE instrumentation maps each card and its fields to the source CF so they are
// editable in Universal Editor.
export default function CardsSection({ cards }: { cards: readonly CardCF[] }) {
  if (!cards.length) return null;
  return (
    <section className="cards-section">
      <div className="cards-inner">
        <h3 className="dash-h">Credit cards for you</h3>
        <div className="card-grid">
          {cards.map((c) => (
            <article
              key={c.slug}
              className="ccard"
              data-aue-resource={aueResource(c.path)}
              data-aue-type="component"
              data-aue-label={`Card: ${c.name}`}
            >
              {c.image ? (
                <div
                  className="ccard-media"
                  data-aue-prop="creditCardImage"
                  data-aue-type="media"
                  data-aue-label="card image"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt={c.name} loading="lazy" />
                </div>
              ) : null}
              <div className="ccard-body">
                <h4 className="ccard-name" data-aue-prop="creditCardName" data-aue-type="text" data-aue-label="card name">{c.name}</h4>
                <p className="ccard-sum" data-aue-prop="shortSummary" data-aue-type="text" data-aue-label="summary">{c.summary}</p>
                <a className="ccard-cta" href="#apply">Learn more</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
