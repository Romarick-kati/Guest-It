export default function PaymentCard({ label, description, icon, selected, onSelect, className = "" }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full flex items-center gap-3 text-left px-4 py-3.5 rounded-xl border transition-colors ${
        selected
          ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
          : "border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)]"
      } ${className}`}
    >
      <div
        className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center ${
          selected ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)]"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-[var(--color-ink)]">{label}</p>
        {description && <p className="text-xs text-[var(--color-ink-muted)]">{description}</p>}
      </div>
      <div
        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          selected ? "border-[var(--color-accent)]" : "border-[var(--color-border-strong)]"
        }`}
      >
        {selected && <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" />}
      </div>
    </button>
  );
}
