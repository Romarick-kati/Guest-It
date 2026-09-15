import { NavLink } from "react-router-dom";
import { icons } from "../components/ui/icons";

const PlayIcon = icons.controller;
const ProfileIcon = icons.user;

const TABS = [
  { to: "/games", label: "Play", icon: PlayIcon },
  { to: "/profile", label: "Profile", icon: ProfileIcon }
];

const tabClass = ({ isActive }) =>
  `flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${
    isActive ? "text-[var(--color-accent)]" : "text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)]"
  }`;

/**
 * Mobile-only tab bar so players always have a one-tap way back to the
 * games list and to their profile - the desktop layout already covers
 * both via the top header (logo + avatar), so this stays hidden at sm+.
 */
export default function PlayerBottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 h-14 bg-[var(--color-surface)]/95 backdrop-blur border-t border-[var(--color-border)]"
    >
      <div className="grid grid-cols-2 h-full max-w-6xl mx-auto">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={tabClass}>
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
