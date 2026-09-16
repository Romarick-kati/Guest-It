import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useMatch, useNavigate } from "react-router-dom";
import Logo from "../components/ui/Logo";
import PlayerBottomNav from "./PlayerBottomNav";
import { icons } from "../components/ui/icons";
import { getSession } from "../lib/auth";
import { fetchGame, getCachedGame } from "../lib/api";

const ChevronLeftIcon = icons.chevronLeft;

export default function PlayerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const matchGameDetails = useMatch("/games/:id");
  const matchGameSubroute = useMatch("/games/:id/*");
  const focusedGameScreen = matchGameDetails || matchGameSubroute;
  const focusedGameId = matchGameDetails?.params.id;
  const isAdminAccount = Boolean(getSession()?.user?.isAdmin);

  // Mirrors AdminLayout's own guard the other way: an admin account has its
  // own dashboard and doesn't browse the player app at all, even by URL.
  useEffect(() => {
    if (isAdminAccount) {
      navigate("/admin", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminAccount]);

  // The header title needs to be reactive to the game becoming available,
  // not just a one-off cache read: GameDetails.jsx fetches the same game
  // independently, and PlayerLayout doesn't re-render when that resolves.
  // Seeding from the cache avoids a title flicker when it's already warm
  // (e.g. reached via the games list, which just fetched it).
  const [focusedGame, setFocusedGame] = useState(() => (focusedGameId ? getCachedGame(focusedGameId) : null));

  useEffect(() => {
    if (!focusedGameId) {
      setFocusedGame(null);
      return;
    }
    setFocusedGame(getCachedGame(focusedGameId) ?? null);
    let cancelled = false;
    fetchGame(focusedGameId)
      .then((game) => {
        if (!cancelled) setFocusedGame(game);
      })
      .catch(() => {
        // Header title is a nicety - GameDetails.jsx's own fetch already
        // surfaces a real error state for the page itself.
      });
    return () => {
      cancelled = true;
    };
  }, [focusedGameId]);

  const session = getSession();
  const initial = (session?.user?.fullName || session?.user?.username || "P").trim().charAt(0).toUpperCase();

  if (isAdminAccount) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <header className={`sticky top-0 z-30 bg-[var(--color-surface)]/90 backdrop-blur border-b border-[var(--color-border)] ${focusedGameScreen ? "shadow-sm" : ""}`}>
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-2 ${focusedGameScreen ? "h-12" : "h-16"}`}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {matchGameDetails ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/games")}
                  aria-label="Go back"
                  title="Go back"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)] transition-colors -ml-1.5"
                >
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                {focusedGame && (
                  <p className="min-w-0 truncate font-display text-sm font-bold text-[var(--color-ink)]">
                    {focusedGame.title}
                  </p>
                )}
              </>
            ) : (
              <Link to="/games" className="flex items-center gap-2">
                <Logo variant="badge" size={focusedGameScreen ? 30 : 34} />
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/profile"
              aria-label="Your profile"
              title="Your profile"
              className={`${focusedGameScreen ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm"} rounded-full bg-[var(--color-surface-sunken)] flex items-center justify-center font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)] transition-colors`}
            >
              {initial}
            </Link>
          </div>
        </div>
      </header>

      <main className={`flex-1 ${focusedGameScreen ? "" : "pb-14 sm:pb-0"}`}>
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </main>

      {!focusedGameScreen && (
        <footer className="hidden sm:block border-t border-[var(--color-border)] py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-center gap-3 text-xs text-[var(--color-ink-faint)]">
            <span>ON Point | Guess it and more games coming soon</span>
            <span>|</span>
            <Link to="/admin" className="hover:text-[var(--color-ink-muted)] hover:underline">
              Admin dashboard
            </Link>
          </div>
        </footer>
      )}

      {!focusedGameScreen && <PlayerBottomNav />}
    </div>
  );
}
