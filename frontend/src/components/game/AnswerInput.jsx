export default function AnswerInput({
  value,
  onChange,
  placeholder = "Enter your estimate",
  unit,
  error,
  disabled = false,
  loading = false,
  className = "",
}) {
  return (
    <div className={className}>
      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min="0"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || loading}
          aria-invalid={!!error}
          aria-label="Your estimate"
          className={`w-full h-16 rounded-2xl border bg-[var(--color-surface)] text-center text-3xl font-display font-semibold text-[var(--color-ink)] tabular-nums placeholder:text-[var(--color-ink-faint)] placeholder:text-lg placeholder:font-sans placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] disabled:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed transition-colors ${
            error ? "border-[var(--color-danger)]" : "border-[var(--color-border-strong)]"
          }`}
        />
        {unit && value !== "" && value != null && (
          <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-sm text-[var(--color-ink-muted)]">
            {unit}
          </span>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-center text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}
