// Disclosure model. This is the shape of the AEM "Disclosure" Content Fragment
// the catalog consumes. Data is sourced locally here for the demo; swapping to
// AEM GraphQL later means replacing getDisclosures() with a persisted-query
// call (see aem-client.ts) — the UI is model-driven and does not change.

export type DisclosureType =
  | 'Standard'
  | 'Formatted'
  | 'Dynamic'
  | 'In-ad'
  | 'PDF'
  | 'Mixed';

export type DisclosureStatus = 'Approved' | 'In Review' | 'Draft';

export interface Disclosure {
  slug: string;
  title: string;
  type: DisclosureType;
  description: string;
  /** Enterprise-wide owner (person or team). */
  owner: string;
  businessLine: string;
  /** Where this disclosure lives / is distributed (integration layer). */
  locations: string[];
  /** Governance. */
  status: DisclosureStatus;
  version: string;
  approver?: string;
  effectiveDate: string;
  expiryDate?: string;
  /** Dynamic disclosures: value + source, resolved from the rate/date API. */
  rate?: { label: string; value: string; asOf: string };
  /** Where this disclosure may be used. */
  usage: string[];
  /** Rendered example (HTML). */
  bodyHtml: string;
  pdfUrl?: string;
  updatedAt: string;
}

export const DISCLOSURE_TYPES: DisclosureType[] = [
  'Standard', 'Formatted', 'Dynamic', 'In-ad', 'PDF', 'Mixed',
];

const BONUS_TABLE = `
<table class="disc-table"><thead><tr>
<th>Activate offer between:</th>
<th>Monthly deposits totaling $350 or more into existing One Deposit Savings from Citizens&reg; account for three months in a row:</th>
<th>$1,050 balance required in your existing One Deposit Savings from Citizens&reg; account as of:</th>
<th>Bonus will be paid into your One Deposit Savings from Citizens&reg; account by end of day:</th>
</tr></thead><tbody><tr>
<td>April 1-14, 2026</td><td>April, May, June</td><td>June 30, 2026</td><td>July 31, 2026</td>
</tr></tbody></table>`;

export const DISCLOSURES: Disclosure[] = [
  {
    slug: 'deposit-products-fdic',
    title: 'Deposit Products — FDIC Membership',
    type: 'Standard',
    description: 'Simple text-based disclosure with limited formatting.',
    owner: 'Deposits Compliance',
    businessLine: 'Consumer Deposits',
    locations: ['CMS', 'Excel Documents', 'Previously approved collateral', 'Provided by third-parties'],
    status: 'Approved',
    version: '3.0',
    approver: 'Legal Review Board',
    effectiveDate: '2026-01-01',
    usage: ['Web', 'Email', 'Print', 'Partner sites'],
    bodyHtml: '<p>Banking products are offered through Citizens Bank, N.A. For Deposit products, Member FDIC.</p>',
    updatedAt: '2026-05-02',
  },
  {
    slug: 'one-deposit-savings-bonus-table',
    title: 'One Deposit Savings — Bonus Terms (table)',
    type: 'Formatted',
    description: 'Leverages more formatting than plain text; includes responsive elements like images and tables.',
    owner: 'Savings Marketing',
    businessLine: 'Consumer Deposits',
    locations: ['CMS', 'Excel Documents'],
    status: 'Approved',
    version: '2.1',
    approver: 'Legal Review Board',
    effectiveDate: '2026-04-01',
    expiryDate: '2026-07-31',
    usage: ['Web', 'Email'],
    bodyHtml: BONUS_TABLE,
    updatedAt: '2026-06-10',
  },
  {
    slug: '3-month-cd-apy',
    title: '3-Month CD — APY Disclosure',
    type: 'Dynamic',
    description: 'Contains dynamic elements like start/end dates and rates, resolved from the rate & date API.',
    owner: 'Deposits Pricing',
    businessLine: 'Consumer Deposits',
    locations: ['CMS', 'Excel Documents', 'Previously approved collateral'],
    status: 'Approved',
    version: '5.4',
    approver: 'Pricing Governance',
    effectiveDate: '2026-06-19',
    rate: { label: 'APY', value: '4.25%', asOf: '2026-06-19' },
    usage: ['Web', 'Email', 'Rate tables'],
    bodyHtml: '<p><strong>3-month CD:</strong> APY is accurate as of <span class="disc-dyn">06/19/2026</span>. Offer limited to balance of up to <span class="disc-dyn">$3,000,000.00</span> per household address. APY assumes interest remains on deposit until maturity date. Penalty for early withdrawal. This CD will renew automatically. Rates available only on personal accounts. Citizens Private Bank&reg; clients are excluded from this promotion.</p>',
    updatedAt: '2026-06-19',
  },
  {
    slug: 'in-ad-short-disclosure',
    title: 'In-Ad Short Disclosure',
    type: 'In-ad',
    description: 'Shorter disclosure designed to sit within an ad rather than on the landing page. Operates as a child of the full disclosure.',
    owner: 'Paid Media',
    businessLine: 'Marketing',
    locations: ['CMS', 'Excel Documents', 'Hard coded into ads'],
    status: 'In Review',
    version: '1.2',
    effectiveDate: '2026-05-15',
    usage: ['Display ads', 'Social'],
    bodyHtml: '<p>Can be dynamic or simple. Member FDIC. See full terms for details.</p>',
    updatedAt: '2026-06-01',
  },
  {
    slug: 'summit-pass-terms-pdf',
    title: 'Summit Pass — Terms & Conditions',
    type: 'PDF',
    description: 'Long-form disclosure where requirements are given in print terms or are difficult to manage within the CMS.',
    owner: 'Cards Legal',
    businessLine: 'Credit Cards',
    locations: ['DAM'],
    status: 'Approved',
    version: '1.0',
    approver: 'Legal Review Board',
    effectiveDate: '2026-03-01',
    usage: ['Web (linked)', 'Email (linked)'],
    bodyHtml: '<p>Full print terms are maintained as a PDF in the DAM and linked from ads and landing pages.</p>',
    pdfUrl: '#cc-summit-pass-tc',
    updatedAt: '2026-03-01',
  },
  {
    slug: 'balance-builder-bonus-mixed',
    title: 'Balance Builder Bonus — Full Terms (mixed)',
    type: 'Mixed',
    description: 'Combines disclosures with plain text and custom formatting.',
    owner: 'Savings Marketing',
    businessLine: 'Consumer Deposits',
    locations: ['CMS', 'OMS for automatically fulfilled offers', 'Excel Documents'],
    status: 'Approved',
    version: '4.0',
    approver: 'Legal Review Board',
    effectiveDate: '2026-04-01',
    expiryDate: '2026-07-31',
    usage: ['Email', 'Automated offer fulfilment'],
    bodyHtml: `<p><sup>1</sup> <strong>Bonus:</strong> To earn a <strong>$100</strong> bonus, 1) click the "Activate Offer" button between 4/1/26 and 4/14/26 and, 2) have at least one single or multiple deposits totaling $350 or more post into your existing One Deposit Savings from Citizens&reg; account every month for three consecutive months (April, May, June) and have a total balance of $1,050 or more as of 6/30/26. <strong>Eligibility:</strong> Your savings account must remain open and active through the payout date. Only one personal savings account is eligible for a bonus and will be paid a one-time bonus for this promotion. <strong>Payout:</strong> The bonus, labeled as "Balance Builder Bonus", will be deposited to the savings account by the payout date and reported to the IRS for income tax purposes.</p>${BONUS_TABLE}`,
    updatedAt: '2026-06-12',
  },
];

export function getDisclosures(): Disclosure[] {
  return DISCLOSURES;
}

export function getDisclosure(slug: string): Disclosure | undefined {
  return DISCLOSURES.find((d) => d.slug === slug);
}
