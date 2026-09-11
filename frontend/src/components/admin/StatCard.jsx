export default function StatCard({ label, value, icon, change, description, className = "" }) {
  const isPositive = typeof change === "number" ? change >= 0 : undefined;
  return (
    <div className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 hover-lift ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--color-ink-muted)]">{label}</p>
        {icon && (
          <div className="h-8 w-8 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      <p className="font-display text-2xl font-semibold text-[var(--color-ink)] mt-2">{value}</p>
      {(change != null || description) && (
        <p className="text-xs mt-1 flex items-center gap-1.5">
          {change != null && (
            <span className={isPositive ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}>
              {isPositive ? "▲" : "▼"} {Math.abs(change)}%
            </span>
          )}
          {description && <span className="text-[var(--color-ink-faint)]">{description}</span>}
        </p>
      )}
    </div>
  );
}
