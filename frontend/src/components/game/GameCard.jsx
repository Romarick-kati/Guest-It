import { Link } from "react-router-dom";
import GameImage from "./GameImage";
import GameStatusBadge from "./GameStatusBadge";
import GameCountdown from "./GameCountdown";
import Button from "../ui/Button";
import { GAME_STATUS } from "../../lib/gameStatus";
import { formatCurrency } from "../../lib/gameStatus";

function ctaFor(status) {
  switch (status) {
    case GAME_STATUS.UPCOMING:
      return { label: "View game", variant: "outline" };
    case GAME_STATUS.LIVE:
      return { label: "Play now", variant: "primary" };
    case GAME_STATUS.CLOSED:
      return { label: "View details", variant: "outline" };
    case GAME_STATUS.COMPLETED:
      return { label: "View result", variant: "outline" };
    default:
      return { label: "View game", variant: "outline" };
  }
}

export default function GameCard({ game }) {
  const cta = ctaFor(game.status);
  const now = Date.now();
  const secondsToStart = Math.max(0, Math.round((game.startsAt - now) / 1000));
  const secondsToEnd = Math.max(0, Math.round((game.endsAt - now) / 1000));

  return (
    <Link
      to={`/games/${game.id}`}
      // replace, not push: the games list and a specific game act as one
      // "slot" in history, so the in-app back button (which always returns
      // to the list) is the one way back - the browser/gesture back button
      // exits the games section entirely instead of resurfacing games
      // browsed earlier, which is what was landing players back on a
      // random game when they meant to leave the list screen.
      replace
      className="group flex flex-col h-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden hover:border-[var(--color-border-strong)] hover-lift"
    >
      <div className="relative h-36 overflow-hidden">
        <GameImage
          image={game.image}
          media={game.media}
          title={game.title}
          className="h-full transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <GameStatusBadge status={game.status} />
        </div>
        {game.status === GAME_STATUS.LIVE && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
            <GameCountdown seconds={secondsToEnd} size="sm" className="!text-white" />
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className="font-display font-semibold text-[var(--color-ink)]">{game.title}</h3>
          {game.description && (
            <p className="text-sm text-[var(--color-ink-muted)] mt-0.5 line-clamp-2">
              {game.description}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2 border-t border-[var(--color-border)]">
          <div className="text-sm">
            <p className="text-[var(--color-ink-muted)]">Prize</p>
            <p className="font-display font-semibold text-[var(--color-ink)]">
              {game.prize ? formatCurrency(game.prize, game.currency) : "Bragging rights"}
            </p>
          </div>

          {game.status === GAME_STATUS.UPCOMING && (
            <div className="text-sm text-right">
              <p className="text-[var(--color-ink-muted)]">Starts in</p>
              <GameCountdown seconds={secondsToStart} size="sm" />
            </div>
          )}

          {(game.status === GAME_STATUS.LIVE || game.status === GAME_STATUS.CLOSED) && (
            <div className="text-sm text-right text-[var(--color-ink-muted)]">
              {game.participants} joined
            </div>
          )}
        </div>

        <Button variant={cta.variant} fullWidth className="mt-1" tabIndex={-1}>
          {cta.label}
        </Button>
      </div>
    </Link>
  );
}
