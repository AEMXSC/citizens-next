import UserMenu from './UserMenu';

const NAV = [
  { label: 'Accounts', href: '#accounts' },
  { label: 'Pay & Transfer', href: '#pay' },
  { label: 'Planning', href: '#planning' },
  { label: 'Support', href: '#support' },
];

// Top masthead mirroring the NYL web dashboard: brand, primary nav, and the
// authenticated user menu on the right.
export default function Masthead() {
  return (
    <header className="masthead">
      <div className="mast-inner">
        <a className="brand" href="/" aria-label="Citizens">
          <span className="brand-logo" />
        </a>
        <nav className="top-nav">
          {NAV.map((n) => <a key={n.label} href={n.href}>{n.label}</a>)}
        </nav>
        <div className="mast-actions">
          <span className="live"><span className="live-dot" /> Live from AEM</span>
          <UserMenu name="Jane S. Smith" initials="JS" />
        </div>
      </div>
    </header>
  );
}
