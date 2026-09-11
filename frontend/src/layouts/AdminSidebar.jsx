import { NavLink } from "react-router-dom";
import { ADMIN_NAV } from "./adminNav";
import { icons } from "../components/ui/icons";
import Logo from "../components/ui/Logo";

export default function AdminSidebar({ onNavigate }) {
  return (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-[var(--color-border)]">
        <Logo variant="badge" size={30} />
        <p className="text-[10px] uppercase tracking-wide text-[var(--color-ink-faint)]">Admin</p>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {ADMIN_NAV.map((item) => {
          const Icon = icons[item.icon];
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
                }`
              }
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-[var(--color-surface-sunken)] flex items-center justify-center text-xs font-medium text-[var(--color-ink-muted)]">
            A
          </div>
          <div className="text-sm">
            <p className="font-medium text-[var(--color-ink)]">Admin</p>
            <p className="text-xs text-[var(--color-ink-muted)]">admin@onpoint.app</p>
          </div>
        </div>
      </div>
    </div>
  );
}
