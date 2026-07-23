'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Disclosure } from '@/lib/disclosures';

// A disclosure Content Fragment surfaced inline in the app. Collapsed by
// default; expands to show the rendered CF body and a link to the full,
// governed disclosure record (the same CF the catalog and EDS site consume).
export default function DisclosureNote({ disclosure }: { disclosure: Disclosure }) {
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
        Disclosures
        <span className={`disc-chevron ${open ? 'disc-chevron-open' : ''}`} aria-hidden="true">▾</span>
      </button>
      {open ? (
        <div className="disc-body">
          <p className="disc-note-title">{disclosure.title}</p>
          <div dangerouslySetInnerHTML={{ __html: disclosure.bodyHtml }} />
          <Link href={`/disclosure/${disclosure.slug}`} className="disc-full-link">
            See full disclosure
          </Link>
        </div>
      ) : null}
    </div>
  );
}
