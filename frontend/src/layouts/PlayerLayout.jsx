import { Link, Outlet, useLocation, useMatch } from "react-router-dom";
import Logo from "../components/ui/Logo";

export default function PlayerLayout() {
  const location = useLocation();
  const focusedGameScreen = useMatch("/games/:id") || useMatch("/games/:id/*");

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <header className={`sticky top-0 z-30 bg-[var(--color-surface)]/90 backdrop-blur border-b border-[var(--color-border)] ${focusedGameScreen ? "shadow-sm" : ""}`}>
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between ${focusedGameScreen ? "h-12" : "h-16"}`}>
          <Link to="/games" className="flex items-center gap-2">
            <Logo variant="badge" size={focusedGameScreen ? 30 : 34} />
          </Link>
          <div className="flex items-center gap-3">
            <div className={`${focusedGameScreen ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm"} rounded-full bg-[var(--color-surface-sunken)] flex items-center justify-center font-medium text-[var(--color-ink-muted)]`}>
              P
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </main>

      {!focusedGameScreen && (
        <footer className="border-t border-[var(--color-border)] py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-center gap-3 text-xs text-[var(--color-ink-faint)]">
            <span>ON Point | Guess it and more games coming soon</span>
            <span>|</span>
            <Link to="/admin" className="hover:text-[var(--color-ink-muted)] hover:underline">
              Admin dashboard
            </Link>
          </div>
        </footer>
      )}
    </div>
  );
}
