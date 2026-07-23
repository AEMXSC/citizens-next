// Financial wellness: the credit-score widget from the app's home screen.
// Score is demo data; the range marker is positioned across a 300-850 scale.
const SCORE = 815;
const MIN = 300;
const MAX = 850;
const DELTA = 5;
const RATING = 'Excellent';
const UPDATED = 'June 03';

export default function CreditScore() {
  const pct = ((SCORE - MIN) / (MAX - MIN)) * 100;
  return (
    <div className="score-card">
      <p className="score-title">Your credit score</p>
      <div className="score-row">
        <span className="score-num">{SCORE}</span>
        <span className="score-delta">▲ {DELTA} points</span>
      </div>
      <p className="score-rating">{RATING} <span>| Updated on {UPDATED}</span></p>
      <div className="score-bar" role="img" aria-label={`Credit score ${SCORE}, ${RATING}`}>
        <span className="score-marker" style={{ left: `${pct}%` }} />
      </div>
      <div className="score-scale">
        <span>{MIN}</span>
        <span>{MAX}</span>
      </div>
      <p className="score-source">VantageScore® by Experian</p>
    </div>
  );
}
