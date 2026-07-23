import { QUICK_ACTIONS } from '@/lib/banking';

const ICONS: Record<string, React.ReactNode> = {
  deposit: <><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M8 12h8M12 8v8" /></>,
  transfer: <path d="M4 8h13l-3-3M20 16H7l3 3" />,
  pay: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></>,
  cards: <><rect x="2" y="6" width="15" height="10" rx="2" /><rect x="7" y="9" width="15" height="10" rx="2" /></>,
};

export default function QuickActions() {
  return (
    <div className="quick-actions">
      {QUICK_ACTIONS.map((a) => (
        <a key={a.label} href={a.href} className="quick-action">
          <span className="quick-action-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">{ICONS[a.icon]}</svg>
          </span>
          <span className="quick-action-label">{a.label}</span>
        </a>
      ))}
    </div>
  );
}
