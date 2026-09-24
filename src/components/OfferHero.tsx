'use client';

import { imageUrl, type Offer } from '@/lib/aem-client';
import type { Banner } from '@/lib/eds-graphql';
import { useEffect, useState } from 'react';

type Props =
  | { readonly offers: readonly Offer[]; readonly banners?: never }
  | { readonly banners: readonly Banner[]; readonly offers?: never };

// Rotating hero. AEM offers retain Universal Editor bindings; EDS banners do not.
export default function OfferHero(props: Props) {
  const entries = props.banners ?? props.offers;
  const [i, setI] = useState(0);

  useEffect(() => {
    if (entries.length < 2) return undefined;
    const t = setInterval(() => setI((v) => (v + 1) % entries.length), 6000);
    return () => clearInterval(t);
  }, [entries.length]);

  if (!entries.length) return null;
  const idx = ((i % entries.length) + entries.length) % entries.length;
  const banner = props.banners?.[idx];
  const offer = props.offers?.[idx];
  const bg = banner?.heroImage ?? imageUrl(offer?.heroImage);
  const headline = banner?.headline ?? offer?.headline ?? '';

  return (
    <section className="offerhero">
      <div
        className="oh"
        data-aue-resource={offer ? `urn:aemconnection:${offer._path ?? ''}/jcr:content/data/master` : undefined}
        data-aue-type={offer ? 'component' : undefined}
        data-aue-label={offer ? `Offer: ${headline}` : undefined}
      >
        {bg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="oh-img"
            src={bg}
            alt={banner?.imageAlt ?? headline}
            data-aue-prop={offer ? 'heroImage' : undefined}
            data-aue-type={offer ? 'media' : undefined}
            data-aue-label={offer ? 'hero image' : undefined}
          />
        ) : null}
        <button
          type="button"
          className="oh-nav oh-prev"
          aria-label="Previous offer"
          onClick={() => setI(idx - 1)}
        >
          ‹
        </button>
        <p className="oh-pre" data-aue-prop={offer ? 'pretitle' : undefined} data-aue-type={offer ? 'text' : undefined}>
          {banner?.pretitle ?? offer?.pretitle}
        </p>
        <h2 className="oh-head" data-aue-prop={offer ? 'headline' : undefined} data-aue-type={offer ? 'text' : undefined}>
          {headline}
        </h2>
        <p className="oh-det" data-aue-prop={offer ? 'detail' : undefined} data-aue-type={offer ? 'richtext' : undefined}>
          {banner?.detail ?? offer?.detail?.plaintext}
        </p>
        {banner ? <p className="oh-demo">{banner.demoDisclaimer}</p> : null}
        <div className="oh-dots">
          {entries.map((_, n) => (
            <span key={props.banners?.[n].path ?? props.offers?.[n]._path ?? n} className={`oh-dot ${n === idx ? 'on' : ''}`} />
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
