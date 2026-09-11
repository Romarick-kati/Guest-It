import { forwardRef } from "react";

const VARIANTS = {
  primary:
    "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] hover:shadow-lg hover:shadow-[var(--color-accent)]/25 disabled:opacity-40 disabled:hover:shadow-none",
  secondary:
    "bg-[var(--color-ink)] text-[var(--color-bg)] hover:opacity-90 hover:shadow-lg hover:shadow-black/10 disabled:opacity-40 disabled:hover:shadow-none",
  outline:
    "bg-transparent text-[var(--color-ink)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)] hover:border-[var(--color-ink-faint)] disabled:opacity-40",
  ghost:
    "bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40",
  danger:
    "bg-[var(--color-danger)] text-white hover:opacity-90 hover:shadow-lg hover:shadow-[var(--color-danger)]/25 disabled:opacity-40 disabled:hover:shadow-none",
  link: "bg-transparent text-[var(--color-accent)] hover:underline p-0 h-auto",
};

const SIZES = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-11 px-4 text-sm rounded-lg",
  lg: "h-13 px-6 text-base rounded-xl",
};

/**
 * Reusable Button. Use `loading` to show a spinner + disable interaction.
 */
const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      leftIcon = null,
      rightIcon = null,
      fullWidth = false,
      className = "",
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ease-out disabled:cursor-not-allowed active:scale-[0.97] active:duration-100 ${variant !== "link" ? "active:shadow-none" : ""} ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin motion-reduce:animate-none"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {!loading && leftIcon}
        <span>{children}</span>
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
