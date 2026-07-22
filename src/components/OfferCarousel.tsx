'use client';

import { useCallback, useEffect, useState } from 'react';
import CFImage from './CFImage';
import { imageUrl, type Offer } from '@/lib/aem-client';
import { aueComponent, aueProp, whenEditable } from '@/lib/ue';

// Client component: manual prev/next plus an editor-aware auto-refresh. It is
// seeded with server-rendered offers (SSR), and re-fetches through the /api
// proxy on an interval EXCEPT inside Universal Editor, where polling would
// clobber an author's in-progress edit (the NYL "inEditor" guard).

export interface OfferCarouselProps {
  initialOffers: readonly Offer[];
  refreshPath: string;
  editable: boolean;
}

function inUniversalEditor(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin framing throws on access; that means we are framed (editor).
    return true;
  }
}

export default function OfferCarousel({
  initialOffers,
  refreshPath,
  editable,
}: OfferCarouselProps) {
  const [offers, setOffers] = useState<readonly Offer[]>(initialOffers);
  const [index, setIndex] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${refreshPath}?ts=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      const items: unknown = json?.data?.offerList?.items;
      if (Array.isArray(items) && items.length) {
        setOffers(items as Offer[]);
      }
    } catch {
      // Keep the last good render on a transient failure.
    }
  }, [refreshPath]);

  useEffect(() => {
    if (inUniversalEditor()) return undefined;
    const id = window.setInterval(refresh, 20000);
    return () => window.clearInterval(id);
  }, [refresh]);

  if (!offers.length) return null;

  const offer = offers[index % offers.length];
  const path = offer._path ?? '';
  const canEdit = editable && Boolean(path);
  const src = imageUrl(offer.image);

  return (
    <section className="offer" {...whenEditable(canEdit, aueComponent(path, { label: 'Offer', filter: 'cf' }))}>
      {src ? (
        <div className="offer-media" {...whenEditable(canEdit, aueProp('image', 'media'))}>
          <CFImage src={src} alt={offer.headline ?? ''} />
        </div>
      ) : null}
      <div className="offer-body">
        {offer.eyebrow ? (
          <p className="offer-eyebrow" {...whenEditable(canEdit, aueProp('eyebrow', 'text'))}>
            {offer.eyebrow}
          </p>
        ) : null}
        <h2 className="offer-headline" {...whenEditable(canEdit, aueProp('headline', 'text'))}>
          {offer.headline}
        </h2>
        {offer.description?.plaintext ? (
          <p className="offer-text" {...whenEditable(canEdit, aueProp('description', 'richtext'))}>
            {offer.description.plaintext}
          </p>
        ) : null}
        {offer.ctaText ? (
          <a className="offer-cta" href={offer.ctaLink ?? '#'} {...whenEditable(canEdit, aueProp('ctaText', 'text'))}>
            {offer.ctaText}
          </a>
        ) : null}
      </div>
      {offers.length > 1 ? (
        <div className="offer-nav">
          <button
            type="button"
            aria-label="Previous offer"
            onClick={() => setIndex((i) => (i - 1 + offers.length) % offers.length)}
          >
            &#8249;
          </button>
          <button
            type="button"
            aria-label="Next offer"
            onClick={() => setIndex((i) => (i + 1) % offers.length)}
          >
            &#8250;
          </button>
        </div>
      ) : null}
    </section>
  );
}
