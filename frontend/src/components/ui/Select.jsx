import { forwardRef, useId } from "react";

const Select = forwardRef(
  ({ label, hint, error, options = [], className = "", containerClassName = "", id, placeholder, ...props }, ref) => {
    const autoId = useId();
    const selectId = id || autoId;
    return (
      <div className={containerClassName}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            className={`w-full h-11 rounded-lg border bg-[var(--color-surface)] text-[var(--color-ink)] text-sm pl-3.5 pr-9 appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] disabled:bg-[var(--color-surface-muted)] ${
              error ? "border-[var(--color-danger)]" : "border-[var(--color-border-strong)]"
            } ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-ink-muted)]"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {error ? (
          <p className="mt-1.5 text-sm text-[var(--color-danger)]">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-sm text-[var(--color-ink-muted)]">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
