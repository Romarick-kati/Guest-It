import { formatCurrency } from "../../lib/gameStatus";

export default function PaymentSummary({ lines = [], total, currency = "FCFA", className = "" }) {
  return (
    <div className={`rounded-2xl border border-[var(--color-border)] overflow-hidden ${className}`}>
      <div className="divide-y divide-[var(--color-border)]">
        {lines.map((line, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-[var(--color-ink-muted)]">{line.label}</span>
            <span className="text-sm font-medium text-[var(--color-ink)]">{line.value}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-5 py-4 bg-[var(--color-surface-muted)] border-t border-[var(--color-border)]">
        <span className="font-display font-semibold text-[var(--color-ink)]">Total</span>
        <span className="font-display font-semibold text-lg text-[var(--color-ink)]">
          {formatCurrency(total, currency)}
        </span>
      </div>
    </div>
  );
}
