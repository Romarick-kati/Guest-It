import { useEffect, useMemo, useState } from "react";
import GameCard from "../../components/game/GameCard";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import { fetchGames } from "../../lib/api";
import { GAME_STATUS } from "../../lib/gameStatus";

const TABS = [
  { key: "live", label: "Live games", statuses: [GAME_STATUS.LIVE] },
  { key: "upcoming", label: "Upcoming", statuses: [GAME_STATUS.UPCOMING] },
  { key: "completed", label: "Completed", statuses: [GAME_STATUS.COMPLETED, GAME_STATUS.CLOSED] },
];

export default function Games() {
  const [status, setStatus] = useState("idle");
  const [allGames, setAllGames] = useState([]);
  const [tab, setTab] = useState("live");

  const load = async () => {
    setStatus("loading");
    try {
      const data = await fetchGames();
      setAllGames(data);
      setStatus("success");
    } catch (e) {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeTab = TABS.find((t) => t.key === tab);
  const filtered = useMemo(
    () => allGames.filter((g) => activeTab.statuses.includes(g.status)),
    [allGames, activeTab]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          Available games
        </h1>
        <p className="text-sm text-[var(--color-ink-muted)] mt-1">
          Match the exact number and win real prizes.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto scroll-thin -mx-4 px-4 sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              tab === t.key
                ? "bg-[var(--color-ink)] text-[var(--color-bg)] border-[var(--color-ink)]"
                : "bg-[var(--color-surface)] text-[var(--color-ink-muted)] border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {status === "loading" && <LoadingState label="Loading games..." />}
      {status === "error" && <ErrorState onRetry={load} description="We couldn't load available games. Please try again." />}
      {status === "success" && filtered.length === 0 && (
        <EmptyState
          title={`No ${activeTab.label.toLowerCase()} right now`}
          description="Check back soon, or browse another category above."
        />
      )}
      {status === "success" && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((game, i) => (
            <div key={game.id} className="stagger-item h-full" style={{ "--i": i }}>
              <GameCard game={game} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
