'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Disclosure, DisclosureType } from '@/lib/disclosures';
import { DISCLOSURE_TYPES } from '@/lib/disclosures';
import { TypeBadge, StatusBadge } from './badges';

const ALL = 'All';

function unique(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export default function DisclosureCatalog({ disclosures }: { disclosures: Disclosure[] }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<DisclosureType | typeof ALL>(ALL);
  const [owner, setOwner] = useState<string>(ALL);
  const [location, setLocation] = useState<string>(ALL);

  const owners = useMemo(() => unique(disclosures.map((d) => d.owner)), [disclosures]);
  const locations = useMemo(
    () => unique(disclosures.flatMap((d) => d.locations)),
    [disclosures],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return disclosures.filter((d) => {
      if (type !== ALL && d.type !== type) return false;
      if (owner !== ALL && d.owner !== owner) return false;
      if (location !== ALL && !d.locations.includes(location)) return false;
      if (!q) return true;
      const haystack = [d.title, d.description, d.owner, d.businessLine, d.type]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [disclosures, query, type, owner, location]);

  const stats = useMemo(() => ({
    total: disclosures.length,
    approved: disclosures.filter((d) => d.status === 'Approved').length,
    review: disclosures.filter((d) => d.status === 'In Review').length,
    dynamic: disclosures.filter((d) => Boolean(d.rate)).length,
  }), [disclosures]);

  return (
    <div className="catalog">
      <div className="stat-strip">
        <div className="stat">
          <span className="stat-num">{stats.total}</span>
          <span className="stat-label">Disclosures in library</span>
        </div>
        <div className="stat">
          <span className="stat-num">{stats.approved}</span>
          <span className="stat-label">Approved</span>
        </div>
        <div className="stat">
          <span className="stat-num">{stats.review}</span>
          <span className="stat-label">In review</span>
        </div>
        <div className="stat">
          <span className="stat-num">{stats.dynamic}</span>
          <span className="stat-label">Rate/date linked</span>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <span className="search-icon" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search disclosures by title, owner, or business line"
            aria-label="Search disclosures"
          />
        </div>
        <label className="select">
          <span>Owner</span>
          <select value={owner} onChange={(e) => setOwner(e.target.value)}>
            <option value={ALL}>All owners</option>
            {owners.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <label className="select">
          <span>Location</span>
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value={ALL}>All locations</option>
            {locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
      </div>

      <div className="chips" role="tablist" aria-label="Filter by disclosure type">
        <button
          type="button"
          className={`chip ${type === ALL ? 'chip-active' : ''}`}
          onClick={() => setType(ALL)}
        >
          All types
        </button>
        {DISCLOSURE_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            className={`chip ${type === t ? 'chip-active' : ''}`}
            onClick={() => setType(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="result-count">
        {filtered.length} of {disclosures.length} disclosures
      </div>

      <div className="table-wrap">
        <table className="disc-catalog">
          <thead>
            <tr>
              <th>Disclosure</th>
              <th>Type</th>
              <th>Owner</th>
              <th>Business line</th>
              <th>Status</th>
              <th>Ver.</th>
              <th>Effective</th>
              <th>Locations</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.slug}>
                <td className="cell-title">
                  <Link href={`/disclosure/${d.slug}`}>{d.title}</Link>
                  <span className="cell-desc">{d.description}</span>
                </td>
                <td><TypeBadge type={d.type} /></td>
                <td>{d.owner}</td>
                <td>{d.businessLine}</td>
                <td><StatusBadge status={d.status} /></td>
                <td>{d.version}</td>
                <td className="cell-date">{d.effectiveDate}</td>
                <td>
                  <span className="loc-count">{d.locations.length}</span>
                  <span className="loc-list">{d.locations.join(', ')}</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-row">
                  No disclosures match these filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
