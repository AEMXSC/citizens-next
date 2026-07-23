// Mock banking data for the app shell. Account balances are demo values; in a
// real build these come from the core banking API. The CONTENT surfaces
// (offers, articles, disclosures) are the Content Fragment story — see content.ts.

export interface Account {
  id: string;
  name: string;
  mask: string;
  kind: 'checking' | 'savings' | 'credit';
  /** Available balance (deposit) or current balance (credit). */
  balance: number;
  balanceLabel: string;
  /** Credit only. */
  minimumPayment?: number;
  paymentDue?: string;
}

export interface QuickAction {
  label: string;
  icon: string; // inline svg path data key
  href: string;
}

export const PROFILE = {
  greeting: 'Good morning',
  name: 'Jordan',
};

export const PERSONAL_ACCOUNTS: Account[] = [
  {
    id: 'chk',
    name: 'One Deposit Checking',
    mask: '4592',
    kind: 'checking',
    balance: 5270.58,
    balanceLabel: 'Available balance',
  },
  {
    id: 'sav',
    name: 'One Deposit Savings',
    mask: '2535',
    kind: 'savings',
    balance: 1240.72,
    balanceLabel: 'Available balance',
  },
];

export const CREDIT_ACCOUNTS: Account[] = [
  {
    id: 'cc',
    name: 'Citizens Cash Back Plus™ World Mastercard®',
    mask: '2535',
    kind: 'credit',
    balance: 1240.72,
    balanceLabel: 'Current balance',
    minimumPayment: 23.23,
    paymentDue: 'Dec 13',
  },
];

export const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Deposit', icon: 'deposit', href: '#deposit' },
  { label: 'Transfer', icon: 'transfer', href: '#transfer' },
  { label: 'Pay a bill', icon: 'pay', href: '#pay' },
  { label: 'Manage cards', icon: 'cards', href: '#cards' },
];

export function personalTotal(): number {
  return PERSONAL_ACCOUNTS.reduce((sum, a) => sum + a.balance, 0);
}

export function money(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
