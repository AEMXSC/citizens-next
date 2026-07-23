'use client';

import { useState } from 'react';
import Link from 'next/link';

// A disclosure Content Fragment surfaced inline in the app. Collapsed by
// default; expands to show the rendered CF body. If `detailSlug` is provided
// and maps to a local disclosure detail route, a "See full disclosure" link is
// shown; CF-only disclosures omit it.
export default function DisclosureNote({
  title,
  bodyHtml,
  detailSlug,
}: {
  title: string;
  bodyHtml: string;
  detailSlug?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="disc-note">
      <button
        type="button"
        className="disc-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="disc-info" aria-hidden="true">i</span>
        {title || 'Disclosures'}
        <span className={`disc-chevron ${open ? 'disc-chevron-open' : ''}`} aria-hidden="true">▾</span>
      </button>
      {open ? (
        <div className="disc-body">
          <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          {detailSlug ? (
            <Link href={`/disclosure/${detailSlug}`} className="disc-full-link">
              See full disclosure
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
