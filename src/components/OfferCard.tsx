import { offerDisclosure, type Offer } from '@/lib/content';
import DisclosureNote from './DisclosureNote';

// Offer surfaced from a Content Fragment, styled like the app's "New offer"
// cards. Any attached disclosure CF renders inline beneath the CTA.
export default function OfferCard({ offer }: { offer: Offer }) {
  const disclosure = offerDisclosure(offer.disclosureSlug);
  return (
    <article className="offer-card">
      <div
        className="offer-media"
        style={{ backgroundImage: `url(${offer.image})` }}
        role="img"
        aria-label={offer.title}
      />
      <div className="offer-body">
        <span className="offer-tag">New offer</span>
        <h3 className="offer-title">{offer.title}</h3>
        <p className="offer-text">{offer.body}</p>
        <a href={offer.cta.href} className="btn-primary">{offer.cta.label}</a>
        {disclosure ? <DisclosureNote disclosure={disclosure} /> : null}
      </div>
    </article>
  );
}
