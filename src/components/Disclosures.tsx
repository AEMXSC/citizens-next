import { aueResource, type DisclosureCF } from '@/lib/cf-delivery';
import DisclosureNote from './DisclosureNote';

// Disclosures band, placed just above the footer per financial-site
// convention. Each item is a Term & Condition Content Fragment
// (citizens/en/disclosures), collapsed by default.
export default function Disclosures({ disclosures }: { disclosures: readonly DisclosureCF[] }) {
  if (!disclosures.length) return null;
  return (
    <section className="disclosures-band">
      <div className="disclosures-inner">
        <h2 className="disclosures-title">Disclosures</h2>
        <div className="disclosures-list">
          {disclosures.map((d) => (
            <DisclosureNote
              key={d.slug}
              title={d.title}
              bodyHtml={d.bodyHtml}
              resource={aueResource(d.path)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
