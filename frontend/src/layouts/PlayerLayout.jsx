import { Link, Outlet, useLocation, useMatch } from "react-router-dom";
import Logo from "../components/ui/Logo";
import PlayerBottomNav from "./PlayerBottomNav";
import { getSession } from "../lib/auth";

export default function PlayerLayout() {
  const location = useLocation();
  const matchGameDetails = useMatch("/games/:id");
  const matchGameSubroute = useMatch("/games/:id/*");
  const focusedGameScreen = matchGameDetails || matchGameSubroute;
  const session = getSession();
  const initial = (session?.user?.fullName || session?.user?.username || "P").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <header className={`sticky top-0 z-30 bg-[var(--color-surface)]/90 backdrop-blur border-b border-[var(--color-border)] ${focusedGameScreen ? "shadow-sm" : ""}`}>
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between ${focusedGameScreen ? "h-12" : "h-16"}`}>
          <Link to="/games" className="flex items-center gap-2">
            <Logo variant="badge" size={focusedGameScreen ? 30 : 34} />
          </Link>
          <div className="flex items-center gap-3">
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
