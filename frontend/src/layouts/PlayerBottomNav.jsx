import { Link, useLocation } from "react-router-dom";
import { icons } from "../components/ui/icons";
import { getLastGameId } from "../lib/lastGame";

const PlayIcon = icons.controller;
const ProfileIcon = icons.user;

function tabClass(isActive) {
  return `flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${
    isActive ? "text-[var(--color-accent)]" : "text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)]"
  }`;
}

/**
 * Mobile-only tab bar so players always have a one-tap way back to the
 * games list and to their profile - the desktop layout already covers
 * both via the top header (logo + avatar), so this stays hidden at sm+.
 */
export default function PlayerBottomNav() {
  const location = useLocation();
  const onGames = location.pathname.startsWith("/games");
  const onProfile = location.pathname.startsWith("/profile");

  // From outside the games section (e.g. checking your profile mid-game),
  // Play jumps straight back to the live game you were in. While already
  // browsing games/a game, it just points at the list - so re-tapping Play
  // never yanks you out of the list you're intentionally looking at.
  const lastGameId = getLastGameId();
  const jumpingToGame = !onGames && Boolean(lastGameId);
  const playTo = jumpingToGame ? `/games/${lastGameId}` : "/games";

  return (
    <nav
      aria-label="Primary"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 h-14 bg-[var(--color-surface)]/95 backdrop-blur border-t border-[var(--color-border)]"
    >
      <div className="grid grid-cols-2 h-full max-w-6xl mx-auto">
        {/* replace, not push, when jumping straight into a remembered game:
            it's a shortcut, not a page the player deliberately drilled into,
            so it shouldn't leave an entry the browser's back button can
            land on later (e.g. while casually browsing the games list). */}
        <Link to={playTo} replace={jumpingToGame} className={tabClass(onGames)}>
          <PlayIcon className="h-5 w-5" aria-hidden="true" />
          Play
        </Link>
        <Link to="/profile" className={tabClass(onProfile)}>
          <ProfileIcon className="h-5 w-5" aria-hidden="true" />
          Profile
        </Link>
      </div>
    </nav>
  );
}
