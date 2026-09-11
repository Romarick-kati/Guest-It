import { useEffect, useMemo, useState } from "react";
import { fetchWinners } from "../../lib/api";
import { TableSkeleton } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import WinnerTable from "../../components/admin/WinnerTable";
import Select from "../../components/ui/Select";
import Pagination from "../../components/ui/Pagination";
import { usePagination } from "../../lib/usePagination";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
];

export default function Winners() {
  const [status, setStatus] = useState("loading");
  const [winners, setWinners] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const load = async () => {
    setStatus("loading");
    try {
      setWinners(await fetchWinners());
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => winners.filter((w) => statusFilter === "ALL" || w.status === statusFilter),
    [winners, statusFilter]
  );
  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 8);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Winners</h2>
          <p className="text-sm text-[var(--color-ink-muted)]">Platform-wide winner management across all games</p>
        </div>
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          containerClassName="sm:w-52"
        />
      </div>

      {status === "loading" && <TableSkeleton cols={6} />}
      {status === "error" && <ErrorState onRetry={load} />}
      {status === "success" && filtered.length === 0 && (
        <EmptyState title="No winners yet" description="Winners will appear here once games are completed." />
      )}
      {status === "success" && filtered.length > 0 && (
        <>
          <WinnerTable winners={pageItems} />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
