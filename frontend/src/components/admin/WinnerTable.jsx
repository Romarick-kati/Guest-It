import { Link } from "react-router-dom";
import Badge from "../ui/Badge";
import SortableTh from "../ui/SortableTh";
import { useSortableData } from "../../lib/useSortableData";
import { formatCurrency } from "../../lib/gameStatus";

const STATUS_TONE = {
  PAID: "success",
  CONFIRMED: "info",
  PENDING: "warning",
  FAILED: "danger",
};

export default function WinnerTable({ winners = [] }) {
  const { sorted, sortKey, sortDir, toggleSort } = useSortableData(winners, {
    accessors: {
      winner: (w) => w.winner?.toLowerCase(),
      game: (w) => w.game?.toLowerCase(),
      winningAnswer: (w) => w.winningAnswer,
      prize: (w) => w.prize,
      date: (w) => new Date(w.date).getTime() || w.date,
      status: (w) => w.status,
    },
  });

  return (
    <div className="w-full">
      <div className="hidden md:block overflow-x-auto scroll-thin rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-surface-muted)] text-left text-[var(--color-ink-muted)]">
              <SortableTh label="Winner" sortKeyName="winner" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Game" sortKeyName="game" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Winning answer" sortKeyName="winningAnswer" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Prize" sortKeyName="prize" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Date" sortKeyName="date" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableTh label="Status" sortKeyName="status" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {sorted.map((w) => (
              <tr key={w.id} className="hover:bg-[var(--color-surface-muted)]/60">
                <td className="px-5 py-3.5 font-medium text-[var(--color-ink)]">{w.winner}</td>
                <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">
                  <Link to={`/admin/games/${w.gameId}`} className="hover:text-[var(--color-accent)] hover:underline">
                    {w.game}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{w.winningAnswer}</td>
                <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{formatCurrency(w.prize, w.currency)}</td>
                <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{w.date}</td>
                <td className="px-5 py-3.5">
                  <Badge tone={STATUS_TONE[w.status] || "neutral"}>{w.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-3">
        {sorted.map((w) => (
          <div key={w.id} className="border border-[var(--color-border)] rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-[var(--color-ink)]">{w.winner}</p>
              <Badge tone={STATUS_TONE[w.status] || "neutral"}>{w.status}</Badge>
            </div>
            <p className="text-sm text-[var(--color-ink-muted)] mt-1">{w.game}</p>
            <div className="flex items-center justify-between mt-2 text-xs text-[var(--color-ink-faint)]">
              <span>Answer: {w.winningAnswer}</span>
              <span>{formatCurrency(w.prize, w.currency)}</span>
            </div>
            <p className="text-xs text-[var(--color-ink-faint)] mt-1">{w.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
