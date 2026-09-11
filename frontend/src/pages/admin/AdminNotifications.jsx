import { useEffect, useMemo, useState } from "react";
import { fetchNotifications } from "../../lib/api";
import { TableSkeleton } from "../../components/ui/Skeleton";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import Badge from "../../components/ui/Badge";
import { icons } from "../../components/ui/icons";

const CATEGORIES = [
  { value: "ALL", label: "All" },
  { value: "SYSTEM", label: "System" },
  { value: "GAME", label: "Game" },
  { value: "PAYMENT", label: "Payment" },
  { value: "USER", label: "User activity" },
];

const CATEGORY_TONE = { SYSTEM: "neutral", GAME: "accent", PAYMENT: "success", USER: "info" };

export default function AdminNotifications() {
  const [status, setStatus] = useState("loading");
  const [notifications, setNotifications] = useState([]);
  const [category, setCategory] = useState("ALL");

  const load = async () => {
    setStatus("loading");
    try {
      setNotifications(await fetchNotifications());
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => notifications.filter((n) => category === "ALL" || n.category === category),
    [notifications, category]
  );

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div>
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Notifications</h2>
        <p className="text-sm text-[var(--color-ink-muted)]">System, game, payment and user activity in one place</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scroll-thin">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              category === c.value
                ? "bg-[var(--color-ink)] text-[var(--color-bg)] border-[var(--color-ink)]"
                : "border-[var(--color-border-strong)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {status === "loading" && <TableSkeleton cols={2} rows={5} />}
      {status === "error" && <ErrorState onRetry={load} />}
      {status === "success" && filtered.length === 0 && (
        <EmptyState title="No notifications" description="You're all caught up." />
      )}
      {status === "success" && filtered.length > 0 && (
        <div className="rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)] overflow-hidden">
          {filtered.map((n) => (
            <div key={n.id} className="flex items-start gap-3 px-5 py-4 bg-[var(--color-surface)]">
              <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${n.read ? "bg-transparent border border-[var(--color-border-strong)]" : "bg-[var(--color-accent)]"}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone={CATEGORY_TONE[n.category] || "neutral"}>{n.category}</Badge>
                  <span className="text-xs text-[var(--color-ink-faint)]">{n.time}</span>
                </div>
                <p className="text-sm text-[var(--color-ink)] mt-1">{n.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
