'use client';

import { useState } from 'react';
import Link from 'next/link';

// A disclosure Content Fragment surfaced inline. Collapsed by default; expands
// to show the rendered CF body. When `resource` (a UE resource URN) is passed,
// the note and its fields are instrumented so they are editable in Universal
// Editor (termsReference = title, termDetails = body).
export default function DisclosureNote({
  title,
  bodyHtml,
  detailSlug,
  resource,
}: {
  title: string;
  bodyHtml: string;
  detailSlug?: string;
  resource?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="disc-note"
      {...(resource
        ? { 'data-aue-resource': resource, 'data-aue-type': 'component', 'data-aue-label': `Disclosure: ${title}` }
        : {})}
    >
      <button
        type="button"
        className="disc-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="disc-info" aria-hidden="true">i</span>
        <span data-aue-prop={resource ? 'termsReference' : undefined} data-aue-type={resource ? 'text' : undefined} data-aue-label={resource ? 'title' : undefined}>
          {title || 'Disclosures'}
        </span>
        <span className={`disc-chevron ${open ? 'disc-chevron-open' : ''}`} aria-hidden="true">▾</span>
      </button>
      {open ? (
        <div className="disc-body">
          <div
            data-aue-prop={resource ? 'termDetails' : undefined}
            data-aue-type={resource ? 'richtext' : undefined}
            data-aue-label={resource ? 'details' : undefined}
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
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
