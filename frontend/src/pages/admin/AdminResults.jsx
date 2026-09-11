import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchGames, fetchParticipants, fetchResolution } from "../../lib/api";
import { formatCurrency, GAME_STATUS } from "../../lib/gameStatus";
import { summariseOutcome } from "../../lib/resolution";
import { TableSkeleton } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import Badge from "../../components/ui/Badge";

// Turns a game + its live participants into a one-line, human-readable
// outcome for the table. This is read-only summary text - the actual
// determination happens the same way it does on the result page itself
// (see lib/resolution.js), never picked by hand here.
async function describeOutcome(game) {
  if (!game.result) return { label: "Pending", tone: "neutral" };
  const participants = await fetchParticipants(game.id);
  const outcome = summariseOutcome(participants, game.result.correctAnswer);
  if (outcome.case === "NO_WINNER") return { label: "No winner", tone: "neutral" };
  if (outcome.case === "SINGLE_WINNER") return { label: outcome.eligible[0].name, tone: "success" };
  // TIE
  const resolution = await fetchResolution(game.id);
  if (!resolution || resolution.status !== "RESOLVED") return { label: "Tied — pending", tone: "warning" };
  if (resolution.method === "RANDOM") return { label: `${resolution.winners[0].name} (random draw)`, tone: "success" };
  if (resolution.method === "SPLIT") return { label: `Split × ${resolution.winners.length}`, tone: "success" };
  return { label: "Tiebreaker scheduled", tone: "warning" };
}

export default function AdminResults() {
  const [status, setStatus] = useState("loading");
  const [games, setGames] = useState([]);
  const [outcomes, setOutcomes] = useState({});

  const load = async () => {
    setStatus("loading");
    try {
      const all = await fetchGames();
      setGames(all);
      const completedList = all.filter((g) => g.status === GAME_STATUS.COMPLETED);
      const entries = await Promise.all(completedList.map(async (g) => [g.id, await describeOutcome(g)]));
      setOutcomes(Object.fromEntries(entries));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const completed = games.filter((g) => g.status === GAME_STATUS.COMPLETED);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Results</h2>
        <p className="text-sm text-[var(--color-ink-muted)]">
          Outcomes determined by the system for completed games
        </p>
      </div>

      {status === "loading" && <TableSkeleton cols={5} />}
      {status === "error" && <ErrorState onRetry={load} />}
      {status === "success" && completed.length === 0 && (
        <EmptyState title="No results yet" description="Results appear here once a game closes and the backend publishes an outcome." />
      )}
      {status === "success" && completed.length > 0 && (
        <div className="hidden md:block overflow-x-auto scroll-thin rounded-2xl border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-muted)] text-left text-[var(--color-ink-muted)]">
                <th className="px-5 py-3 font-medium">Game</th>
                <th className="px-5 py-3 font-medium">Correct answer</th>
                <th className="px-5 py-3 font-medium">Outcome</th>
                <th className="px-5 py-3 font-medium">Prize</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {completed.map((g) => (
                <tr key={g.id} className="hover:bg-[var(--color-surface-muted)]/60">
                  <td className="px-5 py-3.5 font-medium text-[var(--color-ink)]">{g.title}</td>
                  <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{g.result?.correctAnswer ?? "--"}</td>
                  <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">
                    {outcomes[g.id] ? <Badge tone={outcomes[g.id].tone}>{outcomes[g.id].label}</Badge> : "--"}
                  </td>
                  <td className="px-5 py-3.5 text-[var(--color-ink-muted)]">{formatCurrency(g.prize, g.currency)}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={g.result ? "success" : "neutral"}>{g.result ? "Published" : "Pending"}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link to={`/admin/games/${g.id}/result`} className="text-[var(--color-accent)] hover:underline font-medium">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {status === "success" && completed.length > 0 && (
        <div className="md:hidden flex flex-col gap-3">
          {completed.map((g) => (
            <div key={g.id} className="border border-[var(--color-border)] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-[var(--color-ink)]">{g.title}</p>
                <Badge tone={g.result ? "success" : "neutral"}>{g.result ? "Published" : "Pending"}</Badge>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm text-[var(--color-ink-muted)]">
                {outcomes[g.id] ? <Badge tone={outcomes[g.id].tone}>{outcomes[g.id].label}</Badge> : <span>--</span>}
                <span>{formatCurrency(g.prize, g.currency)}</span>
              </div>
              <Link to={`/admin/games/${g.id}/result`} className="text-sm font-medium text-[var(--color-accent)] mt-2 inline-block">
                View result
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
