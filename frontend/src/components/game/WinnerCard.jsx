import { formatCurrency } from "../../lib/gameStatus";
import Badge from "../ui/Badge";

export default function WinnerCard({ game, winner, winningAnswer, prize, currency = "FCFA", date, status, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-accent-soft)] to-[var(--color-surface)] p-5 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)]">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 4a1 1 0 011-1h12a1 1 0 011 1v1h1.5A1.5 1.5 0 0122 6.5v1A3.5 3.5 0 0118.5 11h-.35A6.01 6.01 0 0113 15.9V18h2a1 1 0 011 1v1a1 1 0 01-1 1H9a1 1 0 01-1-1v-1a1 1 0 011-1h2v-2.1A6.01 6.01 0 015.85 11H5.5A3.5 3.5 0 012 7.5v-1A1.5 1.5 0 013.5 5H5V4zm0 3H3.5a.5.5 0 00-.5.5v1A1.5 1.5 0 004.5 10H5V7zm14 0v3h.5A1.5 1.5 0 0021 8.5v-1a.5.5 0 00-.5-.5H19z" />
          </svg>
          Winner
        </span>
        {status && (
          <Badge tone={status === "PAID" ? "success" : "warning"}>{status}</Badge>
        )}
      </div>

      {game && <p className="text-sm text-[var(--color-ink-muted)] mb-1">{game}</p>}
      <p className="font-display font-semibold text-xl text-[var(--color-ink)]">{winner}</p>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border)]">
        <div>
          <p className="text-xs text-[var(--color-ink-muted)]">Winning answer</p>
          <p className="font-medium text-[var(--color-ink)]">{winningAnswer}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--color-ink-muted)]">Prize</p>
          <p className="font-display font-semibold text-[var(--color-ink)]">
            {formatCurrency(prize, currency)}
          </p>
        </div>
      </div>
      {date && <p className="text-xs text-[var(--color-ink-faint)] mt-3">{date}</p>}
    </div>
  );
}
