import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import GameTable from "../../components/admin/GameTable";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Pagination from "../../components/ui/Pagination";
import { TableSkeleton } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import { fetchGames } from "../../lib/api";
import { GAME_STATUS_META } from "../../lib/gameStatus";
import { GAME_TYPES } from "../../lib/mockData";
import { usePagination } from "../../lib/usePagination";
import { icons } from "../../components/ui/icons";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  ...Object.keys(GAME_STATUS_META).map((key) => ({ value: key, label: GAME_STATUS_META[key].label })),
];

const TYPE_OPTIONS = [{ value: "ALL", label: "All game types" }, ...GAME_TYPES];

export default function AdminGames() {
  const [status, setStatus] = useState("loading");
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const load = async () => {
    setStatus("loading");
    try {
      setGames(await fetchGames());
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return games.filter((g) => {
      const matchesSearch = g.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filter === "ALL" || g.status === filter;
      const matchesType = typeFilter === "ALL" || g.gameType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [games, search, filter, typeFilter]);

  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 6);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Games</h2>
          <p className="text-sm text-[var(--color-ink-muted)]">
            Manage every game running on ON Point — Guess it and future game types
          </p>
        </div>
        <Link to="/admin/games/create">
          <Button>+ Create game</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          containerClassName="flex-1"
          prefix={<icons.search className="h-4 w-4" />}
        />
        <Select
          options={TYPE_OPTIONS}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          containerClassName="sm:w-52"
        />
        <Select
          options={STATUS_OPTIONS}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          containerClassName="sm:w-52"
        />
      </div>

      {status === "loading" && <TableSkeleton cols={6} />}
      {status === "error" && <ErrorState onRetry={load} description="Unable to load games." />}
      {status === "success" && filtered.length === 0 && (
        <EmptyState
          title="No games yet"
          description="Create your first game to get started."
          action={
            <Link to="/admin/games/create">
              <Button>+ Create game</Button>
            </Link>
          }
        />
      )}
      {status === "success" && filtered.length > 0 && (
        <>
          <GameTable games={pageItems} />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
