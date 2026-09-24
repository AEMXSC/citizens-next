import type { Card } from '@/lib/cf-delivery';
import { aueComponent, aueProp, whenEditable } from '@/lib/ue';

// Credit-card product rail, backed by AEM or EDS.
export default function CardsSection({ cards, editable = true }: { cards: readonly Card[]; editable?: boolean }) {
  if (!cards.length && editable) return null;
  return (
    <section className="cards-section">
      <div className="cards-inner">
        <h3 className="dash-h">Credit cards for you</h3>
        {!editable ? <p className="demo-note">Demo content. Fictional examples only.</p> : null}
        {!cards.length ? (
          <p>No demo cards returned. Publish the card documents and EDS structured-content index.</p>
        ) : (
          <div className="card-grid">
            {cards.map((c) => (
              <article
                key={c.slug}
                className="ccard"
                {...whenEditable(editable, aueComponent(c.path, { label: `Card: ${c.name}` }))}
              >
                {c.image ? (
                  <div
                    className="ccard-media"
                    {...whenEditable(editable, aueProp('creditCardImage', 'media', { label: 'card image' }))}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.image} alt={c.imageAlt ?? c.name} loading="lazy" />
                  </div>
                ) : null}
                <div className="ccard-body">
                  <h4 className="ccard-name" {...whenEditable(editable, aueProp('creditCardName', 'text', { label: 'card name' }))}>{c.name}</h4>
                  <p className="ccard-sum" {...whenEditable(editable, aueProp('shortSummary', 'text', { label: 'summary' }))}>{c.summary}</p>
                  {editable ? <a className="ccard-cta" href="#apply">Learn more</a> : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
