import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../components/admin/StatCard";
import GameTable from "../../components/admin/GameTable";
import ActiveGamesList from "../../components/admin/ActiveGamesList";
import ActivityList from "../../components/admin/ActivityList";
import Card, { CardHeader } from "../../components/ui/Card";
import { StatCardSkeleton, TableSkeleton, CardListSkeleton } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import { fetchAdminStats, fetchGames } from "../../lib/api";
import { GAME_STATUS, formatCurrency } from "../../lib/gameStatus";
import { icons } from "../../components/ui/icons";

// Handles both past ("started 5m ago") and future ("starts in 5m")
// timestamps - CommentSection.jsx's timeAgo only needs the past case.
function relativeTime(ts) {
  const diffSeconds = Math.round((ts - Date.now()) / 1000);
  const future = diffSeconds >= 0;
  const seconds = Math.abs(diffSeconds);
  let value;
  if (seconds < 60) value = "moments";
  else if (seconds < 3600) value = `${Math.round(seconds / 60)}m`;
  else if (seconds < 86400) value = `${Math.round(seconds / 3600)}h`;
  else value = `${Math.round(seconds / 86400)}d`;
  return future ? `in ${value}` : `${value} ago`;
}

export default function AdminDashboard() {
  const [status, setStatus] = useState("loading");
  const [totalUsers, setTotalUsers] = useState(0);
  const [games, setGames] = useState([]);

  const load = async () => {
    setStatus("loading");
    try {
      const [s, g] = await Promise.all([fetchAdminStats(), fetchGames()]);
      setTotalUsers(s.totalUsers);
      setGames(g);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (status === "loading") {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton cols={5} />
        <div className="grid lg:grid-cols-2 gap-6">
          <CardListSkeleton />
          <CardListSkeleton />
        </div>
      </div>
    );
  }
  if (status === "error") return <ErrorState onRetry={load} description="Unable to load the dashboard." className="min-h-[50vh]" />;

  const activeGames = games.filter((g) => g.status === GAME_STATUS.LIVE || g.status === GAME_STATUS.PAUSED);
  const completedGames = games.filter((g) => g.status === GAME_STATUS.COMPLETED || g.status === GAME_STATUS.CLOSED);
  const resolvedGames = games.filter((g) => g.result?.correctAnswer != null);
  const totalParticipants = games.reduce((sum, g) => sum + (g.participants || 0), 0);
  const totalSubmissions = games.reduce((sum, g) => sum + (g.submissions || 0), 0);
  const recentGames = [...games].sort((a, b) => b.startsAt - a.startsAt).slice(0, 5);
  const recentResolved = [...resolvedGames].sort((a, b) => b.endsAt - a.endsAt).slice(0, 3);

  // Derived straight from real game records - a live game, an upcoming one,
  // and a published result are each a genuine, timestamped event, unlike
  // the old static flavor-text feed.
  const activityItems = [
    ...games
      .filter((g) => g.status === GAME_STATUS.LIVE)
      .map((g) => ({ id: `${g.id}-live`, text: `"${g.title}" is live`, ts: g.startsAt })),
    ...games
      .filter((g) => g.status === GAME_STATUS.UPCOMING)
      .map((g) => ({ id: `${g.id}-upcoming`, text: `"${g.title}" starts soon`, ts: g.startsAt })),
    ...resolvedGames.map((g) => ({ id: `${g.id}-result`, text: `"${g.title}" result published`, ts: g.endsAt }))
  ]
    .sort((a, b) => Math.abs(a.ts - Date.now()) - Math.abs(b.ts - Date.now()))
    .slice(0, 6)
    .map((item) => ({ ...item, time: relativeTime(item.ts) }));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          <StatCard key="users" label="Total users" value={totalUsers.toLocaleString()} icon={<icons.users className="h-4 w-4" />} />,
          <StatCard key="active" label="Active games" value={activeGames.length} icon={<icons.controller className="h-4 w-4" />} />,
          <StatCard key="completed" label="Completed games" value={completedGames.length} icon={<icons.clipboard className="h-4 w-4" />} />,
          <StatCard key="participants" label="Total participants" value={totalParticipants.toLocaleString()} icon={<icons.grid className="h-4 w-4" />} />,
          <StatCard key="resolved" label="Results published" value={resolvedGames.length} icon={<icons.trophy className="h-4 w-4" />} />,
          <StatCard key="submissions" label="Total submissions" value={totalSubmissions.toLocaleString()} icon={<icons.transactions className="h-4 w-4" />} />,
        ].map((card, i) => (
          <div key={card.key} className="stagger-item" style={{ "--i": i }}>
            {card}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Active games"
          subtitle="Games currently live on ON Point"
          action={
            <Link to="/admin/games" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
              View all
            </Link>
          }
        />
        <div className="mt-2">
          <ActiveGamesList games={activeGames} />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Recent games"
          subtitle="Latest activity across all games"
          action={
            <Link to="/admin/games" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
              View all
            </Link>
          }
        />
        <div className="mt-4">
          <GameTable games={recentGames} />
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Recently resolved"
            subtitle="Games with a published correct answer"
            action={
              <Link to="/admin/winners" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
                View all
              </Link>
            }
          />
          <div className="mt-4 flex flex-col gap-3">
            {recentResolved.length === 0 ? (
              <EmptyState
                title="No results published yet"
                description="Set a game's correct answer to publish its result."
                className="py-8"
              />
            ) : (
              recentResolved.map((g) => (
                <Link
                  key={g.id}
                  to={`/admin/games/${g.id}/result`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] p-3.5 hover:border-[var(--color-border-strong)] hover-lift"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-ink)] truncate">{g.title}</p>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                      Correct answer: {g.result.correctAnswer.toLocaleString()}{g.unit ? ` ${g.unit}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-[var(--color-ink)]">
                    {formatCurrency(g.prize, g.currency)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Recent activity"
            subtitle="Platform-wide events"
            action={
              <Link to="/admin/notifications" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
                View all
              </Link>
            }
          />
          <div className="mt-2">
            {activityItems.length === 0 ? (
              <EmptyState title="Nothing to show yet" description="Live, upcoming, and resolved games will show up here." className="py-8" />
            ) : (
              <ActivityList items={activityItems} />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
