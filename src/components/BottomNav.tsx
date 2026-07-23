// Fixed bottom tab bar matching the app's primary navigation
// (Home, Pay & Transfer, Deposit, Help).
const TABS = [
  { label: 'Home', icon: <path d="M3 10l9-6 9 6v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />, active: true },
  { label: 'Pay & Transfer', icon: <path d="M4 8h13l-3-3M20 16H7l3 3" /> },
  { label: 'Deposit', icon: <><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M8 12h8M12 8v8" /></> },
  { label: 'Help', icon: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3M12 17h.01" /></> },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {TABS.map((t) => (
        <button
          key={t.label}
          type="button"
          className={`bottom-tab ${t.active ? 'bottom-tab-active' : ''}`}
          aria-current={t.active ? 'page' : undefined}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">{t.icon}</svg>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
