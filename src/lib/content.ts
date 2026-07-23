// The Content Fragment layer. Offers, articles, and disclosures are all modeled
// as CFs and consumed by the app (and shared with the EDS marketing site). Data
// is local for the demo; swapping getOffers/getArticles to an AEM persisted
// query later (see aem-client.ts) leaves the components unchanged. Disclosures
// are the same CFs defined in disclosures.ts, surfaced inline in the app.

import { getDisclosure, type Disclosure } from './disclosures';

const IMG = 'https://raw.githubusercontent.com/AEMXSC/citizens/main/images';

export interface Offer {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
  image: string;
  /** Disclosure CF attached to this offer. */
  disclosureSlug?: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  readMinutes: number;
  image: string;
  href: string;
}

export const OFFERS: Offer[] = [
  {
    id: 'cd',
    eyebrow: 'Grow your savings',
    title: '3-month CD at 4.25% APY',
    body: 'Lock in a guaranteed return with a short-term certificate of deposit.',
    cta: { label: 'Open a CD', href: '#open-cd' },
    image: `${IMG}/card-credit.jpg`,
    disclosureSlug: '3-month-cd-apy',
  },
  {
    id: 'savings',
    eyebrow: 'Start saving',
    title: 'One Deposit Savings',
    body: 'One deposit of any amount each month keeps your account fee free.',
    cta: { label: 'Open savings', href: '#open-savings' },
    image: `${IMG}/card-roundup.webp`,
    disclosureSlug: 'deposit-products-fdic',
  },
];

export const ARTICLES: Article[] = [
  {
    id: 'stress',
    title: '7 ways to reduce financial stress',
    category: 'Money management',
    readMinutes: 5,
    image: `${IMG}/card-homeequity.webp`,
    href: '#article-financial-stress',
  },
  {
    id: 'highschool',
    title: 'How to save money in high school',
    category: 'Student',
    readMinutes: 6,
    image: `${IMG}/article-savings.jpg`,
    // Cross-surface: the same content lives on the EDS marketing site.
    href: 'https://main--citizens--aemxsc.aem.page/student/articles/high-school-students-can-start-saving-money-college',
  },
  {
    id: 'budget',
    title: 'The 50/30/20 budget, explained',
    category: 'Budgeting',
    readMinutes: 4,
    image: `${IMG}/card-college.webp`,
    href: '#article-budget',
  },
];

export function getOffers(): Offer[] {
  return OFFERS;
}

export function getArticles(): Article[] {
  return ARTICLES;
}

/** The disclosure CFs surfaced in the app (FDIC standard + dynamic CD APY). */
export function accountDisclosure(): Disclosure | undefined {
  return getDisclosure('deposit-products-fdic');
}

export function offerDisclosure(slug?: string): Disclosure | undefined {
  return slug ? getDisclosure(slug) : undefined;
}
