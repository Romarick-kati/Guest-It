import { useEffect, useMemo, useState } from "react";
import { fetchAllParticipants, fetchGames } from "../../lib/api";
import { TableSkeleton } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import Select from "../../components/ui/Select";
import Pagination from "../../components/ui/Pagination";
import Badge from "../../components/ui/Badge";
import { usePagination } from "../../lib/usePagination";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All submission statuses" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "PENDING", label: "Pending" },
];

export default function AdminParticipants() {
  const [status, setStatus] = useState("loading");
  const [participants, setParticipants] = useState([]);
  const [games, setGames] = useState([]);
  const [gameFilter, setGameFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const load = async () => {
    setStatus("loading");
    try {
      const [p, g] = await Promise.all([fetchAllParticipants(), fetchGames()]);
      setParticipants(p);
      setGames(g);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const gameOptions = useMemo(
    () => [{ value: "ALL", label: "All games" }, ...games.map((g) => ({ value: g.id, label: g.title }))],
    [games]
  );

  const filtered = useMemo(
    () =>
      participants.filter(
        (p) =>
          (gameFilter === "ALL" || p.gameId === gameFilter) &&
          (statusFilter === "ALL" || p.status === statusFilter)
      ),
    [participants, gameFilter, statusFilter]
  );
  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 8);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Participants</h2>
        <p className="text-sm text-[var(--color-ink-muted)]">Platform-wide participation across every ON Point game</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select options={gameOptions} value={gameFilter} onChange={(e) => setGameFilter(e.target.value)} containerClassName="sm:w-56" />
        <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} containerClassName="sm:w-56" />
      </div>

      {status === "loading" && <TableSkeleton cols={6} />}
      {status === "error" && <ErrorState onRetry={load} />}
      {status === "success" && filtered.length === 0 && (
        <EmptyState title="No participants yet" description="Try a different filter, or check back once players start joining games." />
      )}
      {status === "success" && filtered.length > 0 && (
        <>
          <div className="hidden md:block overflow-x-auto scroll-thin rounded-2xl border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-surface-muted)] text-left text-[var(--color-ink-muted)]">
                  <th className="px-5 py-3 font-medium">Player</th>
                  <th className="px-5 py-3 font-medium">Game</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Submission</th>
                  <th className="px-5 py-3 font-medium">Eligibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {pageItems.map((p) => (
                  <tr key={`${p.gameId}-${p.id}`} className="hover:bg-[var(--color-surface-muted)]/60">
                    <td className="px-5 py-3.5 font-medium text-[var(--color-ink)]">{p.name}</td>
                    <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{p.gameTitle}</td>
                    <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{p.joined || "--"}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={p.payment === "CONFIRMED" ? "success" : "warning"}>{p.payment}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={p.status === "SUBMITTED" ? "success" : "neutral"}>{p.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={p.eligibility === "ELIGIBLE" ? "info" : "danger"}>{p.eligibility}</Badge>
                      {p.eligibilityReason && (
                        <p className="text-xs text-[var(--color-ink-faint)] mt-1">{p.eligibilityReason}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {pageItems.map((p) => (
              <div key={`${p.gameId}-${p.id}`} className="border border-[var(--color-border)] rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[var(--color-ink)]">{p.name}</p>
                  <Badge tone={p.status === "SUBMITTED" ? "success" : "neutral"}>{p.status}</Badge>
                </div>
                <p className="text-sm text-[var(--color-ink-muted)] mt-1">{p.gameTitle}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge tone={p.payment === "CONFIRMED" ? "success" : "warning"}>{p.payment}</Badge>
                  <Badge tone={p.eligibility === "ELIGIBLE" ? "info" : "danger"}>{p.eligibility}</Badge>
                </div>
                {p.eligibilityReason && (
                  <p className="text-xs text-[var(--color-ink-faint)] mt-1.5">{p.eligibilityReason}</p>
                )}
              </div>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
