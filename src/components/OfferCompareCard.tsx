export interface CompareCardData {
  pretitle: string;
  headline: string;
  detail: string;
  callToAction: string;
  ctaUrl?: string;
  heroImage: string;
}

// A single offer card, rendered identically regardless of source (AEM CF or DA
// Structured Content) to make the "same content model, two stacks" point.
export default function OfferCompareCard({ o }: { o: CompareCardData }) {
  return (
    <article className="cmp-card">
      {o.heroImage ? (
        <div className="cmp-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={o.heroImage} alt={o.headline} loading="lazy" />
        </div>
      ) : null}
      <div className="cmp-body">
        {o.pretitle ? <span className="cmp-pre">{o.pretitle}</span> : null}
        <h3 className="cmp-head">{o.headline}</h3>
        {o.detail ? <p className="cmp-det">{o.detail}</p> : null}
        {o.callToAction ? <a className="cmp-cta" href={o.ctaUrl || '#'}>{o.callToAction}</a> : null}
      </div>
    </article>
  );
}
