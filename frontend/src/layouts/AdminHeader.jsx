import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { icons } from "../components/ui/icons";
import Dropdown, { DropdownItem } from "../components/ui/Dropdown";
import Badge from "../components/ui/Badge";
import { useTheme } from "../context/ThemeContext";
import { fetchNotifications } from "../lib/api";
import { getSession, signOut } from "../lib/auth";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];

export default function AdminHeader({ title, onMenuClick }) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [language, setLanguage] = useState("en");
  const admin = getSession()?.user;

  const handleLogOut = () => {
    signOut();
    navigate("/signin", { replace: true });
  };

  useEffect(() => {
    fetchNotifications().then(setNotifications).catch(() => {});
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches);

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 sm:px-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur">
      <button
        className="lg:hidden text-[var(--color-ink-muted)] p-1 -ml-1"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <icons.menu className="h-5 w-5" />
      </button>

      <h1 className="font-display font-semibold text-[var(--color-ink)] shrink-0">{title}</h1>

      {/* Search - hidden on small screens to avoid crowding */}
      <div className="hidden md:flex flex-1 max-w-sm ml-4">
        <div className="relative w-full">
          <icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-ink-faint)]" />
          <input
            type="search"
            placeholder="Search games, users, transactions..."
            className="w-full h-9 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] text-sm pl-9 pr-3 placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)]"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Notifications */}
        <Dropdown
          trigger={
            <span className="relative h-9 w-9 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)]">
              <icons.bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--color-danger)]" />
              )}
            </span>
          }
          panelClassName="w-80"
        >
          <div className="px-3.5 py-2 flex items-center justify-between border-b border-[var(--color-border)]">
            <p className="text-sm font-medium text-[var(--color-ink)]">Notifications</p>
            {unreadCount > 0 && <Badge tone="info">{unreadCount} new</Badge>}
          </div>
          <div className="max-h-72 overflow-y-auto scroll-thin">
            {notifications.slice(0, 5).map((n) => (
              <div key={n.id} className="px-3.5 py-2.5 flex items-start gap-2 hover:bg-[var(--color-surface-muted)]">
                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${n.read ? "bg-transparent" : "bg-[var(--color-accent)]"}`} />
                <div>
                  <p className="text-sm text-[var(--color-ink)]">{n.text}</p>
                  <p className="text-xs text-[var(--color-ink-faint)] mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/admin/notifications"
            className="block text-center text-sm font-medium text-[var(--color-accent)] px-3.5 py-2.5 border-t border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"
          >
            View all notifications
          </Link>
        </Dropdown>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Toggle theme"
          className="h-9 w-9 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)]"
        >
          {isDark ? <icons.sun className="h-4.5 w-4.5" /> : <icons.moon className="h-4.5 w-4.5" />}
        </button>

        {/* Language selector */}
        <Dropdown
          trigger={
            <span className="h-9 px-2.5 rounded-lg flex items-center gap-1 text-sm font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)]">
              <icons.globe className="h-4 w-4" />
              {language.toUpperCase()}
            </span>
          }
        >
          {LANGUAGES.map((l) => (
            <DropdownItem key={l.code} onClick={() => setLanguage(l.code)}>
              <span className={l.code === language ? "font-medium text-[var(--color-accent)]" : ""}>{l.label}</span>
            </DropdownItem>
          ))}
        </Dropdown>

        {/* Profile menu */}
        <Dropdown
          trigger={
            <span className="h-9 w-9 rounded-full bg-[var(--color-surface-sunken)] flex items-center justify-center text-xs font-medium text-[var(--color-ink-muted)] ml-1">
              A
            </span>
          }
        >
          <div className="px-3.5 py-2.5 border-b border-[var(--color-border)]">
            <p className="text-sm font-medium text-[var(--color-ink)]">{admin?.fullName || "Admin"}</p>
            <p className="text-xs text-[var(--color-ink-muted)]">{admin?.email || "admin@onpoint.app"}</p>
          </div>
          <DropdownItem onClick={() => navigate("/admin/settings")}>Edit profile</DropdownItem>
          <DropdownItem onClick={() => navigate("/admin/settings")}>Change password</DropdownItem>
          <DropdownItem onClick={handleLogOut} className="text-[var(--color-danger)]" icon={<icons.logout className="h-4 w-4" />}>
            Log out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
