import { useEffect, useMemo, useState } from "react";
import { fetchTransactions } from "../../lib/api";
import { formatCurrency } from "../../lib/gameStatus";
import { TableSkeleton } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import SortableTh from "../../components/ui/SortableTh";
import { usePagination } from "../../lib/usePagination";
import { useSortableData } from "../../lib/useSortableData";
import { icons } from "../../components/ui/icons";

const TYPE_OPTIONS = [
  { value: "ALL", label: "All types" },
  { value: "GAME_ENTRY", label: "Game entry" },
  { value: "PRIZE", label: "Prize" },
  { value: "REFUND", label: "Refund" },
  { value: "WITHDRAWAL", label: "Withdrawal" },
];

const STATUS_TONE = { SUCCESS: "success", PENDING: "warning", FAILED: "danger", CANCELLED: "neutral" };

export default function AdminTransactions() {
  const [status, setStatus] = useState("loading");
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const load = async () => {
    setStatus("loading");
    try {
      setTransactions(await fetchTransactions());
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        const matchesType = typeFilter === "ALL" || t.type === typeFilter;
        const matchesSearch =
          t.player.toLowerCase().includes(search.toLowerCase()) ||
          t.game.toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
      }),
    [transactions, search, typeFilter]
  );
  const { sorted, sortKey, sortDir, toggleSort } = useSortableData(filtered, {
    defaultKey: "date",
    defaultDir: "desc",
    accessors: {
      id: (t) => t.id,
      player: (t) => t.player?.toLowerCase(),
      game: (t) => t.game?.toLowerCase(),
      amount: (t) => t.amount,
      type: (t) => t.type,
      status: (t) => t.status,
      date: (t) => new Date(t.date).getTime() || t.date,
    },
  });
  const { page, setPage, totalPages, pageItems } = usePagination(sorted, 8);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Transactions</h2>
        <p className="text-sm text-[var(--color-ink-muted)]">
          Platform payment activity — UI only, no payment processing happens here
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by player or game..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          containerClassName="flex-1"
          prefix={<icons.search className="h-4 w-4" />}
        />
        <Select options={TYPE_OPTIONS} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} containerClassName="sm:w-52" />
      </div>

      {status === "loading" && <TableSkeleton cols={6} />}
      {status === "error" && <ErrorState onRetry={load} />}
      {status === "success" && filtered.length === 0 && (
        <EmptyState title="No transactions yet" description="Payments and payouts will appear here as they happen." />
      )}
      {status === "success" && filtered.length > 0 && (
        <>
          <div className="hidden md:block overflow-x-auto scroll-thin rounded-2xl border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-surface-muted)] text-left text-[var(--color-ink-muted)]">
                  <SortableTh label="Transaction" sortKeyName="id" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Player" sortKeyName="player" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Game" sortKeyName="game" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Amount" sortKeyName="amount" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Type" sortKeyName="type" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Status" sortKeyName="status" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Date" sortKeyName="date" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {pageItems.map((t) => (
                  <tr key={t.id} className="hover:bg-[var(--color-surface-muted)]/60">
                    <td className="px-5 py-3.5 font-medium text-[var(--color-ink)]">{t.id.toUpperCase()}</td>
                    <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{t.player}</td>
                    <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{t.game}</td>
                    <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{formatCurrency(t.amount, t.currency)}</td>
                    <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{t.type.replace("_", " ")}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={STATUS_TONE[t.status] || "neutral"}>{t.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--color-ink-faint)]">{t.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {pageItems.map((t) => (
              <div key={t.id} className="border border-[var(--color-border)] rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[var(--color-ink)]">{t.player}</p>
                  <Badge tone={STATUS_TONE[t.status] || "neutral"}>{t.status}</Badge>
                </div>
                <p className="text-sm text-[var(--color-ink-muted)] mt-1">{t.game}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-[var(--color-ink-faint)]">
                  <span>{t.type.replace("_", " ")}</span>
                  <span>{formatCurrency(t.amount, t.currency)}</span>
                </div>
                <p className="text-xs text-[var(--color-ink-faint)] mt-1">{t.date}</p>
              </div>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
