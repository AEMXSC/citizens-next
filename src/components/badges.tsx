import type { DisclosureType, DisclosureStatus } from '@/lib/disclosures';

const TYPE_CLASS: Record<DisclosureType, string> = {
  Standard: 'type-standard',
  Formatted: 'type-formatted',
  Dynamic: 'type-dynamic',
  'In-ad': 'type-inad',
  PDF: 'type-pdf',
  Mixed: 'type-mixed',
};

export function TypeBadge({ type }: { type: DisclosureType }) {
  return <span className={`badge ${TYPE_CLASS[type]}`}>{type}</span>;
}

const STATUS_CLASS: Record<DisclosureStatus, string> = {
  Approved: 'status-approved',
  'In Review': 'status-review',
  Draft: 'status-draft',
};

export function StatusBadge({ status }: { status: DisclosureStatus }) {
  return <span className={`status ${STATUS_CLASS[status]}`}>{status}</span>;
}
