import { forwardRef, useId } from "react";

const Input = forwardRef(
  (
    {
      label,
      hint,
      error,
      prefix,
      suffix,
      className = "",
      containerClassName = "",
      id,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = id || autoId;
    return (
      <div className={containerClassName}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-ink)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-sm text-[var(--color-ink-muted)]">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={`w-full h-11 rounded-lg border bg-[var(--color-surface)] text-[var(--color-ink)] text-sm px-3.5 placeholder:text-[var(--color-ink-faint)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] disabled:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed ${
              error ? "border-[var(--color-danger)]" : "border-[var(--color-border-strong)]"
            } ${prefix ? "pl-9" : ""} ${suffix ? "pr-9" : ""} ${className}`}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-sm text-[var(--color-ink-muted)]">
              {suffix}
            </span>
          )}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-[var(--color-danger)]">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-[var(--color-ink-muted)]">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
