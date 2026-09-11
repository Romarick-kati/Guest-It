const TONES = {
  neutral: "bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)]",
  accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  live: "bg-[var(--color-live-soft)] text-[var(--color-live)]",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  danger: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
  info: "bg-[var(--color-info-soft)] text-[var(--color-info)]",
};

export default function Badge({ children, tone = "neutral", dot = false, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${tone === "live" ? "animate-pulse-dot" : ""}`}
          style={{ backgroundColor: "currentColor" }}
        />
      )}
      {children}
    </span>
  );
}
