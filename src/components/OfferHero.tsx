'use client';

import { useEffect, useState } from 'react';
import { imageUrl, type Offer } from '@/lib/aem-client';

// Rotating offer hero, driven by AEM Offer Content Fragments (the same CFs the
// NYL app and the Citizens EDS "offer" block consume). Auto-advances; prev/next
// and dots for manual control. UE instrumentation kept for edit-in-place parity.
export default function OfferHero({ offers }: { offers: readonly Offer[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (offers.length < 2) return undefined;
    const t = setInterval(() => setI((v) => (v + 1) % offers.length), 6000);
    return () => clearInterval(t);
  }, [offers.length]);

  if (!offers.length) return null;
  const idx = ((i % offers.length) + offers.length) % offers.length;
  const offer = offers[idx];
  const bg = imageUrl(offer.heroImage);
  const resource = `urn:aemconnection:${offer._path ?? ''}/jcr:content/data/master`;

  return (
    <section className="offerhero">
      <div
        className="oh"
        data-aue-resource={resource}
        data-aue-type="component"
        data-aue-label={`Offer: ${offer.headline ?? ''}`}
        style={{
          backgroundImage:
            `linear-gradient(90deg, rgba(0,63,41,0.86), rgba(0,63,41,0.25) 78%), url(${bg})`,
        }}
      >
        <button
          type="button"
          className="oh-nav oh-prev"
          aria-label="Previous offer"
          onClick={() => setI(idx - 1)}
        >
          ‹
        </button>
        <p className="oh-pre" data-aue-prop="pretitle" data-aue-type="text">{offer.pretitle}</p>
        <h2 className="oh-head" data-aue-prop="headline" data-aue-type="text">{offer.headline}</h2>
        <p className="oh-det" data-aue-prop="detail" data-aue-type="richtext">
          {offer.detail?.plaintext}
        </p>
        <div className="oh-dots">
          {offers.map((o, n) => (
            <span key={o._path ?? n} className={`oh-dot ${n === idx ? 'on' : ''}`} />
          ))}
        </div>
        <button
          type="button"
          className="oh-nav oh-next"
          aria-label="Next offer"
          onClick={() => setI(idx + 1)}
        >
          ›
        </button>
      </div>
    </section>
  );
}
