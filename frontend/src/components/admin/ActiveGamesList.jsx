import { Link } from "react-router-dom";
import GameStatusBadge from "../game/GameStatusBadge";
import GameCountdown from "../game/GameCountdown";
import { formatCurrency } from "../../lib/gameStatus";
import Button from "../ui/Button";

export default function ActiveGamesList({ games = [] }) {
  if (games.length === 0) {
    return <p className="text-sm text-[var(--color-ink-muted)] py-6 text-center">No games are live right now.</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-[var(--color-border)]">
      {games.map((game) => {
        const secondsToEnd = Math.max(0, Math.round((game.endsAt - Date.now()) / 1000));
        return (
          <div key={game.id} className="py-3.5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-[var(--color-ink)]">{game.title}</p>
                <GameStatusBadge status={game.status} />
              </div>
              <p className="text-xs text-[var(--color-ink-muted)]">
                {game.participants} participants · {formatCurrency(game.entryFee, game.currency)} entry ·{" "}
                {formatCurrency(game.prize, game.currency)} prize
              </p>
            </div>
            <div className="flex items-center gap-4">
              <GameCountdown seconds={secondsToEnd} size="sm" />
              <Link to={`/admin/games/${game.id}`}>
                <Button size="sm" variant="outline">
                  View
                </Button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
