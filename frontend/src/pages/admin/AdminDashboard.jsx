import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../components/admin/StatCard";
import GameTable from "../../components/admin/GameTable";
import ActiveGamesList from "../../components/admin/ActiveGamesList";
import ActivityList from "../../components/admin/ActivityList";
import Card, { CardHeader } from "../../components/ui/Card";
import { StatCardSkeleton, TableSkeleton, CardListSkeleton } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import WinnerCard from "../../components/game/WinnerCard";
import { fetchDashboardStats, fetchGames, fetchWinners, fetchRecentActivity } from "../../lib/api";
import { GAME_STATUS } from "../../lib/gameStatus";
import { icons } from "../../components/ui/icons";

export default function AdminDashboard() {
  const [status, setStatus] = useState("loading");
  const [stats, setStats] = useState(null);
  const [games, setGames] = useState([]);
  const [winnersList, setWinnersList] = useState([]);
  const [activity, setActivity] = useState([]);

  const load = async () => {
    setStatus("loading");
    try {
      const [s, g, w, a] = await Promise.all([
        fetchDashboardStats(),
        fetchGames(),
        fetchWinners(),
        fetchRecentActivity(),
      ]);
      setStats(s);
      setGames(g);
      setWinnersList(w);
      setActivity(a);
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
  const recentGames = [...games].sort((a, b) => b.startsAt - a.startsAt).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          <StatCard key="users" label="Total users" value={stats.totalUsers.toLocaleString()} icon={<icons.users className="h-4 w-4" />} change={8} description="vs last month" />,
          <StatCard key="active" label="Active games" value={stats.activeGames} icon={<icons.controller className="h-4 w-4" />} />,
          <StatCard key="completed" label="Completed games" value={stats.completedGames} icon={<icons.clipboard className="h-4 w-4" />} />,
          <StatCard key="participants" label="Total participants" value={stats.totalParticipants.toLocaleString()} icon={<icons.grid className="h-4 w-4" />} change={12} description="vs last month" />,
          <StatCard key="winners" label="Total winners" value={stats.totalWinners.toLocaleString()} icon={<icons.trophy className="h-4 w-4" />} />,
          <StatCard key="entries" label="Total entries" value={stats.totalEntries.toLocaleString()} icon={<icons.transactions className="h-4 w-4" />} change={5} description="vs last month" />,
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
            title="Recent winners"
            subtitle="Latest confirmed results"
            action={
              <Link to="/admin/winners" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
                View all
              </Link>
            }
          />
          <div className="mt-4 flex flex-col gap-3">
            {winnersList.slice(0, 2).map((w) => (
              <WinnerCard
                key={w.id}
                game={w.game}
                winner={w.winner}
                winningAnswer={w.winningAnswer}
                prize={w.prize}
                currency={w.currency}
                date={w.date}
                status={w.status}
              />
            ))}
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
            <ActivityList items={activity} />
          </div>
        </Card>
      </div>
    </div>
  );
}
