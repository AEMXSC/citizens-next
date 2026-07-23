import { PROFILE } from '@/lib/banking';

// The green app header: menu, settings, the "Ask CiZi" assistant pill, and the
// large serif greeting, matching the Citizens mobile app home screen.
export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header-row">
        <button type="button" className="icon-btn" aria-label="Menu">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
        </button>
        <div className="app-header-actions">
          <button type="button" className="icon-btn" aria-label="Settings">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></svg>
          </button>
          <button type="button" className="ask-pill">Ask CiZi</button>
        </div>
      </div>
      <h1 className="app-greeting">{PROFILE.greeting}</h1>
    </header>
  );
}
