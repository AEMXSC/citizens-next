import { money, type Account } from '@/lib/banking';

function AccountIcon({ kind }: { kind: Account['kind'] }) {
  return (
    <span className={`acct-icon acct-icon-${kind}`} aria-hidden="true">
      <svg viewBox="0 0 24 24">
        {kind === 'credit'
          ? <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></>
          : <path d="M3 10l9-6 9 6v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />}
      </svg>
    </span>
  );
}

export default function AccountCard({ account }: { account: Account }) {
  return (
    <article className="acct-card">
      <div className="acct-head">
        <AccountIcon kind={account.kind} />
        <div>
          <h3 className="acct-name">{account.name}</h3>
          <p className="acct-mask">****{account.mask}</p>
        </div>
      </div>
      <p className="acct-balance-label">{account.balanceLabel}</p>
      <p className="acct-balance">{money(account.balance)}</p>
      {account.kind === 'credit' && account.minimumPayment ? (
        <div className="acct-footer">
          <span className="acct-due">
            Minimum payment of {money(account.minimumPayment)} due {account.paymentDue}
          </span>
          <button type="button" className="btn-pill">Pay card</button>
        </div>
      ) : null}
    </article>
  );
}
